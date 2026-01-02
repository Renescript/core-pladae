import { useState, useEffect } from 'react';
import { getSectionCalendar } from '../../services/api';
import './SimplifiedTechniqueSelector.css';
import './SimplifiedDateTimeSelector.css';
import './StartDateSelector.css';

const SimplifiedDateTimeSelector = ({
  technique,
  selectedDays,
  selectedStartDate,
  selectedTimeSlot,
  onStartDateChange,
  onTimeSlotChange,
  onAvailableDatesChange,
  onContinue,
  onBack
}) => {
  const [allAvailableDates, setAllAvailableDates] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Cargar fechas de TODAS las secciones de la técnica
  useEffect(() => {
    const loadAllDates = async () => {
      if (!technique?.schedules || technique.schedules.length === 0) return;

      try {
        setLoading(true);
        console.log('📅 Cargando fechas de todas las secciones de:', technique.name);

        // Obtener todas las fechas de todas las secciones
        const allDatesPromises = technique.schedules.map(schedule =>
          getSectionCalendar(schedule.section.id)
            .then(dates => ({
              sectionId: schedule.section.id,
              day: schedule.day,
              dates: dates
            }))
            .catch(err => {
              console.error(`Error al cargar fechas de sección ${schedule.section.id}:`, err);
              return { sectionId: schedule.section.id, day: schedule.day, dates: [] };
            })
        );

        const allSectionDates = await Promise.all(allDatesPromises);
        console.log('📅 Fechas de todas las secciones:', allSectionDates);

        // Combinar todas las fechas únicas
        const uniqueDates = new Set();
        allSectionDates.forEach(section => {
          section.dates.forEach(dateObj => {
            uniqueDates.add(dateObj.date);
          });
        });

        const datesList = Array.from(uniqueDates).map(date => ({ date }));
        console.log('📅 Fechas únicas disponibles:', datesList);
        setAllAvailableDates(datesList);
      } catch (err) {
        console.error('Error al cargar fechas:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAllDates();
  }, [technique]);

  // Exponer availableDates al padre
  useEffect(() => {
    if (onAvailableDatesChange && allAvailableDates.length > 0) {
      onAvailableDatesChange(allAvailableDates);
    }
  }, [allAvailableDates, onAvailableDatesChange]);

  // Cuando se selecciona una fecha, filtrar horarios por día de la semana
  useEffect(() => {
    if (!selectedStartDate || !technique?.schedules) {
      setAvailableTimeSlots([]);
      return;
    }

    const selectedDate = new Date(selectedStartDate + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay();

    // Convertir número a nombre del día
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];

    console.log('📅 Fecha seleccionada:', selectedStartDate);
    console.log('📅 Día de la semana:', dayName, `(${dayOfWeek})`);

    // Filtrar schedules que coincidan con este día
    const matchingSchedules = technique.schedules.filter(schedule =>
      schedule.day === dayName
    );

    console.log('📅 Horarios disponibles para', dayName + ':', matchingSchedules);

    // Convertir a formato de timeSlots
    const slots = matchingSchedules.map(schedule => ({
      id: schedule.timeSlot,
      display: schedule.timeSlot.replace('-', ' – '),
      teacher: schedule.teacher,
      places: schedule.places,
      available: schedule.available,
      section: schedule.section
    }));

    setAvailableTimeSlots(slots);
  }, [selectedStartDate, technique]);

  const handleTimeSlotClick = (slot) => {
    onTimeSlotChange(slot.id);
  };

  const handleContinue = () => {
    if (!selectedStartDate) {
      alert('⚠️ Por favor selecciona una fecha de inicio.');
      return;
    }
    if (!selectedTimeSlot) {
      alert('⚠️ Por favor selecciona un horario.');
      return;
    }
    onContinue && onContinue();
  };

  // Funciones del calendario
  const isDateAvailable = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return allAvailableDates.some(d => d.date === dateStr);
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const firstDayOfWeek = firstDay.getDay();
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    for (let i = daysFromPrevMonth; i > 0; i--) {
      const date = new Date(year, month, -i + 1);
      days.push({ date, isCurrentMonth: false });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        days.push({ date, isCurrentMonth: false });
      }
    }

    return days;
  };

  const handleDateClick = (date) => {
    if (!isDateAvailable(date)) return;
    const dateStr = date.toISOString().split('T')[0];
    onStartDateChange(dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = getDaysInMonth();
  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="simplified-step">
        <div className="loading-dates">
          <div className="spinner"></div>
          <p>Cargando fechas disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="simplified-step">
      <div className="step-progress">Paso 3 de 6</div>

      <h2 className="step-title">Elige fecha y horario</h2>

      <div className="datetime-container">
        {/* Calendario */}
        <div className="calendar-section">
          <h3 className="section-subtitle">1. Selecciona una fecha</h3>
          <div className="calendar-container">
            <div className="calendar-nav">
              <button onClick={goToPreviousMonth} className="nav-button">
                ← Anterior
              </button>
              <h4 className="current-month">{monthName}</h4>
              <button onClick={goToNextMonth} className="nav-button">
                Siguiente →
              </button>
            </div>

            <div className="date-calendar-grid">
              <div className="date-calendar-weekdays">
                <div>Lun</div>
                <div>Mar</div>
                <div>Mié</div>
                <div>Jue</div>
                <div>Vie</div>
                <div>Sáb</div>
                <div>Dom</div>
              </div>

              <div className="date-calendar-days">
                {days.map((dayObj, index) => {
                  const isAvailable = dayObj.isCurrentMonth && isDateAvailable(dayObj.date);
                  const isSelected = selectedStartDate === dayObj.date.toISOString().split('T')[0];
                  const isPast = dayObj.date < new Date(new Date().setHours(0, 0, 0, 0));

                  return (
                    <button
                      key={index}
                      className={`date-calendar-day
                        ${!dayObj.isCurrentMonth ? 'other-month' : ''}
                        ${isAvailable ? 'available' : ''}
                        ${isSelected ? 'selected' : ''}
                        ${isPast ? 'past' : ''}
                      `}
                      onClick={() => handleDateClick(dayObj.date)}
                      disabled={!isAvailable || isPast}
                    >
                      {dayObj.date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedStartDate && (
              <div className="selected-date-info">
                ✓ Fecha seleccionada: <strong>
                  {new Date(selectedStartDate + 'T00:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* Horarios */}
        <div className="timeslots-section">
          <h3 className="section-subtitle">2. Selecciona un horario</h3>

          {!selectedStartDate && (
            <div className="info-message">
              Primero selecciona una fecha para ver los horarios disponibles
            </div>
          )}

          {selectedStartDate && availableTimeSlots.length === 0 && (
            <div className="info-message">
              No hay horarios disponibles para esta fecha
            </div>
          )}

          {selectedStartDate && availableTimeSlots.length > 0 && (
            <div className="timeslots-list">
              {availableTimeSlots.map(slot => (
                <div
                  key={slot.id}
                  className={`timeslot-card ${selectedTimeSlot === slot.id ? 'selected' : ''}`}
                  onClick={() => handleTimeSlotClick(slot)}
                >
                  <div className="radio-indicator">
                    {selectedTimeSlot === slot.id && <div className="radio-dot"></div>}
                  </div>
                  <div className="timeslot-info">
                    <span className="timeslot-text">{slot.display}</span>
                    <span className="timeslot-meta">
                      Profesor: {slot.teacher} • {slot.available}/{slot.places} cupos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="step-actions-center">
        <button
          className="btn-secondary-large"
          onClick={onBack}
        >
          ← Volver
        </button>
        <button
          className="btn-primary-large"
          onClick={handleContinue}
          disabled={!selectedStartDate || !selectedTimeSlot}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default SimplifiedDateTimeSelector;
