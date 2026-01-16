import './TechniqueSelector.css';
import './SimplifiedPlanTypeSelector.css';

const SimplifiedPlanTypeSelector = ({ selectedPlanType, onSelectPlanType, onContinue, onBack }) => {
  const planTypes = [
    {
      id: 'trial',
      name: 'Clase de prueba',
      description: '1 clase individual',
      icon: '🎯',
      recommended: false
    },
    {
      id: 'monthly',
      name: 'Plan mensual',
      description: 'Clases distribuidas en un mes',
      icon: '📅',
      recommended: true
    },
    {
      id: 'extended',
      name: 'Plan extendido',
      description: 'Clases distribuidas según tu disponibilidad',
      icon: '📆',
      recommended: false
    },
    {
      id: 'mixed',
      name: 'Plan mixto',
      description: 'Combina técnicas',
      icon: '🎨',
      recommended: false
    }
  ];

  const handlePlanTypeClick = (planTypeId) => {
    onSelectPlanType(planTypeId);
  };

  const handleContinue = () => {
    if (!selectedPlanType) {
      alert('⚠️ Por favor selecciona un tipo de plan para continuar.');
      return;
    }
    onContinue && onContinue();
  };

  return (
    <div className="simplified-step">
      <div className="step-progress">Paso 2 de 6</div>

      <h2 className="step-title">¿Cómo quieres tomar tus clases?</h2>

      <div className="plan-selector-container">
        {planTypes.map(planType => (
          <div
            key={planType.id}
            className={`plan-selector-card ${selectedPlanType === planType.id ? 'plan-selector-selected' : ''}`}
            onClick={() => handlePlanTypeClick(planType.id)}
          >
            <div className="plan-selector-radio">
              {selectedPlanType === planType.id && <div className="plan-selector-radio-dot"></div>}
            </div>

            <div className="plan-selector-icon">{planType.icon}</div>

            <div className="plan-selector-content">
              <h3 className="plan-selector-title">
                {planType.name}
                {planType.recommended && <span className="plan-selector-badge">Recomendado</span>}
              </h3>
              <p className="plan-selector-description">{planType.description}</p>
            </div>
          </div>
        ))}
      </div>

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
          disabled={!selectedPlanType}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default SimplifiedPlanTypeSelector;
