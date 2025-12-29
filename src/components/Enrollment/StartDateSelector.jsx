import { useState, useEffect } from 'react';
import { getSectionCalendar } from '../../services/api';
import './StartDateSelector.css';

/**
 * Componente para seleccionar la fecha de inicio de las clases
 * Muestra un calendario con las fechas disponibles según el horario seleccionado
 */
const StartDateSelector = ({
  selectedSchedule,
  selectedStartDate,
  onSelectStartDate,
  onAvailableDatesLoad // Callback para pasar las fechas disponibles
}) => {
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Cargar fechas disponibles desde el backend
  useEffect(() => {
    const loadAvailableDates = async () => {
      if (!selectedSchedule?.section?.id) return;

      try {
        setLoading(true);
        setError(null);

        console.log('📅 Cargando fechas disponibles para sección:', selectedSchedule.section.id);
        const dates = await getSectionCalendar(selectedSchedule.section.id);

        // Filtrar solo las fechas que coinciden con el día de la semana seleccionado
        const targetDay = getDayOfWeek(selectedSchedule.day);
        const filteredDates = dates.filter(dateObj => {
          const date = new Date(dateObj.date + 'T00:00:00');
          return date.getDay() === targetDay;
        });

        console.log('📅 Fechas disponibles filtradas:', filteredDates);
        setAvailableDates(filteredDates);

        // Pasar las fechas disponibles al componente padre si hay callback
        if (onAvailableDatesLoad) {
          onAvailableDatesLoad(filteredDates);
        }
      } catch (err) {
        console.error('Error al cargar fechas disponibles:', err);
        setError('No se pudieron cargar las fechas disponibles');
        if (onAvailableDatesLoad) {
          onAvailableDatesLoad([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadAvailableDates();
  }, [selectedSchedule?.section?.id, selectedSchedule?.day]); // Remover onAvailableDatesLoad para evitar loop infinito

  // Convierte el nombre del día en inglés a número (0=domingo, 1=lunes, etc.)
  const getDayOfWeek = (dayName) => {
    const days = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };
    return days[dayName?.toLowerCase()] ?? 1;
  };

  // Verifica si una fecha está disponible
  const isDateAvailable = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availableDates.some(d => d.date === dateStr);
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

  const handleDateClick = (date) => {
    if (!isDateAvailable(date)) return;

    const dateStr = date.toISOString().split('T')[0];
    onSelectStartDate(dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  if (!selectedSchedule) {
    return (
      <div className="start-date-selector">
        <div className="calendar-header">
          <h3>📅 Selecciona la fecha de inicio</h3>
          <p className="info-message">Primero selecciona un horario arriba para ver las fechas disponibles</p>
        </div>
        <div className="calendar-placeholder">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <line x1="8" y1="14" x2="8" y2="14"></line>
            <line x1="12" y1="14" x2="12" y2="14"></line>
            <line x1="16" y1="14" x2="16" y2="14"></line>
            <line x1="8" y1="18" x2="8" y2="18"></line>
            <line x1="12" y1="18" x2="12" y2="18"></line>
            <line x1="16" y1="18" x2="16" y2="18"></line>
          </svg>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="start-date-selector">
        <div className="loading-dates">
          <div className="spinner"></div>
          <p>Cargando fechas disponibles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="start-date-selector">
        <div className="error-dates">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth();
  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const dayName = selectedSchedule.day ?
    currentMonth.toLocaleDateString('es-ES', { weekday: 'long' }).charAt(0).toUpperCase() +
    currentMonth.toLocaleDateString('es-ES', { weekday: 'long' }).slice(1) : '';

  return (
    <div className="start-date-selector">
      <div className="calendar-header">
        <h3>📅 Selecciona la fecha de inicio</h3>
        <p className="calendar-description">
          Selecciona cuándo quieres comenzar tus clases de <strong>{selectedSchedule.course?.name}</strong>
          <br />
          Horario: <strong>{selectedSchedule.startTime} - {selectedSchedule.endTime}</strong>
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
              const isAvailable = dayObj.isCurrentMonth && isDateAvailable(dayObj.date);
              const isSelected = selectedStartDate === dayObj.date.toISOString().split('T')[0];
              const isPast = dayObj.date < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <button
                  key={index}
                  className={`calendar-day
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

        {availableDates.length === 0 && !loading && (
          <div className="no-dates-message">
            <p>No hay fechas disponibles para este horario en los próximos meses.</p>
          </div>
        )}

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
  );
};

export default StartDateSelector;
