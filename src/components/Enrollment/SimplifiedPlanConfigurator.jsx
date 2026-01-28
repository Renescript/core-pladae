import { useState, useEffect, useRef } from 'react';
import { getWeeklyPlans } from '../../services/api';
import './SimplifiedPlanConfigurator.css';

const SimplifiedPlanConfigurator = ({
  frequency,
  onFrequencyChange,
  onPlanSelect,
  onContinue,
  onBack
}) => {
  const [weeklyPlans, setWeeklyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTrialSelected, setIsTrialSelected] = useState(false);
  const actionsRef = useRef(null);

  useEffect(() => {
    const loadWeeklyPlans = async () => {
      try {
        setLoading(true);
        const plans = await getWeeklyPlans();
        setWeeklyPlans(plans);
      } catch (err) {
        console.error('Error al cargar planes semanales:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyPlans();
  }, []);

  const trialClass = weeklyPlans.find(plan => plan.event_type === 'trial');
  const regularPlans = weeklyPlans.filter(plan => plan.event_type === null);

  const scrollToActions = () => {
    setTimeout(() => {
      actionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleTrialClick = () => {
    if (trialClass) {
      onFrequencyChange(trialClass.weekly_classes);
      onPlanSelect && onPlanSelect(trialClass);
      setIsTrialSelected(true);
      scrollToActions();
    }
  };

  const handleRegularPlanClick = (plan) => {
    onFrequencyChange(plan.weekly_classes);
    onPlanSelect && onPlanSelect(plan);
    setIsTrialSelected(false);
    scrollToActions();
  };

  const handleContinue = () => {
    if (!frequency) {
      alert('Por favor selecciona una frecuencia.');
      return;
    }
    onContinue && onContinue();
  };

  if (loading) {
    return (
      <div className="step-container">
        <p>Cargando planes...</p>
      </div>
    );
  }

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-indicator">Paso 2 de 6</span>
        <h2>¿Cuántas veces a la semana quieres venir?</h2>
      </div>

      {/* Opciones de frecuencia en línea */}
      <div className="frequency-row">
        {regularPlans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            className={`frequency-option ${!isTrialSelected && frequency === plan.weekly_classes ? 'selected' : ''}`}
            onClick={() => handleRegularPlanClick(plan)}
          >
            <span className="frequency-number">{plan.weekly_classes}</span>
            <span className="frequency-label">
              {plan.weekly_classes === 1 ? 'vez por semana' : 'veces por semana'}
            </span>
          </button>
        ))}

        {/* Clase de prueba en la misma fila */}
        {trialClass && (
          <button
            type="button"
            className={`frequency-option trial ${isTrialSelected ? 'selected' : ''}`}
            onClick={handleTrialClick}
          >
            <span className="frequency-number">1</span>
            <span className="frequency-label">clase de prueba</span>
          </button>
        )}
      </div>

      <div ref={actionsRef} className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          Volver
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={handleContinue}
          disabled={!frequency}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default SimplifiedPlanConfigurator;
