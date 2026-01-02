import { useState, useEffect } from 'react';
import './CourseShoppingCart.css';

/**
 * Componente de carrito lateral que muestra los cursos seleccionados
 * y permite gestionar la selección múltiple
 */
const CourseShoppingCart = ({
  selectedCourses = [],
  onRemoveCourse,
  compatiblePlans = [],
  onContinue,
  maxCourses = 5
}) => {
  const [minPrice, setMinPrice] = useState(null);

  useEffect(() => {
    if (compatiblePlans.length > 0) {
      const prices = compatiblePlans.map(plan => plan.price).filter(p => p);
      setMinPrice(Math.min(...prices));
    }
  }, [compatiblePlans]);

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

  return (
    <div className="course-cart-sidebar">
      <div className="cart-header">
        <h3>🛒 Tu Selección</h3>
        {selectedCourses.length > 0 && (
          <span className="cart-count">{selectedCourses.length}/{maxCourses}</span>
        )}
      </div>

      {selectedCourses.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">📚</div>
          <p className="cart-empty-text">Selecciona cursos de la grilla</p>
          <p className="cart-empty-hint">💡 Puedes elegir hasta {maxCourses} cursos</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {selectedCourses.map((course, index) => (
              <div key={course.section?.id || index} className="cart-item">
                <div
                  className="item-color"
                  style={{backgroundColor: course.color || '#ccc'}}
                />
                <div className="item-details">
                  <h4 className="item-course-name">{course.courseName}</h4>
                  <p className="item-schedule">
                    {getDayName(course.day)} {course.timeSlot}
                  </p>
                  {course.teacher && (
                    <p className="item-teacher">👤 {course.teacher}</p>
                  )}
                </div>
                <button
                  className="remove-btn"
                  onClick={() => onRemoveCourse(course.section?.id || course.courseId)}
                  title="Quitar curso"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span className="summary-label">📊 Cursos:</span>
              <strong className="summary-value">{selectedCourses.length}</strong>
            </div>
            {minPrice && (
              <div className="summary-row">
                <span className="summary-label">💰 Desde:</span>
                <strong className="summary-value">${minPrice.toLocaleString('es-CL')}</strong>
              </div>
            )}
          </div>

          {compatiblePlans.length > 0 && (
            <div className="compatible-plans-preview">
              <h4 className="plans-preview-title">Planes compatibles:</h4>
              <div className="plans-chips">
                {compatiblePlans.map(plan => (
                  <div key={plan.id} className="plan-chip">
                    <span className="plan-chip-name">{plan.plan}</span>
                    {plan.max_courses && (
                      <span className="plan-chip-info">
                        ({plan.max_courses} {plan.max_courses === 1 ? 'curso' : 'cursos'})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            className="btn-primary btn-continue"
            onClick={onContinue}
            disabled={selectedCourses.length === 0}
          >
            Continuar con {selectedCourses.length} curso{selectedCourses.length > 1 ? 's' : ''} →
          </button>
        </>
      )}
    </div>
  );
};

export default CourseShoppingCart;
