const AddAnotherCoursePrompt = ({ completedEnrollments = [], currentCourse, onAddAnother, onContinue, onBack }) => {
  const totalCourses = completedEnrollments.length + 1;
  const maxCourses = 2;
  const canAddMore = totalCourses < maxCourses;

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-indicator">Paso 6 de 7</span>
        <h2>{canAddMore ? '¿Quieres agregar otro curso?' : 'Cursos seleccionados'}</h2>
      </div>

      <div className="courses-summary">
        {completedEnrollments.map((enrollment, index) => (
          <div key={index} className="course-item">
            <span>Curso {index + 1}: {enrollment._displayInfo?.technique}</span>
            <span>{enrollment._displayInfo?.frequency}x/semana</span>
          </div>
        ))}
        <div className="course-item current">
          <span>Curso {totalCourses}: {currentCourse?.technique}</span>
          <span>{currentCourse?.frequency}x/semana</span>
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>Volver</button>
        {canAddMore && (
          <button type="button" className="btn-secondary" onClick={onAddAnother}>
            Agregar otro curso
          </button>
        )}
        <button type="button" className="btn-primary" onClick={onContinue}>
          Continuar al pago
        </button>
      </div>
    </div>
  );
};

export default AddAnotherCoursePrompt;
