import { useState, useEffect } from 'react';

const EditableClassList = ({ classDates, availableDates, selectedSchedules, onClassDatesChange, onValidationChange }) => {
  const [expandedClass, setExpandedClass] = useState(null);

  // Detectar fechas duplicadas
  const findDuplicates = () => {
    const dateCount = {};
    const duplicates = new Set();
    classDates.forEach((date, index) => {
      if (!dateCount[date]) dateCount[date] = [];
      dateCount[date].push(index);
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

  const getAvailableDatesForDay = () => {
    if (!availableDates || availableDates.length === 0) return [];

    const today = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    return availableDates
      .map(d => d.date || d)
      .filter(dateStr => {
        const date = new Date(dateStr + 'T00:00:00');
        return date >= today && date <= oneMonthFromNow;
      })
      .sort((a, b) => new Date(a) - new Date(b));
  };

  const availableDatesForDay = getAvailableDatesForDay();

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

  const getTimeSlotForDate = (dateStr) => {
    if (!selectedSchedules || selectedSchedules.length === 0) return null;

    // Si solo hay un horario, usarlo para todas las fechas
    if (selectedSchedules.length === 1) {
      return selectedSchedules[0]?.timeSlot || null;
    }

    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay(); // 0=domingo, 1=lunes, etc.

    const dayMap = {
      0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
      4: 'thursday', 5: 'friday', 6: 'saturday'
    };

    const dayName = dayMap[dayOfWeek];
    const schedule = selectedSchedules.find(s =>
      s.dayOfWeek?.toLowerCase() === dayName
    );

    // Si no encuentra por día, devolver el primer horario disponible
    return schedule?.timeSlot || selectedSchedules[0]?.timeSlot || null;
  };

  return (
    <div className="editable-list">
      {hasDuplicates && (
        <div className="edit-warning">
          Hay fechas duplicadas. Por favor, ajústalas antes de continuar.
        </div>
      )}

      <div className="edit-classes">
        {classDates.map((date, index) => {
          const isExpanded = expandedClass === index;
          const isDuplicate = duplicateIndices.has(index);
          const { day, month, weekday } = formatDateShort(date);
          const timeSlot = getTimeSlotForDate(date);

          return (
            <div key={index} className={`edit-class-row ${isDuplicate ? 'duplicate' : ''}`}>
              <div className="edit-class-info">
                <span className="edit-class-number">Clase {index + 1}</span>
                <span className="edit-class-date">{weekday} {day} {month}</span>
                {timeSlot && <span className="edit-class-time">{timeSlot}</span>}
              </div>
              <button
                type="button"
                className="edit-class-btn"
                onClick={() => setExpandedClass(isExpanded ? null : index)}
              >
                {isExpanded ? 'Cancelar' : 'Cambiar'}
              </button>

              {isExpanded && (
                <div className="edit-dates-options">
                  {(() => {
                    const currentDateObj = new Date(date + 'T00:00:00');
                    const currentDayOfWeek = currentDateObj.getDay();
                    const isCurrentSaturday = currentDayOfWeek === 6;

                    // Filtrar fechas según el tipo de día
                    const filteredDates = availableDatesForDay.filter(availableDate => {
                      const availableDateObj = new Date(availableDate + 'T00:00:00');
                      const availableDayOfWeek = availableDateObj.getDay();
                      const isAvailableSaturday = availableDayOfWeek === 6;

                      // Si es sábado, solo mostrar sábados
                      // Si es día de semana, solo mostrar días de semana (lun-vie)
                      if (isCurrentSaturday) {
                        return isAvailableSaturday;
                      } else {
                        return availableDayOfWeek >= 1 && availableDayOfWeek <= 5;
                      }
                    });

                    if (filteredDates.length === 0) {
                      return <span className="no-dates">No hay fechas disponibles</span>;
                    }

                    return filteredDates.map((availableDate) => {
                      const isCurrentDate = availableDate === date;
                      const isPast = new Date(availableDate) < new Date(new Date().setHours(0, 0, 0, 0));
                      const isAlreadySelected = !isCurrentDate && classDates.includes(availableDate);
                      const isDisabled = isPast || isAlreadySelected;
                      const { day: d, month: m, weekday: w } = formatDateShort(availableDate);
                      const timeSlotOption = getTimeSlotForDate(availableDate);

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
    </div>
  );
};

export default EditableClassList;
