import { useState } from 'react';

const SimplifiedDataPayment = ({
  studentData,
  onStudentDataChange,
  completedEnrollments = [],
  currentEnrollment,
  onComplete,
  onBack
}) => {
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    onStudentDataChange({ ...studentData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!studentData.firstName?.trim()) newErrors.firstName = 'Requerido';
    if (!studentData.lastName?.trim()) newErrors.lastName = 'Requerido';
    if (!studentData.email?.trim()) newErrors.email = 'Requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentData.email)) newErrors.email = 'Email inválido';
    if (!studentData.phone?.trim()) newErrors.phone = 'Requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete();
    }
  };

  const calculateTotal = () => {
    let total = 0;
    completedEnrollments.forEach(e => {
      total += e._displayInfo?.priceInfo?.finalPrice || 0;
    });
    total += currentEnrollment?.priceInfo?.finalPrice || 0;
    return total;
  };

  const isFormComplete = () => {
    return (
      studentData.firstName?.trim() &&
      studentData.lastName?.trim() &&
      studentData.email?.trim() &&
      studentData.phone?.trim()
    );
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-indicator">Paso 7 de 7</span>
        <h2>Datos y pago</h2>
      </div>

      <div className="form-section">
        <h3>Tus datos</h3>
        <div className="form-grid">
          <div className="form-field">
            <label>Nombre</label>
            <input
              type="text"
              value={studentData.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
          </div>
          <div className="form-field">
            <label>Apellido</label>
            <input
              type="text"
              value={studentData.lastName || ''}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
          </div>
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              value={studentData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>
          <div className="form-field">
            <label>Teléfono</label>
            <input
              type="tel"
              value={studentData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-msg">{errors.phone}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Método de pago</h3>
        <div className="payment-method-single">
          <img src="/webpay.png" alt="Webpay - Transbank" className="webpay-logo" />
          {/* <p className="payment-description">Pago seguro con tarjeta de crédito o débito</p> */}
        </div>
      </div>

      <div className="total-section">
        <h3>Total a pagar:</h3>
        <span className="total-amount">${calculateTotal().toLocaleString('es-CL')}</span>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>Volver</button>
        <button type="button" className="btn-primary" onClick={handleSubmit} disabled={!isFormComplete()}>
          Pagar
        </button>
      </div>
    </div>
  );
};

export default SimplifiedDataPayment;
