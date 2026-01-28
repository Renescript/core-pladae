import { useState, useEffect } from 'react';
import { getPaymentPeriods } from '../../services/api';

const DurationSelector = ({
  selectedDuration,
  onDurationChange,
  frequency,
  monthlyPrice,
  weeklyPlan,
  onContinue,
  onBack
}) => {
  const [durationOptions, setDurationOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const isTrialClass = weeklyPlan?.weekly_classes === 1 && weeklyPlan?.number_of_classes === 1;

  useEffect(() => {
    const loadPaymentPeriods = async () => {
      try {
        setLoading(true);
        if (isTrialClass) {
          setDurationOptions([]);
          onDurationChange(1);
          return;
        }
        const periods = await getPaymentPeriods();
        setDurationOptions(periods);
      } catch (error) {
        console.error('Error al cargar períodos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentPeriods();
  }, [monthlyPrice, isTrialClass]);

  const calculatePriceInfo = (months, discount) => {
    const subtotal = (monthlyPrice || 0) * months;
    const discountAmount = Math.round(subtotal * (discount / 100));
    const finalPrice = subtotal - discountAmount;
    const totalClasses = frequency * 4 * months;
    return { subtotal, discountAmount, finalPrice, totalClasses };
  };

  const handleContinue = () => {
    if (!selectedDuration) {
      alert('Selecciona una duración');
      return;
    }
    onContinue();
  };

  if (loading) {
    return <div className="step-container"><p>Cargando opciones...</p></div>;
  }

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-indicator">Paso 4 de 6</span>
        <h2>{isTrialClass ? 'Clase de prueba' : '¿Cuánto tiempo quieres estudiar?'}</h2>
      </div>

      {isTrialClass ? (
        <div className="trial-info">
          <h3>{weeklyPlan?.plan || 'Clase de prueba'}</h3>
          <p className="price">${monthlyPrice?.toLocaleString('es-CL')}</p>
          <p>1 clase incluida</p>
        </div>
      ) : (
        <div className="duration-grid">
          {durationOptions.map((period) => {
            const priceInfo = calculatePriceInfo(period.months, period.discount_percentage);
            const isSelected = selectedDuration === period.months;

            return (
              <button
                key={period.id}
                type="button"
                className={`duration-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onDurationChange(period.months)}
              >
                <span className="duration-months">{period.months} {period.months === 1 ? 'mes' : 'meses'}</span>
                {period.discount_percentage > 0 && (
                  <span className="discount">{period.discount_percentage}% OFF</span>
                )}
                <span className="total-classes">{priceInfo.totalClasses} clases</span>
                <span className="price">${priceInfo.finalPrice.toLocaleString('es-CL')}</span>
                {isSelected && <span className="check">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>Volver</button>
        <button type="button" className="btn-primary" onClick={handleContinue} disabled={!selectedDuration}>
          Continuar
        </button>
      </div>
    </div>
  );
};

export default DurationSelector;
