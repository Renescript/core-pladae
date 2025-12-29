import './EnrollmentSummary.css';

/**
 * Componente para mostrar un resumen visual de la inscripción
 */
const EnrollmentSummary = ({ selectedSchedule, selectedPlan, classDates, startDate }) => {
  if (!selectedSchedule || !selectedPlan || !startDate) {
    return null;
  }

  // Obtener información del horario
  const courseName = selectedSchedule.course?.name || selectedSchedule.courseName || 'Curso';
  const startTime = selectedSchedule.startTime || selectedSchedule.timeSlot?.split('-')[0];
  const endTime = selectedSchedule.endTime || selectedSchedule.timeSlot?.split('-')[1];

  // Mapeo de días en inglés a español
  const dayMap = {
    'monday': 'Lunes',
    'tuesday': 'Martes',
    'wednesday': 'Miércoles',
    'thursday': 'Jueves',
    'friday': 'Viernes',
    'saturday': 'Sábado',
    'sunday': 'Domingo'
  };

  const dayName = dayMap[selectedSchedule.day?.toLowerCase()] || 'N/A';

  // Formatear fecha de inicio
  const startDateFormatted = new Date(startDate + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Calcular fecha de término (última clase)
  let endDateFormatted = 'N/A';
  if (classDates && classDates.length > 0) {
    const lastDate = classDates[classDates.length - 1];
    endDateFormatted = new Date(lastDate + 'T00:00:00').toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Número total de clases
  const totalClasses = classDates?.length || selectedPlan.number_of_classes || 0;

  return (
    <div className="enrollment-summary">
      <div className="summary-header">
        <h3>📋 Resumen de tu inscripción</h3>
        <p className="summary-subtitle">Revisa los detalles antes de continuar</p>
      </div>

      <div className="summary-content">
        {/* Curso y Horario */}
        <div className="summary-section course-section">
          <div className="section-icon">🎨</div>
          <div className="section-content">
            <h4>Curso</h4>
            <p className="main-info">{courseName}</p>
            <div className="schedule-info">
              <span className="info-badge">
                <span className="badge-icon">📅</span>
                {dayName}s
              </span>
              <span className="info-badge">
                <span className="badge-icon">🕐</span>
                {startTime} - {endTime}
              </span>
            </div>
          </div>
        </div>

        {/* Plan */}
        <div className="summary-section plan-section">
          <div className="section-icon">💎</div>
          <div className="section-content">
            <h4>Plan seleccionado</h4>
            <p className="main-info">{selectedPlan.plan}</p>
            <p className="plan-description">{selectedPlan.description}</p>
            <div className="plan-price-display">
              <span className="price-label">Total:</span>
              <span className="price-value">${selectedPlan.price?.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="summary-section dates-section">
          <div className="section-icon">📆</div>
          <div className="section-content">
            <h4>Período de clases</h4>
            <div className="dates-grid">
              <div className="date-item">
                <span className="date-label">Inicio</span>
                <p className="date-value">{startDateFormatted}</p>
              </div>
              <div className="date-divider">→</div>
              <div className="date-item">
                <span className="date-label">Término</span>
                <p className="date-value">{endDateFormatted}</p>
              </div>
            </div>
            <div className="total-classes-badge">
              <span className="classes-icon">✓</span>
              <span className="classes-text">{totalClasses} clases totales</span>
            </div>
          </div>
        </div>
      </div>

      <div className="summary-footer">
        <div className="footer-icon">ℹ️</div>
        <p className="footer-text">
          Podrás revisar y confirmar todos estos detalles antes de realizar el pago
        </p>
      </div>
    </div>
  );
};

export default EnrollmentSummary;
