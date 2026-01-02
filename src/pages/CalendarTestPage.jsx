import { useState, useEffect } from 'react';
import './CalendarTestPage.css';

const CalendarTestPage = () => {
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generar fechas de prueba para los próximos lunes
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    // Buscar los próximos 8 lunes
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Si es lunes (1)
      if (date.getDay() === 1) {
        dates.push(date.toISOString().split('T')[0]);
      }

      if (dates.length >= 8) break;
    }

    return dates;
  };

  const availableDates = getAvailableDates();

  const isDateAvailable = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availableDates.includes(dateStr);
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    // Días del mes anterior
    const firstDayOfWeek = firstDay.getDay();
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    for (let i = daysFromPrevMonth; i > 0; i--) {
      const date = new Date(year, month, -i + 1);
      days.push({ date, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Días del mes siguiente
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
    setSelectedStartDate(dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = getDaysInMonth();
  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="calendar-test-page">
      <div className="test-header">
        <h1>Test de Calendario</h1>
        <p>Verificar alineación de días de la semana con fechas</p>
      </div>

      <div className="test-content">
        <div className="start-date-selector">
          <div className="calendar-header">
            <h3>📅 Selecciona la fecha de inicio</h3>
            <p className="calendar-description">
              Selecciona cuándo quieres comenzar tus clases de <strong>Acrílico</strong>
              <br />
              Horario: <strong>10:00 - 12:00</strong>
            </p>
          </div>

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
              {/* Nombres de los días */}
              <div className="date-calendar-weekdays">
                <div>Lun</div>
                <div>Mar</div>
                <div>Mié</div>
                <div>Jue</div>
                <div>Vie</div>
                <div>Sáb</div>
                <div>Dom</div>
              </div>

              {/* Días del mes */}
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
      </div>

      {selectedStartDate && (
        <div className="debug-info">
          <h3>Fecha seleccionada (debug):</h3>
          <p>{selectedStartDate}</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
            Los lunes están marcados como disponibles
          </p>
        </div>
      )}
    </div>
  );
};

export default CalendarTestPage;
