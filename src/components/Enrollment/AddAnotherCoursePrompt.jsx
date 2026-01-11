import './SimplifiedTechniqueSelector.css';
import './AddAnotherCoursePrompt.css';

const AddAnotherCoursePrompt = ({ completedEnrollments = [], currentCourse, onAddAnother, onContinue, onBack }) => {
  const totalCourses = completedEnrollments.length + 1;
  const maxCourses = 2;
  const canAddMore = totalCourses < maxCourses;

  return (
    <div className="simplified-step">
      <div className="step-progress">Paso 6 de 7</div>

      <h2 className="step-title">
        {canAddMore ? '¿Quieres agregar otro curso?' : 'Cursos seleccionados'}
      </h2>
      <p className="step-subtitle">
        {canAddMore
          ? `Puedes inscribirte hasta ${maxCourses} cursos y pagar todo junto`
          : 'Has alcanzado el máximo de cursos permitidos'}
      </p>

      {/* Mostrar todos los cursos */}
      <div className="courses-summary-section">
        {completedEnrollments.map((enrollment, index) => (
          <div key={index} className="course-summary-item completed">
            <div className="summary-icon">✓</div>
            <div className="summary-content">
              <h3>Curso {index + 1}:</h3>
              <p className="course-name">{enrollment._displayInfo?.technique}</p>
              <p className="course-details">
                {enrollment._displayInfo?.frequency} {enrollment._displayInfo?.frequency === 1 ? 'vez' : 'veces'} por semana • {enrollment._displayInfo?.durationMonths} {enrollment._displayInfo?.durationMonths === 1 ? 'mes' : 'meses'}
              </p>
            </div>
          </div>
        ))}

        {/* Curso actual */}
        <div className="course-summary-item current">
          <div className="summary-icon">✓</div>
          <div className="summary-content">
            <h3>Curso {totalCourses}:</h3>
            <p className="course-name">{currentCourse.technique}</p>
            <p className="course-details">
              {currentCourse.frequency} {currentCourse.frequency === 1 ? 'vez' : 'veces'} por semana • {currentCourse.durationMonths} {currentCourse.durationMonths === 1 ? 'mes' : 'meses'}
            </p>
          </div>
        </div>
      </div>

      {/* Opciones */}
      <div className="course-options">
        {canAddMore && (
          <button
            className="option-card add-course"
            onClick={onAddAnother}
          >
            <div className="option-icon">➕</div>
            <div className="option-content">
              <h3>Quiero agregar otro curso</h3>
              <p>Inscríbete en un curso más y paga todo junto ({totalCourses}/{maxCourses})</p>
            </div>
          </button>
        )}

        <button
          className="option-card continue-course"
          onClick={onContinue}
        >
          <div className="option-icon">✓</div>
          <div className="option-content">
            <h3>
              {canAddMore
                ? `Continuar con ${totalCourses === 1 ? 'este curso' : 'estos cursos'}`
                : 'Continuar al pago'}
            </h3>
            <p>Ir a completar datos y pagar</p>
          </div>
        </button>
      </div>

      <div className="step-actions-center">
        <button
          className="btn-secondary-large"
          onClick={onBack}
        >
          ← Volver
        </button>
      </div>
    </div>
  );
};

export default AddAnotherCoursePrompt;
