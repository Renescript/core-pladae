import React, { useState, useEffect } from 'react';
import { getDurationPlans } from '../../services/api';
import './DurationSelector.css';

const DurationSelector = ({
  selectedDuration,
  onDurationChange,
  frequency,
  monthlyPrice, // Precio mensual calculado desde el padre
  onContinue,
  onBack
}) => {
  const [durationOptions, setDurationOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar planes de duración desde el API
  useEffect(() => {
    const loadDurationPlans = async () => {
      try {
        setLoading(true);
        const plans = await getDurationPlans();

        // Filtrar solo planes activos y ordenar
        const activePlans = plans
          .filter(plan => plan.active)
          .sort((a, b) => a.order - b.order);

        setDurationOptions(activePlans);
        console.log('📋 Planes de duración cargados:', activePlans);
      } catch (error) {
        console.error('Error al cargar planes de duración:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDurationPlans();
  }, []);

  // Calcular información de precio para cada opción
  const calculatePriceInfo = (months, discount) => {
    // Usar el precio mensual pasado como prop, o calcular uno por defecto
    const effectiveMonthlyPrice = monthlyPrice || (15000 * frequency * 4);
    const subtotal = effectiveMonthlyPrice * months;
    const discountAmount = Math.round(subtotal * (discount / 100));
    const finalPrice = subtotal - discountAmount;
    const totalClasses = frequency * 4 * months;

    return {
      monthlyPrice: effectiveMonthlyPrice,
      subtotal,
      discountAmount,
      finalPrice,
      totalClasses
    };
  };

  const handleContinue = () => {
    if (!selectedDuration) {
      alert('Por favor selecciona una duración');
      return;
    }
    onContinue();
  };

  if (loading) {
    return (
      <div className="duration-selector-container">
        <div className="duration-selector-header">
          <h2>¿Cuánto tiempo quieres estudiar?</h2>
          <p className="step-indicator">Paso 4 de 6</p>
        </div>
        <div className="loading-plans">
          <div className="spinner"></div>
          <p>Cargando opciones de duración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="duration-selector-container">
      <div className="duration-selector-header">
        <h2>¿Cuánto tiempo quieres estudiar?</h2>
        <p className="step-indicator">Paso 4 de 6</p>
      </div>

      <div className="duration-options-grid">
        {durationOptions.map((option) => {
          const priceInfo = calculatePriceInfo(option.months, option.discount_percentage);
          const isSelected = selectedDuration === option.months;

          return (
            <div
              key={option.id || option.months}
              className={`duration-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onDurationChange(option.months)}
            >
              {option.is_popular && (
                <div className="badge badge-popular">
                  {option.badge || 'Más popular'}
                </div>
              )}
              {option.is_best_value && (
                <div className="badge badge-best-value">
                  {option.badge || 'Mejor oferta'}
                </div>
              )}

              <div className="duration-card-header">
                <h3>{option.name || `${option.months} ${option.months === 1 ? 'mes' : 'meses'}`}</h3>
                {option.discount_percentage > 0 && (
                  <div className="discount-badge">{option.discount_percentage}% OFF</div>
                )}
              </div>

              <div className="duration-card-body">
                <div className="total-classes">
                  {priceInfo.totalClasses} clases incluidas
                </div>

                {option.discount_percentage > 0 && (
                  <div className="price-original">
                    ${priceInfo.subtotal.toLocaleString('es-CL')}
                  </div>
                )}

                <div className="price-final">
                  ${priceInfo.finalPrice.toLocaleString('es-CL')}
                </div>

                <div className="price-monthly">
                  ${priceInfo.monthlyPrice.toLocaleString('es-CL')}/mes
                </div>

                {option.discount_percentage > 0 && (
                  <div className="savings">
                    Ahorras ${priceInfo.discountAmount.toLocaleString('es-CL')}
                  </div>
                )}

                {option.description && (
                  <div className="plan-description">
                    {option.description}
                  </div>
                )}
              </div>

              {isSelected && (
                <div className="selection-checkmark">✓</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="duration-selector-actions">
        <button className="btn-secondary" onClick={onBack}>
          Volver
        </button>
        <button
          className="btn-primary"
          onClick={handleContinue}
          disabled={!selectedDuration}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default DurationSelector;
