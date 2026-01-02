import { useState, useEffect, useCallback, useRef } from 'react';
import { getPlans } from '../../services/api';
import MultiCourseCalendarPreview from './MultiCourseCalendarPreview';
import './PlanTypeSelector.css';
import './CopyWeeklyScheduleSelector.css';

const CombinedPlanSelector = ({
  selectedPlanType,
  onSelectPlanType,
  selectedPlan,
  onSelectPlan,
  selectedSchedules = [],
  startDates = {},
  availableDatesMap = {},
  onValidationChange,
  onClassDatesChange,
  onContinue,
  onBack
}) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isClassDatesValid, setIsClassDatesValid] = useState(true);
  const previewSectionRef = useRef(null);

  const planTypes = [
    {
      id: 'monthly',
      name: 'Plan Mensual',
      icon: '📅',
      description: 'Cierta cantidad de clases concentradas en un mismo mes',
      features: [
        'Ideal para aprendizaje intensivo',
        'Clases distribuidas en el mes',
        'Mayor frecuencia semanal',
        'Progreso acelerado'
      ],
      color: '#667eea'
    },
    {
      id: 'extended',
      name: 'Plan Extendido',
      icon: '📆',
      description: 'Cierta cantidad de clases extendidas en el tiempo, un mismo día de la semana',
      features: [
        'Ideal para aprendizaje constante',
        'Un día fijo por semana',
        'Mayor flexibilidad de tiempo',
        'Aprendizaje a tu ritmo'
      ],
      color: '#10b981'
    }
  ];

  // Cargar planes cuando se selecciona un tipo
  useEffect(() => {
    if (!selectedPlanType) {
      setPlans([]);
      return;
    }

    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await getPlans();
        console.log('Planes recibidos de la API:', data);

        // Filtrar planes según el tipo seleccionado
        const filteredPlans = data.filter(plan => {
          return plan.plan_type === selectedPlanType || plan.type === selectedPlanType;
        });

        console.log(`Planes filtrados por tipo '${selectedPlanType}':`, filteredPlans);
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
  }, [selectedPlanType]);

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
    if (selectedSchedules.length === 0) {
      return { valid: true, message: '' };
    }

    const coursesCount = selectedSchedules.length;

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

  const handlePlanTypeClick = (planTypeId) => {
    onSelectPlanType(planTypeId);
    // Limpiar plan seleccionado si cambia el tipo
    if (selectedPlan && selectedPlan.plan_type !== planTypeId && selectedPlan.type !== planTypeId) {
      onSelectPlan(null);
    }
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

  const handleContinue = () => {
    if (!selectedPlanType) {
      alert('⚠️ Por favor selecciona un tipo de plan para continuar.');
      return;
    }
    if (!selectedPlan) {
      alert('⚠️ Por favor selecciona un plan específico para continuar.');
      return;
    }
    if (!isClassDatesValid) {
      alert('⚠️ Corrige las fechas duplicadas antes de continuar.');
      return;
    }
    onContinue && onContinue();
  };

  return (
    <div className="enrollment-step">
      <h2>Paso 2: Elige tu Plan</h2>

      {/* Sección 1: Tipo de Plan */}
      <div className="plan-section">
        <h3 className="section-title">1. Selecciona el tipo de plan</h3>
        <p className="step-description">
          Elige cómo prefieres distribuir tus clases: <strong>concentradas en un mes</strong> o <strong>extendidas en el tiempo</strong>.
        </p>

        <div className="plan-types-grid">
          {planTypes.map(planType => (
            <div
              key={planType.id}
              className={`plan-type-card ${selectedPlanType === planType.id ? 'selected' : ''}`}
              onClick={() => handlePlanTypeClick(planType.id)}
            >
              <div className="plan-type-icon" style={{ color: planType.color }}>
                {planType.icon}
              </div>
              <h3 className="plan-type-name">{planType.name}</h3>
              <p className="plan-type-description">{planType.description}</p>

              <div className="plan-type-features">
                {planType.features.map((feature, index) => (
                  <div key={index} className="plan-type-feature">
                    <span className="feature-check">✓</span>
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
              </div>

              {selectedPlanType === planType.id && (
                <div className="selected-indicator">
                  <span className="check-icon">✓</span>
                  Seleccionado
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sección 2: Plan Específico (solo se muestra si hay un tipo seleccionado) */}
      {selectedPlanType && (
        <div className="plan-section" style={{ marginTop: '2rem' }}>
          <h3 className="section-title">2. Selecciona tu plan específico</h3>
          <p className="step-description">
            {selectedPlanType === 'extended'
              ? 'Las clases del Plan Extendido se distribuyen el mismo día cada semana.'
              : 'Las clases del Plan Mensual se distribuyen en diferentes días a lo largo de 4 semanas.'}
          </p>

          {loading ? (
            <div className="loading-message">
              <div className="spinner"></div>
              <p>Cargando planes...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="info-message">
              <p>No hay planes disponibles para este tipo.</p>
            </div>
          ) : (
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
          )}

          {/* Vista previa consolidada de fechas para múltiples cursos */}
          {selectedPlan && selectedSchedules.length > 0 && (
            <div ref={previewSectionRef} style={{ marginTop: '2rem' }}>
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
      )}

      {/* Botones de navegación */}
      <div className="step-actions" style={{ marginTop: '2rem' }}>
        <button className="btn-secondary" onClick={onBack}>
          ← Volver
        </button>
        <button
          className="btn-primary"
          onClick={handleContinue}
          disabled={!selectedPlanType || !selectedPlan || !isClassDatesValid}
          title={
            !selectedPlanType
              ? 'Selecciona un tipo de plan'
              : !selectedPlan
              ? 'Selecciona un plan específico'
              : !isClassDatesValid
              ? 'Corrige las fechas duplicadas para continuar'
              : ''
          }
        >
          Continuar →
        </button>
      </div>

      {!isClassDatesValid && selectedPlan && (
        <div className="validation-error-message">
          ⚠️ No puedes continuar hasta que corrijas las fechas duplicadas
        </div>
      )}
    </div>
  );
};

export default CombinedPlanSelector;
