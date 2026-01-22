import { useState, useEffect } from 'react';
import { getPlans } from '../../services/api';
import './TechniqueSelector.css';
import './SimplifiedClassQuantitySelector.css';

const SimplifiedClassQuantitySelector = ({
  selectedQuantity,
  onSelectQuantity,
  onContinue,
  onBack
}) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const plansData = await getPlans();
        console.log('📋 Planes cargados:', plansData);
        setPlans(plansData);
      } catch (error) {
        console.error('Error al cargar planes:', error);
        // Fallback a planes básicos si falla
        setPlans([
          {
            id: 1,
            plan: 'Plan Base',
            description: '4 clases mensuales',
            number_of_classes: 4,
            price: 50000,
            enrollment_amount: 10000
          },
          {
            id: 2,
            plan: 'Plan Estándar',
            description: '8 clases mensuales',
            number_of_classes: 8,
            price: 85000,
            enrollment_amount: 7000
          },
          {
            id: 3,
            plan: 'Plan Mixto',
            description: '16 clases mensuales',
            number_of_classes: 16,
            price: 120000,
            enrollment_amount: 20000
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const handleQuantityClick = (plan) => {
    onSelectQuantity(plan);
  };

  const handleContinue = () => {
    if (!selectedQuantity) {
      alert('⚠️ Por favor selecciona cuántas clases quieres tomar.');
      return;
    }
    onContinue && onContinue();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="simplified-step">
        <div className="loading-dates">
          <div className="spinner"></div>
          <p>Cargando planes disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="simplified-step">
      <div className="step-progress">Paso 2 de 5</div>

      <h2 className="step-title">¿Cuántas clases quieres tomar al mes?</h2>
      <p className="step-subtitle">Elige el plan que mejor se ajuste a tu disponibilidad</p>

      <div className="quantity-selector-container">
        {plans.map((plan) => {
          const isSelected = selectedQuantity?.id === plan.id;
          const pricePerClass = plan.price / plan.number_of_classes;

          return (
            <div
              key={plan.id}
              className={`quantity-card ${isSelected ? 'quantity-selected' : ''}`}
              onClick={() => handleQuantityClick(plan)}
            >
              <div className="quantity-radio">
                {isSelected && <div className="quantity-radio-dot"></div>}
              </div>

              <div className="quantity-content">
                <div className="quantity-header">
                  <h3 className="quantity-title">{plan.plan}</h3>
                  {plan.number_of_classes === 8 && (
                    <span className="quantity-badge">Más popular</span>
                  )}
                </div>

                <div className="quantity-classes">
                  <span className="quantity-number">{plan.number_of_classes}</span>
                  <span className="quantity-label">clases al mes</span>
                </div>

                <div className="quantity-pricing">
                  <div className="quantity-total">
                    <span className="quantity-price-label">Mensualidad</span>
                    <span className="quantity-price">{formatPrice(plan.price)}</span>
                  </div>
                  <div className="quantity-per-class">
                    {formatPrice(pricePerClass)} por clase
                  </div>
                </div>

                {plan.enrollment_amount > 0 && (
                  <div className="quantity-enrollment">
                    + Matrícula: {formatPrice(plan.enrollment_amount)} (pago único)
                  </div>
                )}

                <p className="quantity-description">{plan.description}</p>
              </div>
            </div>
          );
        })}
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
          disabled={!selectedQuantity}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default SimplifiedClassQuantitySelector;
