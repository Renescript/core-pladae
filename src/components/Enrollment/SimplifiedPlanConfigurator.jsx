import { useState, useEffect, useRef } from 'react';
import { getWeeklyPlans } from '../../services/api';
import './SimplifiedPlanConfigurator.css';

const normalizeName = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

const SimplifiedPlanConfigurator = ({
  technique,
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

  // Cantidad máxima de veces/semana que el taller elegido permite: días únicos con clase.
  // Si el taller tiene solo 1 día con clases, no ofrecemos planes de 2+ veces/semana.
  const maxWeeklyClasses = technique?.schedules
    ? new Set(technique.schedules.map(s => s.day)).size
    : Infinity;

  const techniqueKey = normalizeName(technique?.name);
  const plansForTechnique = techniqueKey
    ? weeklyPlans.filter(p => normalizeName(p.course_title) === techniqueKey)
    : weeklyPlans;

  const trialClass = plansForTechnique.find(plan => plan.event_type === 'trial');
  const regularPlans = plansForTechnique
    .filter(plan => plan.event_type === null)
    .filter(plan => plan.weekly_classes <= maxWeeklyClasses)
    .sort((a, b) => a.weekly_classes - b.weekly_classes);

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
