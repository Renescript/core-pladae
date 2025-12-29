import { useState } from 'react';
import './StartDateSelector.css';

/**
 * Componente para mostrar un calendario con las fechas de clases según el plan seleccionado
 */
const ClassPreviewCalendar = ({ classDates, startDate }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Iniciar en el mes de la fecha de inicio
    if (startDate) {
      return new Date(startDate + 'T00:00:00');
    }
    return new Date();
  });

  // Verifica si una fecha es una clase programada
  const isClassDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return classDates.some(d => d === dateStr);
  };

  // Verifica si una fecha es la fecha de inicio
  const isStartDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return dateStr === startDate;
  };

  // Genera los días del mes actual para mostrar en el calendario
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    // Días del mes anterior para completar la primera semana
    const firstDayOfWeek = firstDay.getDay();
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Lunes = 0

    for (let i = daysFromPrevMonth; i > 0; i--) {
      const date = new Date(year, month, -i + 1);
      days.push({ date, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Días del mes siguiente para completar la última semana
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        days.push({ date, isCurrentMonth: false });
      }
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = getDaysInMonth();
  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Contar cuántas clases hay en total
  const totalClasses = classDates.length;

  return (
    <div className="start-date-selector">
      <div className="calendar-header">
        <h3>📅 Vista previa de tus clases</h3>
        <p className="calendar-description">
          <strong>{totalClasses}</strong> clases programadas comenzando el{' '}
          <strong>
            {new Date(startDate + 'T00:00:00').toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </strong>
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

        <div className="calendar-grid">
          {/* Nombres de los días */}
          <div className="calendar-weekdays">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
            <div>Dom</div>
          </div>

          {/* Días del mes */}
          <div className="calendar-days">
            {days.map((dayObj, index) => {
              const isClass = dayObj.isCurrentMonth && isClassDate(dayObj.date);
              const isStart = dayObj.isCurrentMonth && isStartDate(dayObj.date);
              const isPast = dayObj.date < new Date(new Date().setHours(0, 0, 0, 0));

              // Encontrar el número de clase
              let classNumber = null;
              if (isClass) {
                const dateStr = dayObj.date.toISOString().split('T')[0];
                classNumber = classDates.findIndex(d => d === dateStr) + 1;
              }

              return (
                <div
                  key={index}
                  className={`calendar-day
                    ${!dayObj.isCurrentMonth ? 'other-month' : ''}
                    ${isClass ? 'class-date' : ''}
                    ${isStart ? 'start-date' : ''}
                    ${isPast && !isClass ? 'past' : ''}
                  `}
                >
                  <span className="day-number">{dayObj.date.getDate()}</span>
                  {isClass && classNumber && (
                    <span className="class-badge">Clase {classNumber}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-color start-date-color"></span>
            <span className="legend-text">Fecha de inicio</span>
          </div>
          <div className="legend-item">
            <span className="legend-color class-date-color"></span>
            <span className="legend-text">Clases programadas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassPreviewCalendar;
