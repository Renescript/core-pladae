import { useState } from 'react';
import './SimplifiedTechniqueSelector.css';
import './SimplifiedDataPayment.css';

const SimplifiedDataPayment = ({
  studentData,
  onStudentDataChange,
  paymentMethod,
  onPaymentMethodChange,
  onComplete,
  onBack
}) => {
  const [errors, setErrors] = useState({});

  const paymentMethods = [
    {
      id: 'webpay',
      name: 'Tarjeta (Webpay)',
      icon: '💳',
      description: 'Débito o Crédito'
    },
    {
      id: 'transfer',
      name: 'Transferencia',
      icon: '🏦',
      description: 'Transferencia bancaria'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '🔵',
      description: 'Pago internacional'
    }
  ];

  const handleInputChange = (field, value) => {
    onStudentDataChange({
      ...studentData,
      [field]: value
    });

    // Limpiar error del campo
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!studentData.firstName || studentData.firstName.trim() === '') {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!studentData.lastName || studentData.lastName.trim() === '') {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (!studentData.email || studentData.email.trim() === '') {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(studentData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!studentData.phone || studentData.phone.trim() === '') {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\+?[0-9]{8,15}$/.test(studentData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'El teléfono no es válido';
    }

    if (!paymentMethod) {
      newErrors.payment = 'Debes seleccionar un método de pago';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      onComplete && onComplete();
    } else {
      // Scroll al primer error
      const firstError = document.querySelector('.input-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="simplified-step">
      <div className="step-progress">Paso 6 de 6</div>

      <h2 className="step-title">Datos personales y pago</h2>

      <div className="data-payment-container">
        {/* Datos Personales */}
        <div className="form-section">
          <h3 className="form-section-title">Datos personales</h3>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                Nombre *
              </label>
              <input
                type="text"
                id="firstName"
                className={`form-input ${errors.firstName ? 'input-error' : ''}`}
                value={studentData.firstName || ''}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Tu nombre"
              />
              {errors.firstName && (
                <span className="error-message">{errors.firstName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Apellido *
              </label>
              <input
                type="text"
                id="lastName"
                className={`form-input ${errors.lastName ? 'input-error' : ''}`}
                value={studentData.lastName || ''}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Tu apellido"
              />
              {errors.lastName && (
                <span className="error-message">{errors.lastName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email *
              </label>
              <input
                type="email"
                id="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                value={studentData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="tu@email.com"
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Teléfono *
              </label>
              <input
                type="tel"
                id="phone"
                className={`form-input ${errors.phone ? 'input-error' : ''}`}
                value={studentData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+56 9 1234 5678"
              />
              {errors.phone && (
                <span className="error-message">{errors.phone}</span>
              )}
            </div>
          </div>
        </div>

        {/* Pago Seguro */}
        <div className="form-section">
          <h3 className="form-section-title">Pago seguro 🔒</h3>

          <div className="payment-methods-list">
            {paymentMethods.map(method => (
              <div
                key={method.id}
                className={`payment-method-card ${paymentMethod === method.id ? 'selected' : ''}`}
                onClick={() => onPaymentMethodChange(method.id)}
              >
                <div className="radio-indicator">
                  {paymentMethod === method.id && <div className="radio-dot"></div>}
                </div>

                <div className="payment-method-icon">{method.icon}</div>

                <div className="payment-method-content">
                  <h4 className="payment-method-name">{method.name}</h4>
                  <p className="payment-method-description">{method.description}</p>
                </div>
              </div>
            ))}
          </div>

          {errors.payment && (
            <span className="error-message">{errors.payment}</span>
          )}
        </div>
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
        >
          Confirmar inscripción
        </button>
      </div>
    </div>
  );
};

export default SimplifiedDataPayment;
