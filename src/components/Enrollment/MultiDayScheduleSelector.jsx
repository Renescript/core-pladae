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
      setTempSelectedDate(schedule.date);
      setTempSelectedTimeSlot(schedule.timeSlot);
    } else {
      setTempSelectedDate(null);
      setTempSelectedTimeSlot(null);
    }
  }, [currentDayIndex, selectedSchedules]);

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

  const formatShortDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return <div className="step-container"><p>Cargando fechas...</p></div>;
  }

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-indicator">Paso 3 de 6</span>
        <h2>Selecciona tus fechas y horarios</h2>
      </div>

      <div className="day-progress">
        <p>Día {currentDayIndex + 1} de {frequency}</p>
        <div className="day-tabs">
          {Array.from({ length: frequency }).map((_, index) => {
            const schedule = selectedSchedules[index];
            const isCompleted = schedule && schedule.date && schedule.timeSlot;
            return (
              <button
                key={index}
                type="button"
                className={`day-tab ${index === currentDayIndex ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => setCurrentDayIndex(index)}
              >
                {isCompleted ? (
                  <span className="day-tab-summary">
                    <span className="tab-day">{dayLabels[schedule.dayOfWeek]} {formatShortDate(schedule.date)}</span>
                    <span className="tab-time">{schedule.timeSlot.replace('-', ' – ')}</span>
                  </span>
                ) : (
                  `Día ${index + 1}`
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="datetime-grid">
        <div className="calendar-section">
          <h3>1. Selecciona fecha</h3>
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
              const isAvailable = dayObj.isCurrentMonth && availableDatesSet.has(dateStr);
              const isSelected = tempSelectedDate === dateStr;
              const isPast = dayObj.date < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <button
                  key={index}
                  type="button"
                  className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${isAvailable ? 'available' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => isAvailable && !isPast && setTempSelectedDate(dateStr)}
                  disabled={!isAvailable || isPast}
                >
                  {dayObj.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="timeslots-section">
          <h3>2. Selecciona horario</h3>
          {!tempSelectedDate && <p>Primero selecciona una fecha</p>}
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
