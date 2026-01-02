import { useState, useEffect, useCallback, useRef } from 'react';
import { getPlans } from '../../services/api';
import MultiCourseCalendarPreview from './MultiCourseCalendarPreview';
import './CopyWeeklyScheduleSelector.css';

const PlanSelector = ({
  selectedPlan,
  onSelectPlan,
  selectedSchedules = [], // Array de horarios seleccionados
  startDates = {}, // Objeto con fechas de inicio por curso
  planType, // Tipo de plan: 'monthly' o 'extended'
  availableDatesMap = {}, // Fechas disponibles por curso
  onValidationChange, // Callback para notificar el estado de validación
  onClassDatesChange // Callback para pasar las fechas finales al padre
}) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClassDatesValid, setIsClassDatesValid] = useState(true);
  const previewSectionRef = useRef(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await getPlans();
        console.log('Planes recibidos de la API:', data);

        // Filtrar planes según el tipo seleccionado (monthly o extended)
        const filteredPlans = planType
          ? data.filter(plan => {
              // Asumimos que los planes tienen un campo 'plan_type' que coincide con 'monthly' o 'extended'
              // Si no existe, podemos usar otra lógica de filtrado
              return plan.plan_type === planType || plan.type === planType;
            })
          : data;

        console.log(`Planes filtrados por tipo '${planType}':`, filteredPlans);
        setPlans(filteredPlans);
        setError(null);
      } catch (err) {
        console.error('Error al cargar los planes:', err);
        setError('No se pudieron cargar los planes. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [planType]);

  // Manejar cambios en el estado de validación
  const handleValidationChange = useCallback((isValid) => {
    console.log('✅ Estado de validación actualizado:', isValid);
    setIsClassDatesValid(isValid);
  }, []);

  // Notificar al padre sobre el estado de validación
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isClassDatesValid);
    }
  }, [isClassDatesValid, onValidationChange]);

  // Validar compatibilidad entre plan y horarios seleccionados
  const validatePlanCompatibility = (plan) => {
    // Si no hay horarios seleccionados, todos los planes son válidos
    if (selectedSchedules.length === 0) {
      return { valid: true, message: '' };
    }

    const coursesCount = selectedSchedules.length;

    // Validar según max_courses si existe en el plan
    if (plan.max_courses !== undefined && plan.max_courses > 0) {
      if (coursesCount > plan.max_courses) {
        return {
          valid: false,
          message: `Este plan permite máximo ${plan.max_courses} curso${plan.max_courses > 1 ? 's' : ''}. Has seleccionado ${coursesCount} curso${coursesCount > 1 ? 's' : ''}.`
        };
      }
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

    // Scroll suave hacia la vista previa después de seleccionar
    setTimeout(() => {
      if (previewSectionRef.current) {
        previewSectionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 150);
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

  const getStepDescription = () => {
    if (planType === 'extended') {
      return 'Selecciona un plan para tus clases. Las clases del Plan Extendido se distribuyen el mismo día cada semana.';
    } else {
      return 'Selecciona un plan para tus clases. Las clases del Plan Mensual se distribuyen en diferentes días a lo largo de 4 semanas.';
    }
  };

  return (
    <div className="enrollment-step">
      <h2>Paso 5: Selecciona tu Plan</h2>
      <p className="step-description">{getStepDescription()}</p>

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

      {/* Vista previa consolidada de fechas para múltiples cursos */}
      {selectedPlan && selectedSchedules.length > 0 && (
        <div ref={previewSectionRef}>
          <MultiCourseCalendarPreview
            selectedSchedules={selectedSchedules}
            startDates={startDates}
            selectedPlan={selectedPlan}
            availableDatesMap={availableDatesMap}
            onClassDatesChange={onClassDatesChange}
            onValidationChange={handleValidationChange}
          />
        </div>
      )}
    </div>
  );
};

export default PlanSelector;
