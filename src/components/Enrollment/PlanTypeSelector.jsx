import './PlanTypeSelector.css';

const PlanTypeSelector = ({ selectedPlanType, onSelectPlanType, onContinue, onBack }) => {
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

  return (
    <div className="enrollment-step">
      <h2>Paso 2: Elige tu Tipo de Plan</h2>
      <p className="step-description">
        Selecciona cómo prefieres distribuir tus clases: <strong>concentradas en un mes</strong> o <strong>extendidas en el tiempo</strong>.
      </p>

      <div className="plan-types-grid">
        {planTypes.map(planType => (
          <div
            key={planType.id}
            className={`plan-type-card ${selectedPlanType === planType.id ? 'selected' : ''}`}
            onClick={() => onSelectPlanType(planType.id)}
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

      <div className="step-actions">
        {onBack && (
          <button className="btn-secondary" onClick={onBack}>
            ← Volver
          </button>
        )}
        <button
          className="btn-primary"
          onClick={onContinue}
          disabled={!selectedPlanType}
        >
          Continuar →
        </button>
      </div>
    </div>
  );
};

export default PlanTypeSelector;
