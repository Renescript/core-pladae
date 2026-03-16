const DAY_NAMES = {
  monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
  thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo'
};

const formatPrice = (price) => {
  if (!price) return '';
  return '$' + price.toLocaleString('es-CL');
};

const CourseSummaryCard = ({ name, frequency, durationMonths, schedules, priceInfo, totalClasses }) => (
  <div className="confirm-course-card">
    <div className="confirm-course-header">
      <span className="confirm-course-name">{name}</span>
    </div>
    <div className="confirm-course-details">
      <div className="confirm-detail-row">
        <span className="confirm-detail-label">Frecuencia</span>
        <span className="confirm-detail-value">{frequency}x por semana</span>
      </div>
      {schedules?.length > 0 && (
        <div className="confirm-detail-row">
          <span className="confirm-detail-label">Horarios</span>
          <span className="confirm-detail-value">
            {schedules.map((s, i) => (
              <span key={i} className="confirm-schedule">
                {DAY_NAMES[s.dayOfWeek] || s.dayOfWeek} {s.timeSlot?.replace('-', ' – ')}
              </span>
            ))}
          </span>
        </div>
      )}
      <div className="confirm-detail-row">
        <span className="confirm-detail-label">Duración</span>
        <span className="confirm-detail-value">
          {durationMonths} mes{durationMonths > 1 ? 'es' : ''}
          {totalClasses > 0 && ` (${totalClasses} clases)`}
        </span>
      </div>
      {priceInfo?.finalPrice > 0 && (
        <div className="confirm-detail-row confirm-price-row">
          <span className="confirm-detail-label">Total</span>
          <span className="confirm-detail-price">{formatPrice(priceInfo.finalPrice)}</span>
        </div>
      )}
    </div>
  </div>
);

const AddAnotherCoursePrompt = ({ completedEnrollments = [], currentCourse, onAddAnother, onContinue, onBack }) => {
  const totalCourses = completedEnrollments.length + 1;
  const maxCourses = 2;
  const canAddMore = totalCourses < maxCourses;

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Resumen de tu inscripción</h2>
        <p className="step-description">Revisa los detalles antes de continuar</p>
      </div>

      <div className="confirm-courses-list">
        {completedEnrollments.map((enrollment, index) => (
          <CourseSummaryCard
            key={index}
            name={enrollment._displayInfo?.technique}
            frequency={enrollment._displayInfo?.frequency}
            durationMonths={enrollment._displayInfo?.durationMonths}
            schedules={enrollment._displayInfo?.schedules}
            priceInfo={enrollment._displayInfo?.priceInfo}
            totalClasses={enrollment._displayInfo?.totalClasses}
          />
        ))}
        <CourseSummaryCard
          name={currentCourse?.technique}
          frequency={currentCourse?.frequency}
          durationMonths={currentCourse?.durationMonths}
          schedules={currentCourse?.selectedSchedules}
          priceInfo={currentCourse?.priceInfo}
          totalClasses={currentCourse?.totalClasses}
        />
      </div>

      {canAddMore && (
        <button type="button" className="confirm-add-btn" onClick={onAddAnother}>
          + Agregar otro curso
        </button>
      )}

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>Volver</button>
        <button type="button" className="btn-primary" onClick={onContinue}>
          Continuar al pago
        </button>
      </div>
    </div>
  );
};

export default AddAnotherCoursePrompt;
