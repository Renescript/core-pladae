import { useEffect } from 'react';

const DurationSelector = ({
  selectedDuration,
  onDurationChange,
  frequency,
  monthlyPrice,
  weeklyPlan,
  paymentPeriods = [],
  onContinue,
  loadingDates = false,
  datesError = null,
  onBack
}) => {
  const isTrialClass = weeklyPlan?.weekly_classes === 1 && weeklyPlan?.number_of_classes === 1;

  // Clase de prueba: duración fija de 1 mes (no aplica elección de meses).
  useEffect(() => {
    if (isTrialClass) onDurationChange(1);
  }, [isTrialClass]);

  const options = isTrialClass ? [] : paymentPeriods;

  // El precio y el descuento (por cantidad TOTAL de clases) los calcula el back en
  // `period.pricing`. Si aún no llegó, cae a un estimado local para no quedar en blanco.
  const priceInfoFor = (period) => {
    const p = period.pricing;
    if (p) {
      return { finalPrice: p.total, totalClasses: p.total_classes, discount: p.discount_percentage || 0 };
    }
    const months = period.months;
    return {
      finalPrice: Math.round((monthlyPrice || 0) * months),
      totalClasses: (weeklyPlan?.number_of_classes || frequency * 4) * months,
      discount: 0
    };
  };

  const handleContinue = () => {
    if (!selectedDuration) {
      alert('Selecciona una duración');
      return;
    }
    onContinue();
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>{isTrialClass ? 'Clase de prueba' : '¿Cuánto tiempo quieres estudiar?'}</h2>
      </div>

      {isTrialClass ? (
        <div className="trial-info">
          <p className="price">${monthlyPrice?.toLocaleString('es-CL')}</p>
        </div>
      ) : options.length === 0 ? (
        <p>Cargando opciones...</p>
      ) : (
        <div className="duration-grid">
          {options.map((period) => {
            const info = priceInfoFor(period);
            const isSelected = selectedDuration === period.months;

            return (
              <button
                key={period.id}
                type="button"
                className={`duration-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onDurationChange(period.months)}
              >
                <span className="duration-months">{period.months} {period.months === 1 ? 'mes' : 'meses'}</span>
                {info.discount > 0 && (
                  <span className="discount">{info.discount}% OFF</span>
                )}
                <span className="total-classes">{info.totalClasses} clases</span>
                <span className="price">${(info.finalPrice || 0).toLocaleString('es-CL')}</span>
              </button>
            );
          })}
        </div>
      )}

      {datesError && (
        <div className="dates-error" role="alert" style={{
          margin: 'var(--space-4) 0',
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-sm)',
          background: '#fdecea',
          color: '#8a1c13',
          border: '1px solid #f5c6c2'
        }}>
          {datesError}
        </div>
      )}

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack} disabled={loadingDates}>Volver</button>
        <button
          type="button"
          className="btn-primary"
          onClick={handleContinue}
          disabled={!selectedDuration || loadingDates}
        >
          {loadingDates ? 'Armando tu calendario…' : 'Continuar'}
        </button>
      </div>
    </div>
  );
};

export default DurationSelector;
