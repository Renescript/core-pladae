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

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-indicator">Paso 5 de 6</span>
        <h2>Resumen de tus clases</h2>
      </div>

      <div className="summary-card">
        <div className="summary-item">
          <span className="label">Técnica:</span>
          <span className="value">{technique?.name}</span>
        </div>
        <div className="summary-item">
          <span className="label">Frecuencia:</span>
          <span className="value">{frequency} {frequency === 1 ? 'vez' : 'veces'} por semana</span>
        </div>
        <div className="summary-item">
          <span className="label">Duración:</span>
          <span className="value">{durationMonths} {durationMonths === 1 ? 'mes' : 'meses'}</span>
        </div>
        <div className="summary-item">
          <span className="label">Total de clases:</span>
          <span className="value">{totalClasses} clases</span>
        </div>
      </div>

      <div className="schedules-list">
        <h3>Horarios seleccionados:</h3>
        {selectedSchedules.map((schedule, index) => (
          <div key={index} className="schedule-item">
            <span>{schedule.dayOfWeek}</span>
            <span>{schedule.timeSlot}</span>
            <span>{schedule.teacher}</span>
          </div>
        ))}
      </div>

      <div className="dates-preview">
        <h3>Primeras fechas:</h3>
        <div className="dates-list">
          {classDates.slice(0, 8).map((date, index) => (
            <span key={index} className="date-chip">
              {new Date(date + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
            </span>
          ))}
          {classDates.length > 8 && <span className="date-chip">+{classDates.length - 8} más</span>}
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
