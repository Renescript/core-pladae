import './FinalEnrollmentSummary.css';

const FinalEnrollmentSummary = ({
  selectedCourses = [],
  planType,
  selectedPlan,
  selectedSchedules = [],
  startDates = {},
  onEditStep,
  onContinue,
  onBack
}) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDayName = (day) => {
    const dayNames = {
      'monday': 'Lunes',
      'tuesday': 'Martes',
      'wednesday': 'Miércoles',
      'thursday': 'Jueves',
      'friday': 'Viernes',
      'saturday': 'Sábado',
      'sunday': 'Domingo'
    };
    return dayNames[day?.toLowerCase()] || day;
  };

  const getPlanTypeName = (type) => {
    return type === 'monthly' ? 'Plan Mensual' : 'Plan Extendido';
  };

  return (
    <div className="enrollment-step">
      <h2>Paso 4: Resumen de tu Inscripción</h2>
      <p className="step-description">
        Revisa los detalles de tu inscripción antes de continuar. Puedes editar cualquier sección si lo necesitas.
      </p>

      <div className="final-summary-container">
        {/* Técnicas seleccionadas */}
        <div className="final-summary-section">
          <div className="final-summary-header">
            <div className="final-summary-title">
              <span className="final-summary-icon">🎨</span>
              <h3>Técnicas Seleccionadas</h3>
            </div>
            <button
              className="edit-button"
              onClick={() => onEditStep(1)}
              title="Editar técnicas"
            >
              ✏️ Editar
            </button>
          </div>
          <div className="final-summary-content">
            <div className="techniques-list">
              {selectedCourses.map(course => (
                <div key={course.id} className="technique-item">
                  <span
                    className="technique-color"
                    style={{ backgroundColor: course.color }}
                  ></span>
                  <span className="technique-name">{course.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plan seleccionado */}
        <div className="final-summary-section">
          <div className="final-summary-header">
            <div className="final-summary-title">
              <span className="final-summary-icon">📋</span>
              <h3>Plan Seleccionado</h3>
            </div>
            <button
              className="edit-button"
              onClick={() => onEditStep(2)}
              title="Editar plan"
            >
              ✏️ Editar
            </button>
          </div>
          <div className="final-summary-content">
            <div className="plan-info">
              <div className="plan-type-badge">
                {planType === 'monthly' ? '📅' : '📆'} {getPlanTypeName(planType)}
              </div>
              <div className="plan-details-summary">
                <h4>{selectedPlan.plan}</h4>
                <p className="plan-description-summary">{selectedPlan.description}</p>
                <div className="plan-features-summary">
                  {selectedPlan.number_of_classes && (
                    <div className="feature-item">
                      <span className="feature-icon">📚</span>
                      <span>{selectedPlan.number_of_classes} clases</span>
                    </div>
                  )}
                  {selectedPlan.max_courses && (
                    <div className="feature-item">
                      <span className="feature-icon">🎯</span>
                      <span>Hasta {selectedPlan.max_courses} curso{selectedPlan.max_courses > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horarios y Fechas */}
        <div className="final-summary-section">
          <div className="final-summary-header">
            <div className="final-summary-title">
              <span className="final-summary-icon">📅</span>
              <h3>Horarios y Fechas</h3>
            </div>
            <button
              className="edit-button"
              onClick={() => onEditStep(3)}
              title="Editar horarios y fechas"
            >
              ✏️ Editar
            </button>
          </div>
          <div className="final-summary-content">
            <div className="schedules-list">
              {selectedSchedules.map((schedule, index) => {
                const sectionId = schedule.section?.id;
                const startDate = startDates[sectionId];

                return (
                  <div key={sectionId || index} className="schedule-item">
                    <div className="schedule-number">{index + 1}</div>
                    <div
                      className="schedule-color"
                      style={{ backgroundColor: schedule.color }}
                    ></div>
                    <div className="schedule-details">
                      <h4>{schedule.courseName}</h4>
                      <div className="schedule-info-row">
                        <span className="schedule-day">
                          {getDayName(schedule.day)} {schedule.timeSlot}
                        </span>
                        {schedule.teacher && (
                          <span className="schedule-teacher">
                            👤 {schedule.teacher}
                          </span>
                        )}
                      </div>
                      {startDate && (
                        <div className="schedule-start-date">
                          🗓️ Inicio: <strong>{formatDate(startDate)}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Precio Total */}
        <div className="final-summary-section final-summary-total">
          <div className="final-summary-header">
            <div className="final-summary-title">
              <span className="final-summary-icon">💰</span>
              <h3>Total a Pagar</h3>
            </div>
          </div>
          <div className="final-summary-content">
            <div className="price-breakdown">
              <div className="price-row">
                <span className="price-label">Plan {selectedPlan.plan}</span>
                <span className="price-value">${selectedPlan.price?.toLocaleString('es-CL')}</span>
              </div>
              <div className="price-row">
                <span className="price-label">{selectedSchedules.length} curso{selectedSchedules.length > 1 ? 's' : ''} seleccionado{selectedSchedules.length > 1 ? 's' : ''}</span>
                <span className="price-detail">Incluido en el plan</span>
              </div>
              <div className="price-total">
                <span className="total-label">Total</span>
                <span className="total-amount">${selectedPlan.price?.toLocaleString('es-CL')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Políticas y Notas */}
        <div className="final-summary-section final-summary-policies">
          <div className="final-summary-content">
            <div className="policies-info">
              <h4>📌 Información importante</h4>
              <ul className="policies-list">
                <li>✓ Las clases deben ser agendadas con anticipación</li>
                <li>✓ Política de cancelación: 24 horas de anticipación</li>
                <li>✓ Las fechas pueden ser reagendadas según disponibilidad</li>
                <li>✓ El pago se procesará de forma segura mediante Webpay</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>
          ← Volver
        </button>
        <button
          className="btn-primary"
          onClick={onContinue}
        >
          Continuar a Datos Personales →
        </button>
      </div>
    </div>
  );
};

export default FinalEnrollmentSummary;
