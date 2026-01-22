import { useState, useEffect } from 'react';
import { getWeeklyPlans } from '../../services/api';
import './TechniqueSelector.css';
import './SimplifiedPlanConfigurator.css';

const SimplifiedPlanConfigurator = ({
  planType,
  frequency,
  selectedDays,
  onFrequencyChange,
  onPlanSelect, // Nueva prop para pasar el plan completo
  onDaysChange,
  onContinue,
  onBack
}) => {
  const [weeklyPlans, setWeeklyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const days = [
    { id: 'monday', name: 'Lunes' },
    { id: 'tuesday', name: 'Martes' },
    { id: 'wednesday', name: 'Miércoles' },
    { id: 'thursday', name: 'Jueves' },
    { id: 'friday', name: 'Viernes' },
    { id: 'saturday', name: 'Sábado' }
  ];

  // Cargar planes semanales al montar el componente
  useEffect(() => {
    const loadWeeklyPlans = async () => {
      try {
        setLoading(true);
        const plans = await getWeeklyPlans();
        console.log('Planes semanales recibidos:', plans);
        setWeeklyPlans(plans);
        setError(null);
      } catch (err) {
        console.error('Error al cargar planes semanales:', err);
        setError('No se pudieron cargar los planes');
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyPlans();
  }, []);

  const handleDayToggle = (dayId) => {
    const maxDays = frequency || 1;

    if (selectedDays.includes(dayId)) {
      // Deseleccionar
      onDaysChange(selectedDays.filter(d => d !== dayId));
    } else {
      // Seleccionar
      if (selectedDays.length >= maxDays) {
        alert(`⚠️ Solo puedes seleccionar ${maxDays} día${maxDays > 1 ? 's' : ''} según la frecuencia elegida.`);
        return;
      }
      onDaysChange([...selectedDays, dayId]);
    }
  };

  const handleContinue = () => {
    if (!frequency) {
      alert('⚠️ Por favor selecciona una frecuencia.');
      return;
    }
    onContinue && onContinue();
  };

  // Separar clase de prueba de planes regulares
  const trialClass = weeklyPlans.find(plan =>
    plan.weekly_classes === 1 && plan.number_of_classes === 1
  );

  const regularPlans = weeklyPlans.filter(plan =>
    !(plan.weekly_classes === 1 && plan.number_of_classes === 1)
  );

  // Estado para saber si está seleccionada la clase de prueba
  const [isTrialSelected, setIsTrialSelected] = useState(false);

  const handleTrialClick = () => {
    if (trialClass) {
      console.log('🎨 Click en clase de prueba:', trialClass);
      onFrequencyChange(trialClass.weekly_classes);
      if (onPlanSelect) {
        console.log('📤 Enviando plan de prueba al padre:', trialClass);
        onPlanSelect(trialClass);
      }
      onDaysChange([]);
      setIsTrialSelected(true);
    }
  };

  const handleRegularPlanClick = (plan) => {
    console.log('📊 Click en plan regular:', plan);
    onFrequencyChange(plan.weekly_classes);
    if (onPlanSelect) {
      console.log('📤 Enviando plan regular al padre:', plan);
      onPlanSelect(plan);
    }
    // Limpiar días seleccionados si cambia la frecuencia
    if (selectedDays.length > plan.weekly_classes) {
      onDaysChange([]);
    }
    setIsTrialSelected(false);
  };

  return (
    <div className="simplified-step">
      <div className="step-progress">Paso 2 de 6</div>

      <h2 className="step-title">¿Cuántas veces a la semana quieres venir?</h2>

      {/* Loading state */}
      {loading && (
        <div className="loading-message">
          <p>Cargando planes disponibles...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Clase de prueba */}
          {trialClass && (
            <div className="trial-class-section">
              <button
                className={`trial-class-button ${isTrialSelected ? 'selected' : ''}`}
                onClick={handleTrialClick}
              >
                <span className="trial-icon">🎨</span>
                <span className="trial-text">Quiero tomar una clase de prueba</span>
              </button>
            </div>
          )}

          {/* Frecuencia regular */}
          <div className="config-section">
            <h3 className="config-title">Frecuencia</h3>
            <div className="frequency-options">
              {regularPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`frequency-card ${!isTrialSelected && frequency === plan.weekly_classes ? 'selected' : ''}`}
                  onClick={() => handleRegularPlanClick(plan)}
                >
                  <div className="frequency-number">{plan.weekly_classes}</div>
                  <div className="frequency-label">{plan.weekly_classes === 1 ? 'vez / semana' : 'veces / semana'}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Información */}
      {frequency && (
        <div className="config-section">
          <p className="info-note">
            ℹ️ En el siguiente paso seleccionarás {frequency} {frequency === 1 ? 'día y horario' : 'días y horarios'} para tus clases semanales
          </p>
        </div>
      )}

      <div className="step-actions-center">
        <button
          className="btn-secondary-large"
          onClick={onBack}
        >
          ← Volver
        </button>
        <button
          className="btn-primary-large"
          onClick={handleContinue}
          disabled={!frequency}
        >
          Elegir {frequency === 1 ? 'fecha y horario' : 'fechas y horarios'}
        </button>
      </div>
    </div>
  );
};

export default SimplifiedPlanConfigurator;
