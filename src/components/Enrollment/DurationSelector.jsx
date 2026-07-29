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

  // Descuento por frecuencia (ya incluido en el precio del plan). El descuento por
  // período (meses) se SUMA a este. Reconstruimos el precio "sin descuento" y aplicamos
  // (frecuencia + período) sobre esa base, igual que el back (WeeklyPlan#calculate_final_price).
  const freqDiscount = Number(weeklyPlan?.discount_percentage) || 0;

  const calculatePriceInfo = (months, periodDiscountRaw) => {
    const periodDiscount = Number(periodDiscountRaw) || 0;
    const base = monthlyPrice || 0;
    const undiscountedMonthly = freqDiscount < 100 ? base / (1 - freqDiscount / 100) : base;
    const totalDiscount = freqDiscount + periodDiscount;
    const subtotal = Math.round(undiscountedMonthly * months);
    const finalPrice = Math.round(undiscountedMonthly * months * (1 - totalDiscount / 100));
    const totalClasses = frequency * 4 * months;
    return { subtotal, finalPrice, totalClasses, freqDiscount, periodDiscount, totalDiscount };
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
        <h2>{isTrialClass ? 'Clase de prueba' : '¿Cuánto tiempo quieres estudiar?'}</h2>
      </div>

      {isTrialClass ? (
        <div className="trial-info">
          <p className="price">${monthlyPrice?.toLocaleString('es-CL')}</p>
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
                {priceInfo.totalDiscount > 0 && (
                  <span className="discount">{priceInfo.totalDiscount}% OFF</span>
                )}
                {(priceInfo.freqDiscount > 0 || priceInfo.periodDiscount > 0) && (
                  <span className="discount-breakdown">
                    {[
                      priceInfo.freqDiscount > 0 ? `${priceInfo.freqDiscount}% frecuencia` : null,
                      priceInfo.periodDiscount > 0 ? `${priceInfo.periodDiscount}% período` : null
                    ].filter(Boolean).join(' + ')}
                  </span>
                )}
                <span className="total-classes">{priceInfo.totalClasses} clases</span>
                <span className="price">${priceInfo.finalPrice.toLocaleString('es-CL')}</span>
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
