import { useState, useEffect } from 'react';
import { getSectionCalendar } from '../../services/api';
import './TechniqueSelector.css';
import './SimplifiedDateTimeSelector.css';
import './StartDateSelector.css';
import './MultiDayScheduleSelector.css';

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

  // Estado temporal para el día actual
  const [tempSelectedDate, setTempSelectedDate] = useState(null);
  const [tempSelectedTimeSlot, setTempSelectedTimeSlot] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // Cargar fechas de TODAS las secciones de la técnica
  useEffect(() => {
    const loadAllDates = async () => {
      if (!technique?.schedules || technique.schedules.length === 0) return;

      try {
        setLoading(true);
        console.log('📅 Cargando fechas de todas las secciones de:', technique.name);

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

        const uniqueDates = new Set();
        allSectionDates.forEach(section => {
          section.dates.forEach(dateObj => {
            uniqueDates.add(dateObj.date);
          });
        });

        const datesList = Array.from(uniqueDates).map(date => ({ date }));
        console.log('📅 Fechas únicas disponibles:', datesList);
        setAllAvailableDates(datesList);

        if (onAvailableDatesChange) {
          onAvailableDatesChange(datesList);
        }
      } catch (err) {
        console.error('Error al cargar fechas:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAllDates();
  }, [technique, onAvailableDatesChange]);

  // Cargar estado del día actual desde selectedSchedules
  useEffect(() => {
    if (selectedSchedules[currentDayIndex]) {
      const schedule = selectedSchedules[currentDayIndex];
      setTempSelectedDate(schedule.date);
      setTempSelectedTimeSlot(schedule.timeSlot);
    } else {
      setTempSelectedDate(null);
      setTempSelectedTimeSlot(null);
    }
  }, [currentDayIndex, selectedSchedules]);

  // Cuando se selecciona una fecha, filtrar horarios por día de la semana
  useEffect(() => {
    if (!tempSelectedDate || !technique?.schedules) {
      setAvailableTimeSlots([]);
      return;
    }

    const selectedDate = new Date(tempSelectedDate + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay();

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];

    console.log('📅 Fecha seleccionada:', tempSelectedDate, 'Día:', dayName);

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

  const handleTimeSlotClick = (slot) => {
    setTempSelectedTimeSlot(slot.id);
  };

  const handleSaveCurrentDay = () => {
    if (!tempSelectedDate) {
      alert('⚠️ Por favor selecciona una fecha.');
      return;
    }
    if (!tempSelectedTimeSlot) {
      alert('⚠️ Por favor selecciona un horario.');
      return;
    }

    const selectedDate = new Date(tempSelectedDate + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];

    const selectedSlot = availableTimeSlots.find(s => s.id === tempSelectedTimeSlot);

    const newSchedule = {
      dayIndex: currentDayIndex,
      date: tempSelectedDate,
      timeSlot: tempSelectedTimeSlot,
      dayOfWeek: dayName,
      sectionId: selectedSlot?.section?.id,
      teacher: selectedSlot?.teacher
    };

    const updatedSchedules = [...selectedSchedules];
    updatedSchedules[currentDayIndex] = newSchedule;
    onSchedulesChange(updatedSchedules);

    // Si hay más días por completar, pasar al siguiente
    if (currentDayIndex < frequency - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
      setTempSelectedDate(null);
      setTempSelectedTimeSlot(null);
    }
  };

  const handleContinue = () => {
    if (selectedSchedules.length < frequency) {
      alert(`⚠️ Por favor completa todos los ${frequency} días.`);
      return;
    }

    // Validar que todos los días estén completos
    for (let i = 0; i < frequency; i++) {
      if (!selectedSchedules[i] || !selectedSchedules[i].date || !selectedSchedules[i].timeSlot) {
        alert(`⚠️ Por favor completa el día ${i + 1}.`);
        return;
      }
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
    setTempSelectedDate(dateStr);
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

  const currentSchedule = selectedSchedules[currentDayIndex];

  return (
    <div className="simplified-step">
      <div className="step-progress">Paso 3 de 6</div>

      <h2 className="step-title">Selecciona tus fechas y horarios</h2>

      {/* Indicador de progreso */}
      <div className="multi-day-progress">
        <div className="progress-header">
          <h3>Día {currentDayIndex + 1} de {frequency}</h3>
          <span className="progress-counter">
            {selectedSchedules.filter(s => s && s.date && s.timeSlot).length}/{frequency} completados
          </span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${(selectedSchedules.filter(s => s && s.date && s.timeSlot).length / frequency) * 100}%` }}
          />
        </div>

        {/* Navegación entre días */}
        <div className="day-tabs">
          {Array.from({ length: frequency }).map((_, index) => {
            const schedule = selectedSchedules[index];
            const isCompleted = schedule && schedule.date && schedule.timeSlot;
            const isCurrent = index === currentDayIndex;

            return (
              <button
                key={index}
                className={`day-tab ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => setCurrentDayIndex(index)}
              >
                <span className="day-tab-number">Día {index + 1}</span>
                {isCompleted && <span className="day-tab-check">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resumen del día actual si está completo */}
      {currentSchedule && currentSchedule.date && (
        <div className="current-day-summary">
          <p>
            <strong>Seleccionado:</strong> {new Date(currentSchedule.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} - {currentSchedule.timeSlot}
          </p>
        </div>
      )}

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
                  const isSelected = tempSelectedDate === dayObj.date.toISOString().split('T')[0];
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

            {tempSelectedDate && (
              <div className="selected-date-info">
                ✓ Fecha seleccionada: <strong>
                  {new Date(tempSelectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
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

          {!tempSelectedDate && (
            <div className="info-message">
              Primero selecciona una fecha para ver los horarios disponibles
            </div>
          )}

          {tempSelectedDate && availableTimeSlots.length === 0 && (
            <div className="info-message">
              No hay horarios disponibles para esta fecha
            </div>
          )}

          {tempSelectedDate && availableTimeSlots.length > 0 && (
            <div className="timeslots-list">
              {availableTimeSlots.map(slot => (
                <div
                  key={slot.id}
                  className={`timeslot-card ${tempSelectedTimeSlot === slot.id ? 'selected' : ''}`}
                  onClick={() => handleTimeSlotClick(slot)}
                >
                  <div className="radio-indicator">
                    {tempSelectedTimeSlot === slot.id && <div className="radio-dot"></div>}
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

          {tempSelectedDate && tempSelectedTimeSlot && (
            <button
              className="btn-save-day"
              onClick={handleSaveCurrentDay}
            >
              {currentDayIndex < frequency - 1
                ? `Guardar y continuar con día ${currentDayIndex + 2}`
                : 'Guardar día'}
            </button>
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
          disabled={selectedSchedules.filter(s => s && s.date && s.timeSlot).length < frequency}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default MultiDayScheduleSelector;
