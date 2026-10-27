import { useState, useEffect } from 'react';
import { getSectionCalendar } from '../../services/api';

const EditableClassList = ({
  classDates,
  classSectionIds = [],
  originalClassDates,
  selectedSchedules,
  onClassDatesChange,
  onValidationChange,
  onClose
}) => {
  const [expandedClass, setExpandedClass] = useState(null);
  const [datesBySection, setDatesBySection] = useState({});

  const lastClassDate = classDates.length > 0 ? classDates[classDates.length - 1] : null;

  // Alternativas de reprogramación POR SECCIÓN y cubriendo todo el plan.
  // Hay que pedirlas por sección (no la lista plana del paso 3) porque cada clase
  // sólo se puede mover a una fecha de SU sección; y con la ventana completa del
  // plan, porque el default del back son 3 meses y un plan de 4 no cabe.
  useEffect(() => {
    if (!selectedSchedules || selectedSchedules.length === 0) return;

    const sectionIds = [...new Set(selectedSchedules.map(s => s.sectionId).filter(Boolean))];
    if (sectionIds.length === 0) return;

    const to = new Date(`${lastClassDate || new Date().toISOString().split('T')[0]}T00:00:00`);
    to.setMonth(to.getMonth() + 1); // un mes de colchón después de la última clase

    const range = {
      from: new Date().toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    };

    let cancelled = false;
    Promise.all(
      sectionIds.map(id =>
        getSectionCalendar(id, range)
          .then(dates => ({ id, dates }))
          .catch(() => ({ id, dates: [] }))
      )
    ).then(results => {
      if (cancelled) return;
      const map = {};
      results.forEach(({ id, dates }) => {
        map[id] = dates.map(entry => entry.date || entry).filter(Boolean);
      });
      setDatesBySection(map);
    });

    return () => { cancelled = true; };
  }, [selectedSchedules, lastClassDate]);

  const original = originalClassDates && originalClassDates.length > 0
    ? originalClassDates
    : classDates;

  // Contador de recuperaciones: 1 recuperación cada 4 clases del plan
  const maxRecoveries = Math.max(1, Math.floor(classDates.length / 4));
  const usedRecoveries = classDates.reduce((acc, date, idx) => {
    return acc + (original[idx] && original[idx] !== date ? 1 : 0);
  }, 0);
  const remainingRecoveries = Math.max(0, maxRecoveries - usedRecoveries);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const isPastDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d < startOfToday;
  };

  // Clave de una clase: fecha + sección. El mismo día puede tener dos clases si son
  // de horarios distintos (ej. viernes 10:00 y viernes 12:30).
  const classKey = (date, index) => `${date}|${classSectionIds[index] ?? ''}`;

  // Detectar clases duplicadas (misma fecha en el mismo horario)
  const findDuplicates = () => {
    const dateCount = {};
    const duplicates = new Set();
    classDates.forEach((date, index) => {
      const key = classKey(date, index);
      if (!dateCount[key]) dateCount[key] = [];
      dateCount[key].push(index);
    });
    Object.entries(dateCount).forEach(([, indices]) => {
      if (indices.length > 1) indices.forEach(idx => duplicates.add(idx));
    });
    return duplicates;
  };

  const duplicateIndices = findDuplicates();
  const hasDuplicates = duplicateIndices.size > 0;

  useEffect(() => {
    if (onValidationChange) onValidationChange(!hasDuplicates);
  }, [hasDuplicates, onValidationChange]);

  // Fechas a las que se puede mover la clase `classIndex`: las de su propia sección,
  // desde hoy en adelante. Si todavía no cargó el calendario de esa sección, no
  // ofrecemos nada (mejor eso que ofrecer una fecha de otro horario).
  const getAvailableDatesForClass = (classIndex) => {
    const sectionId = classSectionIds[classIndex];
    const dates = sectionId != null ? datesBySection[sectionId] : null;
    if (!dates || dates.length === 0) return [];

    return dates
      .filter(dateStr => new Date(dateStr + 'T00:00:00') >= startOfToday)
      .sort((a, b) => new Date(a) - new Date(b));
  };

  const handleDateChange = (classIndex, newDate) => {
    const updatedDates = [...classDates];
    updatedDates[classIndex] = newDate;
    onClassDatesChange(updatedDates);
    setExpandedClass(null);
  };

  const formatDateShort = (dateStr) => {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString('es-CL', { month: 'short' }).replace('.', '');
    const weekday = dateObj.toLocaleDateString('es-CL', { weekday: 'short' }).replace('.', '');
    return { day, month, weekday };
  };

  const getTimeSlotForClass = (dateStr, classIndex) => {
    if (!selectedSchedules || selectedSchedules.length === 0) return null;

    if (selectedSchedules.length === 1) {
      return selectedSchedules[0]?.timeSlot || null;
    }

    const bySection = selectedSchedules.find(s =>
      s.sectionId != null && s.sectionId === classSectionIds[classIndex]
    );
    if (bySection) return bySection.timeSlot || null;

    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();

    const dayMap = {
      0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
      4: 'thursday', 5: 'friday', 6: 'saturday'
    };

    const dayName = dayMap[dayOfWeek];
    const schedule = selectedSchedules.find(s =>
      s.dayOfWeek?.toLowerCase() === dayName
    );

    return schedule?.timeSlot || selectedSchedules[0]?.timeSlot || null;
  };

  const noRecoveriesLeft = remainingRecoveries <= 0;

  return (
    <div className="recovery-panel">
      <header className="recovery-header">
        {onClose && (
          <button
            type="button"
            className="recovery-back"
            onClick={onClose}
            aria-label="Volver"
          >
            ←
          </button>
        )}
        <h3 className="recovery-title">Recuperar clases</h3>
        <span className="recovery-header-spacer" aria-hidden="true" />
      </header>

      <div className="recovery-info">
        <span className="recovery-info__icon" aria-hidden="true">i</span>
        <div className="recovery-info__body">
          <strong>Los cambios de fecha son únicamente para recuperar clases perdidas.</strong>
          <span>Solo puedes modificar clases futuras. Las clases pasadas no pueden modificarse.</span>
        </div>
      </div>

      <div className="recovery-counter">
        <span className="recovery-counter__icon" aria-hidden="true">⟳</span>
        <div className="recovery-counter__body">
          <strong>Recuperaciones disponibles</strong>
          <span>Has utilizado {usedRecoveries} de {maxRecoveries} recuperaciones permitidas.</span>
        </div>
        <span className={`recovery-counter__pill ${noRecoveriesLeft ? 'recovery-counter__pill--full' : ''}`}>
          {usedRecoveries} de {maxRecoveries}
        </span>
      </div>

      {hasDuplicates && (
        <div className="edit-warning">
          Hay fechas duplicadas. Por favor, ajústalas antes de continuar.
        </div>
      )}

      <p className="recovery-list-title">Selecciona la clase que deseas recuperar</p>

      <div className="recovery-classes">
        {classDates.map((date, index) => {
          const isExpanded = expandedClass === index;
          const isDuplicate = duplicateIndices.has(index);
          const past = isPastDate(date);
          const { day, month, weekday } = formatDateShort(date);
          const timeSlot = getTimeSlotForClass(date, index);
          const isChanged = original[index] && original[index] !== date;
          const canChange = !past && (!noRecoveriesLeft || isChanged);

          return (
            <div
              key={index}
              className={`recovery-class ${past ? 'recovery-class--past' : ''} ${isDuplicate ? 'recovery-class--duplicate' : ''} ${!past ? 'recovery-class--active' : ''}`}
            >
              <div className="recovery-class__label">Clase {index + 1}</div>
              <div className="recovery-class__date">
                <span className="recovery-class__weekday">{weekday} {day}</span>
                <span className="recovery-class__month">{month}</span>
              </div>
              <div className="recovery-class__time">
                {timeSlot ? timeSlot.replace('-', '–') : '—'}
              </div>
              <div className="recovery-class__action">
                {past ? (
                  <span className="recovery-class__past-tag">
                    <span aria-hidden="true">🔒</span>
                    <span>Pasada<br />No disponible</span>
                  </span>
                ) : canChange ? (
                  <button
                    type="button"
                    className="recovery-class__change-btn"
                    onClick={() => setExpandedClass(isExpanded ? null : index)}
                  >
                    {isExpanded ? 'Cancelar' : 'Cambiar'} <span aria-hidden="true">›</span>
                  </button>
                ) : (
                  <span className="recovery-class__disabled-tag" title="No te quedan recuperaciones disponibles">
                    Sin cupo
                  </span>
                )}
              </div>

              {isExpanded && (
                <div className="recovery-class__options">
                  {(() => {
                    // Alternativas de la MISMA sección de esta clase: ya vienen todas
                    // en el día de la semana correcto, así que no hay que filtrar por día
                    // (mover una clase a otro día la dejaría fuera de su sección y el
                    // back rechazaría la inscripción).
                    const filteredDates = getAvailableDatesForClass(index);

                    if (filteredDates.length === 0) {
                      return <span className="no-dates">No hay fechas disponibles</span>;
                    }

                    return filteredDates.map((availableDate) => {
                      const isCurrentDate = availableDate === date;
                      const isPast = new Date(availableDate) < startOfToday;
                      const isAlreadySelected = !isCurrentDate &&
                        classDates.some((d, i) => i !== index && classKey(d, i) === classKey(availableDate, index));
                      const isDisabled = isPast || isAlreadySelected;
                      const { day: d, month: m, weekday: w } = formatDateShort(availableDate);
                      const timeSlotOption = getTimeSlotForClass(availableDate, index);

                      return (
                        <button
                          key={availableDate}
                          type="button"
                          className={`edit-date-option ${isCurrentDate ? 'current' : ''} ${isAlreadySelected ? 'already-selected' : ''}`}
                          onClick={() => !isDisabled && handleDateChange(index, availableDate)}
                          disabled={isDisabled}
                        >
                          <span className="option-weekday">{w}</span>
                          <span className="option-day">{d}</span>
                          <span className="option-month">{m}</span>
                          {timeSlotOption && <span className="option-time">{timeSlotOption}</span>}
                        </button>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="recovery-footer-note">
        <span className="recovery-footer-note__icon" aria-hidden="true">★</span>
        <span>Al cambiar, solo verás horarios con cupos disponibles.</span>
      </div>

      {onClose && (
        <button type="button" className="recovery-close-btn" onClick={onClose}>
          Volver
        </button>
      )}
    </div>
  );
};

export default EditableClassList;
