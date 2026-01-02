import './EnrollmentProgressSummary.css';

const EnrollmentProgressSummary = ({
  currentStep,
  selectedSchedules = [],
  startDates = {},
  selectedPlan = null,
  studentData = {}
}) => {
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

  // No mostrar en el paso 1 si no hay nada seleccionado
  if (currentStep === 1 && selectedSchedules.length === 0) {
    return null;
  }

  // No mostrar en el paso 7 (pago) porque tiene su propio resumen completo
  if (currentStep === 7) {
    return null;
  }

  return (
    <div className="enrollment-progress-summary">
      <div className="summary-header">
        <span className="summary-icon">📋</span>
        <h3>Resumen</h3>
      </div>

      <div className="summary-grid">
        {/* Sección: Cursos */}
        <div className={`summary-section ${selectedSchedules.length > 0 ? 'has-content' : ''}`}>
          <div className="section-header">
            <span className="section-icon">🥋</span>
            <span className="section-title">Cursos Seleccionados</span>
          </div>
          <div className="section-content">
            {selectedSchedules.length === 0 ? (
              <div className="empty-state">
                <span className="empty-text">Sin cursos seleccionados</span>
              </div>
            ) : (
              <div className="courses-list">
                {selectedSchedules.map((schedule, index) => {
                  const sectionId = schedule.section?.id;
                  const startDate = startDates[sectionId];

                  return (
                    <div key={sectionId || index} className="course-item">
                      {/* Técnica */}
                      <div className="course-technique">
                        <span className="course-dot" style={{ backgroundColor: schedule.color }}></span>
                        <span className="course-name">{schedule.courseName}</span>
                      </div>

                      {/* Horario */}
                      <div className="course-schedule">
                        <span className="label">Horario:</span>
                        <span className="value">
                          {getDayName(schedule.day)} {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>

                      {/* Fecha de Inicio */}
                      {startDate && (
                        <div className="course-start-date">
                          <span className="label">Inicio:</span>
                          <span className="value">
                            {new Date(startDate + 'T00:00:00').toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sección: Número de Clases */}
        {selectedSchedules.length > 0 && (
          <div className="summary-section has-content">
            <div className="section-header">
              <span className="section-icon">🔢</span>
              <span className="section-title">Número de Clases</span>
            </div>
            <div className="section-content">
              <div className="class-count">
                {selectedSchedules.length} {selectedSchedules.length === 1 ? 'clase' : 'clases'}
              </div>
            </div>
          </div>
        )}

        {/* Sección: Plan */}
        <div className={`summary-section ${selectedPlan ? 'has-content' : ''}`}>
          <div className="section-header">
            <span className="section-icon">💳</span>
            <span className="section-title">Plan de Pago</span>
          </div>
          <div className="section-content">
            {!selectedPlan ? (
              <div className="empty-state">
                <span className="empty-text">Sin plan seleccionado</span>
              </div>
            ) : (
              <div className="plan-info">
                <div className="plan-name">{selectedPlan.plan}</div>
                <div className="plan-price">${selectedPlan.price?.toLocaleString('es-CL')}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentProgressSummary;
