import React, { useState, useEffect } from 'react';
import { getPaymentPeriods } from '../../services/api';
import './DurationSelector.css';

const DurationSelector = ({
  selectedDuration,
  onDurationChange,
  frequency,
  monthlyPrice, // Precio mensual del plan semanal seleccionado
  weeklyPlan, // Plan semanal completo para detectar clase de prueba
  onContinue,
  onBack
}) => {
  const [durationOptions, setDurationOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detectar si es clase de prueba
  const isTrialClass = weeklyPlan?.weekly_classes === 1 && weeklyPlan?.number_of_classes === 1;

  // Cargar períodos de pago desde el API (solo si NO es clase de prueba)
  useEffect(() => {
    const loadPaymentPeriods = async () => {
      try {
        setLoading(true);

        // Si es clase de prueba, no cargar períodos de pago
        if (isTrialClass) {
          console.log('🎨 Es clase de prueba, no se cargan períodos de pago');
          setDurationOptions([]);
          setLoading(false);
          // Auto-seleccionar como una única clase
          onDurationChange(1);
          return;
        }

        const periods = await getPaymentPeriods();

        setDurationOptions(periods);
        console.log('📋 Períodos de pago cargados:', periods);
        console.log('💰 Precio mensual recibido:', monthlyPrice);
      } catch (error) {
        console.error('Error al cargar períodos de pago:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentPeriods();
  }, [monthlyPrice, isTrialClass]);

  // Calcular información de precio para cada opción
  const calculatePriceInfo = (months, discount) => {
    // El monthlyPrice ya viene del weekly_plan seleccionado en el paso 2
    const effectiveMonthlyPrice = monthlyPrice || 0;
    const subtotal = effectiveMonthlyPrice * months;
    const discountAmount = Math.round(subtotal * (discount / 100));
    const finalPrice = subtotal - discountAmount;
    // frequency ya está incluido en el weekly_plan, number_of_classes tiene el total mensual
    const totalClasses = frequency * 4 * months; // frecuencia semanal * 4 semanas * meses

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
        <h2>{isTrialClass ? 'Clase de prueba' : '¿Cuánto tiempo quieres estudiar?'}</h2>
        <p className="step-indicator">Paso 4 de 6</p>
      </div>

      {/* Vista para clase de prueba */}
      {isTrialClass ? (
        <div className="trial-class-payment">
          <div className="trial-class-card">
            <div className="trial-badge">
              <span className="trial-icon">🎨</span>
              <span>Clase de prueba</span>
            </div>

            <div className="trial-details">
              <h3>{weeklyPlan?.plan || 'Clase de prueba'}</h3>
              <p className="trial-description">
                {weeklyPlan?.description || 'Una clase para conocer el taller'}
              </p>
            </div>

            <div className="trial-price-section">
              <div className="trial-price-label">Precio</div>
              <div className="trial-price-value">
                ${monthlyPrice?.toLocaleString('es-CL')}
              </div>
              <div className="trial-price-note">
                1 clase incluida
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Vista normal de períodos de pago */
        <div className="duration-options-grid">
          {durationOptions.map((period) => {
            const priceInfo = calculatePriceInfo(period.months, period.discount_percentage);
            const isSelected = selectedDuration === period.months;

            return (
              <div
                key={period.id}
                className={`duration-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onDurationChange(period.months)}
              >
                {/* Badge para mejores ofertas */}
                {period.discount_percentage >= 30 && (
                  <div className="badge badge-best-value">
                    Mejor oferta
                  </div>
                )}
                {period.discount_percentage > 0 && period.discount_percentage < 30 && (
                  <div className="badge badge-popular">
                    Ahorro
                  </div>
                )}

                <div className="duration-card-header">
                  <h3>{period.months} {period.months === 1 ? 'mes' : 'meses'}</h3>
                  {period.discount_percentage > 0 && (
                    <div className="discount-badge">{period.discount_percentage}% OFF</div>
                  )}
                </div>

                <div className="duration-card-body">
                  <div className="total-classes">
                    {priceInfo.totalClasses} clases incluidas
                  </div>

                  {period.discount_percentage > 0 && (
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

                  {period.discount_percentage > 0 && (
                    <div className="savings">
                      Ahorras ${priceInfo.discountAmount.toLocaleString('es-CL')}
                    </div>
                  )}

                  {period.description && (
                    <div className="plan-description">
                      {period.description}
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
      )}

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
