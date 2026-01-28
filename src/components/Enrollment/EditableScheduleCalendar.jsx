const EditableScheduleCalendar = ({
  technique,
  frequency,
  weeklyPlan,
  selectedSchedules,
  durationMonths,
  classDates,
  onContinue,
  onBack
}) => {
  const totalClasses = classDates.length;

  const dayTranslations = {
    'Monday': 'Lunes',
    'Tuesday': 'Martes',
    'Wednesday': 'Miércoles',
    'Thursday': 'Jueves',
    'Friday': 'Viernes',
    'Saturday': 'Sábado',
    'Sunday': 'Domingo',
    'monday': 'Lunes',
    'tuesday': 'Martes',
    'wednesday': 'Miércoles',
    'thursday': 'Jueves',
    'friday': 'Viernes',
    'saturday': 'Sábado',
    'sunday': 'Domingo'
  };

  const translateDay = (day) => dayTranslations[day] || day;

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-indicator">Paso 5 de 6</span>
        <h2>Resumen de tus clases</h2>
      </div>

      <div className="summary-card summary-card--no-hover">
        <h3 className="summary-title">Tu plan</h3>
        <div className="summary-underline"></div>

        <div className="summary-rows">
          <div className="summary-row">
            <span className="row-label">Técnica</span>
            <span className="row-value">{technique?.name}</span>
          </div>
          <div className="summary-row">
            <span className="row-label">Frecuencia</span>
            <span className="row-value">{frequency} {frequency === 1 ? 'vez' : 'veces'} por semana</span>
          </div>
          <div className="summary-row">
            <span className="row-label">Duración</span>
            <span className="row-value">{durationMonths} {durationMonths === 1 ? 'mes' : 'meses'}</span>
          </div>
          <div className="summary-row">
            <span className="row-label">Total de clases</span>
            <span className="row-value">{totalClasses} clases</span>
          </div>
          {selectedSchedules.map((schedule, index) => (
            <div key={index} className="summary-row">
              <span className="row-label">{index === 0 ? 'Horario' : ''}</span>
              <div className="row-value schedule-value">
                <span className="schedule-main">{translateDay(schedule.dayOfWeek)} {schedule.timeSlot}</span>
                <span className="schedule-teacher">{schedule.teacher}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="summary-dates-section">
          <span className="dates-title">Fechas de tus clases</span>
          <div className="dates-grid">
            {classDates.map((date, index) => {
              const dateObj = new Date(date + 'T00:00:00');
              const day = dateObj.getDate();
              const month = dateObj.toLocaleDateString('es-CL', { month: 'short' }).toUpperCase().replace('.', '');
              return (
                <div key={index} className="date-item">
                  <span className="date-day">{day}</span>
                  <span className="date-month">{month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>Volver</button>
        <button type="button" className="btn-primary" onClick={onContinue}>Continuar</button>
      </div>
    </div>
  );
};

export default EditableScheduleCalendar;
