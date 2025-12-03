import { useState, useEffect } from 'react';
import { getPlans, getPreviewClassDates } from '../../services/api';
import './CopyWeeklyScheduleSelector.css';

const PlanSelector = ({ selectedPlan, onSelectPlan, selectedSchedules = [], selectedSchedule = null }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewDates, setPreviewDates] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await getPlans();
        console.log('Planes recibidos de la API:', data);
        setPlans(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar los planes:', err);
        setError('No se pudieron cargar los planes. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Cargar vista previa de fechas cuando se selecciona un plan
  useEffect(() => {
    const loadPreviewDates = async () => {
      // Solo cargar si hay plan seleccionado, horario seleccionado y fecha de inicio
      if (!selectedPlan || !selectedSchedule || !selectedSchedule.selectedDate) {
        setPreviewDates([]);
        return;
      }

      try {
        setLoadingPreview(true);
        const sectionId = selectedSchedule.section.id;
        const startDate = selectedSchedule.selectedDate.date;
        const paymentPlanId = selectedPlan.id;

        console.log('📆 Cargando vista previa con:', { sectionId, startDate, paymentPlanId });

        const dates = await getPreviewClassDates(sectionId, startDate, paymentPlanId);
        console.log('📆 Fechas de clases previstas:', dates);

        setPreviewDates(dates || []);
      } catch (error) {
        console.error('Error al cargar vista previa de fechas:', error);
        setPreviewDates([]);
      } finally {
        setLoadingPreview(false);
      }
    };

    loadPreviewDates();
  }, [selectedPlan, selectedSchedule]);

  // Validar compatibilidad entre plan y horarios seleccionados
  const validatePlanCompatibility = (plan) => {
    // Si no hay horarios seleccionados, todos los planes son válidos
    if (selectedSchedules.length === 0) {
      return { valid: true, message: '' };
    }

    // Contar cursos únicos seleccionados
    const uniqueCourses = new Set(selectedSchedules.map(s => s.courseId));
    const coursesCount = uniqueCourses.size;
    const schedulesCount = selectedSchedules.length;

    // Validar según max_courses si existe en el plan
    if (plan.max_courses !== undefined) {
      if (coursesCount > plan.max_courses) {
        return {
          valid: false,
          message: `Este plan permite máximo ${plan.max_courses} curso${plan.max_courses > 1 ? 's' : ''}. Has seleccionado ${coursesCount} curso${coursesCount > 1 ? 's diferentes' : ''}.`
        };
      }
    }

    // Validar según tipo de plan
    if (plan.type === 'base' && coursesCount > 1) {
      return {
        valid: false,
        message: `El Plan Base solo permite 1 curso. Has seleccionado ${coursesCount} cursos diferentes.`
      };
    }

    // Validar cantidad de horarios vs sesiones permitidas
    if (plan.sessions_per_month !== undefined && schedulesCount > plan.sessions_per_month) {
      return {
        valid: false,
        message: `Este plan incluye ${plan.sessions_per_month} sesiones mensuales. Has seleccionado ${schedulesCount} horarios.`
      };
    }

    return { valid: true, message: '' };
  };

  const handlePlanClick = (plan) => {
    const validation = validatePlanCompatibility(plan);

    if (!validation.valid) {
      alert(`⚠️ Plan incompatible\n\n${validation.message}\n\nPor favor, ajusta tus horarios seleccionados o elige otro plan.`);
      return;
    }

    console.log('Plan seleccionado:', plan);
    onSelectPlan(plan);
  };

  if (loading) {
    return (
      <div className="enrollment-step">
        <h2>Paso 2: Elige tu Plan</h2>
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Cargando planes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enrollment-step">
        <h2>Paso 2: Elige tu Plan</h2>
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="enrollment-step">
        <h2>Paso 2: Elige tu Plan</h2>
        <div className="info-message">
          <p>No hay planes disponibles en este momento.</p>
        </div>
      </div>
    );
  }

  // Calcular información de la selección actual
  const uniqueCourses = new Set(selectedSchedules.map(s => s.courseId));
  const coursesCount = uniqueCourses.size;
  const schedulesCount = selectedSchedules.length;

  return (
    <div className="enrollment-step">
      <h2>Paso 2: Elige tu Plan</h2>

      {selectedSchedules.length > 0 && (
        <div className="selection-summary">
          <p>
            Has seleccionado <strong>{schedulesCount}</strong> horario{schedulesCount > 1 ? 's' : ''}
            {coursesCount > 1 ? ` de ${coursesCount} cursos diferentes` : ' del mismo curso'}
          </p>
        </div>
      )}

      <div className="plans-selection">
        {plans.map(plan => {
          const isSelected = selectedPlan?.id === plan.id;
          const validation = validatePlanCompatibility(plan);
          const isCompatible = validation.valid;

          return (
            <div
              key={plan.id}
              className={`plan-option ${isSelected ? 'selected' : ''} ${!isCompatible ? 'incompatible' : ''}`}
              onClick={() => handlePlanClick(plan)}
            >
              <h3>{plan.plan}</h3>
              <p className="plan-description">{plan.description}</p>

              <div className="plan-price">
                <span className="price-amount">${plan.price?.toLocaleString('es-CL')}</span>
              </div>

              <div className="plan-details">
                {plan.number_of_classes && (
                  <div className="plan-classes">
                    <span className="classes-number">{plan.number_of_classes}</span>
                    <span className="classes-label">clases incluidas</span>
                  </div>
                )}

                {plan.max_courses && (
                  <div className="plan-info-item">
                    <span className="info-label">Máximo:</span>
                    <span className="info-value">{plan.max_courses} curso{plan.max_courses > 1 ? 's' : ''}</span>
                  </div>
                )}

                {plan.type && (
                  <div className="plan-type-badge">
                    {plan.type === 'base' ? '📘 Base' : '🎨 Mixto'}
                  </div>
                )}
              </div>

              {!isCompatible && selectedSchedules.length > 0 && (
                <div className="incompatibility-warning">
                  ⚠️ {validation.message}
                </div>
              )}

              {isCompatible && !isSelected && selectedSchedules.length > 0 && (
                <div className="compatibility-badge">
                  ✓ Compatible
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Vista previa de fechas de clases */}
      {selectedPlan && selectedSchedule && selectedSchedule.selectedDate && (
        <div className="preview-dates-section">
          <h3>📆 Fechas de tus clases</h3>
          <p className="preview-description">
            Con el plan <strong>{selectedPlan.plan}</strong> iniciando el{' '}
            <strong>{new Date(selectedSchedule.selectedDate.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
          </p>

          {loadingPreview ? (
            <div className="loading-preview">Cargando fechas de clases...</div>
          ) : previewDates.length > 0 ? (
            <div className="preview-dates-grid">
              {previewDates.map((date, idx) => (
                <div key={idx} className="preview-date-card">
                  <div className="date-number">{idx + 1}</div>
                  <div className="date-info">
                    {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-preview">No se pudieron cargar las fechas de clases</div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanSelector;
