import { useState, useEffect, useMemo } from 'react';
import { getSectionCalendar } from '../../services/api';

const MultiDayScheduleSelector = ({
  technique,
  frequency,
  selectedSchedules,
  onSchedulesChange,
  onAvailableDatesChange,
  onContinue,
  onBack
}) => {
  const [allAvailableDates, setAllAvailableDates] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState(null);
  const [tempSelectedTimeSlot, setTempSelectedTimeSlot] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  useEffect(() => {
    const loadAllDates = async () => {
      if (!technique?.schedules || technique.schedules.length === 0) return;

      try {
        setLoading(true);
        const allDatesPromises = technique.schedules.map(schedule =>
          getSectionCalendar(schedule.section.id)
            .then(dates => ({ sectionId: schedule.section.id, day: schedule.day, dates }))
            .catch(() => ({ sectionId: schedule.section.id, day: schedule.day, dates: [] }))
        );

        const allSectionDates = await Promise.all(allDatesPromises);
        const uniqueDates = new Set();
        allSectionDates.forEach(section => {
          section.dates.forEach(dateObj => uniqueDates.add(dateObj.date));
        });

        const datesList = Array.from(uniqueDates).map(date => ({ date }));
        setAllAvailableDates(datesList);
        onAvailableDatesChange && onAvailableDatesChange(datesList);
      } catch (err) {
        console.error('Error al cargar fechas:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAllDates();
  }, [technique]);

  useEffect(() => {
    if (selectedSchedules[currentDayIndex]) {
      const schedule = selectedSchedules[currentDayIndex];
      setTempSelectedDate(schedule.date || null);
      setTempSelectedTimeSlot(schedule.timeSlot || null);
    } else {
      setTempSelectedDate(null);
      setTempSelectedTimeSlot(null);
    }
  }, [currentDayIndex]);

  useEffect(() => {
    if (!tempSelectedDate || !technique?.schedules) {
      setAvailableTimeSlots([]);
      return;
    }

    const selectedDate = new Date(tempSelectedDate + 'T00:00:00');
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[selectedDate.getDay()];

    const matchingSchedules = technique.schedules.filter(schedule => schedule.day === dayName);
    const slots = matchingSchedules.map(schedule => ({
      id: schedule.timeSlot,
      display: schedule.timeSlot.replace('-', ' – '),
      teacher: schedule.teacher,
      places: schedule.places,
      available: schedule.available,
      section: schedule.section,
      dayOfWeek: dayName
    }));

    setAvailableTimeSlots(slots);
  }, [tempSelectedDate, technique]);

  // Días de la semana ya "gastados" por otros currentDayIndex (para bloquear en el calendario).
  // Cuando el plan es N×semana los N slots deben caer en días distintos.
  const usedDaysOfWeek = useMemo(() => {
    const days = new Set();
    selectedSchedules.forEach((s, idx) => {
      if (idx !== currentDayIndex && s && s.dayOfWeek && s.timeSlot) {
        days.add(s.dayOfWeek);
      }
    });
    return days;
  }, [selectedSchedules, currentDayIndex]);

  const availableDatesSet = useMemo(() => {
    return new Set(allAvailableDates.map(d => d.date));
  }, [allAvailableDates]);

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const result = [];

    const firstDayOfWeek = firstDay.getDay();
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    for (let i = daysFromPrevMonth; i > 0; i--) {
      result.push({ date: new Date(year, month, -i + 1), isCurrentMonth: false });
    }
    for (let day = 1; day <= lastDay.getDate(); day++) {
      result.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }
    const remainingDays = 7 - (result.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        result.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
      }
    }
    return result;
  }, [currentMonth]);

  const handleTimeSlotSelect = (slotId) => {
    setTempSelectedTimeSlot(slotId);

    // Guardar automáticamente al seleccionar horario
    if (!tempSelectedDate) return;

    const selectedDate = new Date(tempSelectedDate + 'T00:00:00');
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[selectedDate.getDay()];
    const selectedSlot = availableTimeSlots.find(s => s.id === slotId);

    const newSchedule = {
      dayIndex: currentDayIndex,
      date: tempSelectedDate,
      timeSlot: slotId,
      dayOfWeek: dayName,
      sectionId: selectedSlot?.section?.id,
      teacher: selectedSlot?.teacher
    };

    const updatedSchedules = [...selectedSchedules];
    updatedSchedules[currentDayIndex] = newSchedule;
    onSchedulesChange(updatedSchedules);

    // Avanzar al siguiente día automáticamente
    if (currentDayIndex < frequency - 1) {
      setTimeout(() => {
        setCurrentDayIndex(currentDayIndex + 1);
        setTempSelectedDate(null);
        setTempSelectedTimeSlot(null);
      }, 300);
    }
  };

  const handleClear = () => {
    onSchedulesChange([]);
    setCurrentDayIndex(0);
    setTempSelectedDate(null);
    setTempSelectedTimeSlot(null);
  };

  const handleContinue = () => {
    const completedCount = selectedSchedules.filter(s => s && s.date && s.timeSlot).length;
    if (completedCount < frequency) {
      alert(`Completa todos los ${frequency} días.`);
      return;
    }
    onContinue && onContinue();
  };

  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const dayLabels = {
    sunday: 'Dom',
    monday: 'Lun',
    tuesday: 'Mar',
    wednesday: 'Mié',
    thursday: 'Jue',
    friday: 'Vie',
    saturday: 'Sáb'
  };

  const dayLabelsLong = {
    sunday: 'Domingo',
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado'
  };

  const ordinalsMasc = ['primer', 'segundo', 'tercer', 'cuarto', 'quinto', 'sexto', 'séptimo'];
  const ordinalsMascFull = ['primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto', 'séptimo'];

  const formatShortDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const lastCompletedIndex = useMemo(() => {
    let last = -1;
    for (let i = 0; i < frequency; i++) {
      if (selectedSchedules[i] && selectedSchedules[i].date && selectedSchedules[i].timeSlot) {
        last = i;
      }
    }
    return last;
  }, [selectedSchedules, frequency]);

  if (loading) {
    return <div className="step-container"><p>Cargando fechas...</p></div>;
  }

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>{frequency > 1 ? 'Define tu horario' : '¿Cuándo quieres empezar?'}</h2>
        {frequency === 1 ? (
          <p className="step-description">Elige la fecha en que quieres comenzar y el horario que más te acomode.</p>
        ) : (
          <p className="step-description">Selecciona los {frequency} horarios que asistirás cada semana.</p>
        )}
      </div>

      {frequency > 1 && (
        <div className="day-progress">
          <div className="day-tabs">
            {Array.from({ length: frequency }).map((_, index) => {
              const schedule = selectedSchedules[index];
              const isCompleted = schedule && schedule.date && schedule.timeSlot;
              const isActive = index === currentDayIndex;
              return (
                <button
                  key={index}
                  type="button"
                  className={`day-tab ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => setCurrentDayIndex(index)}
                >
                  {isCompleted ? (
                    <span className="day-tab-summary">
                      <span className="tab-day">{dayLabels[schedule.dayOfWeek]} {formatShortDate(schedule.date)}</span>
                      <span className="tab-time">{schedule.timeSlot.replace('-', ' – ')}</span>
                    </span>
                  ) : (
                    <span className="day-tab-empty">
                      Horario {index + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {frequency > 1 && lastCompletedIndex >= 0 && (() => {
        const lastSchedule = selectedSchedules[lastCompletedIndex];
        const allDone = lastCompletedIndex === frequency - 1;
        const nextOrdinal = allDone ? null : ordinalsMascFull[lastCompletedIndex + 1];
        return (
          <div className="horario-confirmation" role="status" aria-live="polite">
            <span className="horario-confirmation__icon" aria-hidden="true">✓</span>
            <div className="horario-confirmation__body">
              <strong className="horario-confirmation__title">
                Ya definiste tu {ordinalsMasc[lastCompletedIndex]} horario: {dayLabelsLong[lastSchedule.dayOfWeek]} {lastSchedule.timeSlot.replace('-', ' – ')} hrs.
              </strong>
              {!allDone && (
                <span className="horario-confirmation__hint">Ahora elige el {nextOrdinal}.</span>
              )}
            </div>
          </div>
        );
      })()}

      {frequency > 1 && (
        <div className="horario-info-note">
          <span className="horario-info-note__icon" aria-hidden="true">📅</span>
          <p>
            Este horario se repetirá automáticamente cada semana.
            <br />
            <strong>{frequency} clases por semana = {frequency * 4} clases mensuales.</strong>
          </p>
        </div>
      )}

      <div className="datetime-grid">
        <div className="calendar-section">
          <h3>{frequency > 1
            ? `Selecciona la fecha de tu ${currentDayIndex === 0 ? 'primer' : currentDayIndex === 1 ? 'segundo' : currentDayIndex === 2 ? 'tercer' : `${currentDayIndex + 1}º`} horario semanal`
            : '1. Selecciona fecha'
          }</h3>
          {frequency > 1 && (
            <ul className="calendar-summary">
              {Array.from({ length: frequency }).map((_, idx) => {
                const s = selectedSchedules[idx];
                const isCurrent = idx === currentDayIndex;
                const isDone = s && s.dayOfWeek && s.timeSlot;
                let statusLabel;
                let statusText;
                if (isDone) {
                  statusLabel = 'Fijado';
                  statusText = `${dayLabelsLong[s.dayOfWeek]} ${s.timeSlot.replace('-', ' – ')} hrs.`;
                } else if (isCurrent) {
                  statusLabel = 'Paso actual';
                  statusText = 'Eligiendo en el calendario…';
                } else {
                  statusLabel = 'Pendiente';
                  statusText = null;
                }
                return (
                  <li
                    key={idx}
                    className={`calendar-summary-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                  >
                    <strong>Horario {idx + 1} ({statusLabel}){statusText ? ':' : ''}</strong>
                    {statusText && ` ${statusText}`}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="calendar-nav">
            <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
              ←
            </button>
            <span>{monthName}</span>
            <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
              →
            </button>
          </div>

          <div className="calendar-weekdays">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <span key={d}>{d}</span>)}
          </div>

          <div className="calendar-days">
            {days.map((dayObj, index) => {
              const dateStr = dayObj.date.toISOString().split('T')[0];
              const dayNameKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              const dayName = dayNameKeys[dayObj.date.getDay()];
              const isBlockedByDuplicate = frequency > 1 && usedDaysOfWeek.has(dayName);
              const isAvailable = dayObj.isCurrentMonth && availableDatesSet.has(dateStr) && !isBlockedByDuplicate;
              const isSelected = tempSelectedDate === dateStr;
              const isPast = dayObj.date < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <button
                  key={index}
                  type="button"
                  className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${isAvailable ? 'available' : ''} ${isSelected ? 'selected' : ''}`}
                  title={isBlockedByDuplicate ? 'Ya elegiste este día en otra clase semanal' : undefined}
                  onClick={() => {
                    if (!isAvailable || isPast) return;
                    setTempSelectedDate(dateStr);
                    setTempSelectedTimeSlot(null);
                    // Update schedule with date only, clear timeslot
                    const selectedDate = new Date(dateStr + 'T00:00:00');
                    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    const updatedSchedules = [...selectedSchedules];
                    // Pad array if needed
                    while (updatedSchedules.length <= currentDayIndex) updatedSchedules.push(null);
                    updatedSchedules[currentDayIndex] = {
                      dayIndex: currentDayIndex,
                      date: dateStr,
                      dayOfWeek: dayNames[selectedDate.getDay()],
                      timeSlot: null,
                      sectionId: null,
                      teacher: null
                    };
                    onSchedulesChange(updatedSchedules);
                  }}
                  disabled={!isAvailable || isPast}
                >
                  {dayObj.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className={`timeslots-section ${!tempSelectedDate ? 'disabled' : 'active'}`}>
          <h3>{frequency > 1 ? 'Selecciona horario' : '2. Selecciona horario'}</h3>
          {!tempSelectedDate && <p className="timeslot-hint">Selecciona una fecha en el calendario para ver los horarios disponibles</p>}
          {tempSelectedDate && availableTimeSlots.length === 0 && <p>No hay horarios disponibles</p>}
          {tempSelectedDate && availableTimeSlots.length > 0 && (
            <div className="timeslots-list">
              {availableTimeSlots.map(slot => (
                <button
                  key={slot.id}
                  type="button"
                  className={`timeslot-btn ${tempSelectedTimeSlot === slot.id ? 'selected' : ''}`}
                  onClick={() => handleTimeSlotSelect(slot.id)}
                >
                  {slot.display} - {slot.teacher}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>Volver</button>
        {selectedSchedules.some(s => s && (s.date || s.timeSlot)) && (
          <button type="button" className="btn-clear" onClick={handleClear}>Limpiar</button>
        )}
        <button
          type="button"
          className="btn-primary"
          onClick={handleContinue}
          disabled={selectedSchedules.filter(s => s && s.date && s.timeSlot).length < frequency}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default MultiDayScheduleSelector;
