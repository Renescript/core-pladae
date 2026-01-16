import { useState, useEffect } from 'react';
import { getPaymentMethods } from '../../services/api';
import './TechniqueSelector.css';
import './SimplifiedDataPayment.css';

const SimplifiedDataPayment = ({
  studentData,
  onStudentDataChange,
  paymentMethod,
  onPaymentMethodChange,
  completedEnrollments = [],
  currentEnrollment,
  onComplete,
  onBack
}) => {
  const [errors, setErrors] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapeo de iconos por tipo de método de pago
  const getPaymentIcon = (methodName) => {
    const name = methodName.toLowerCase();
    if (name.includes('webpay') || name.includes('tarjeta') || name.includes('card')) {
      return '💳';
    }
    if (name.includes('transfer') || name.includes('banco')) {
      return '🏦';
    }
    if (name.includes('paypal')) {
      return '🔵';
    }
    if (name.includes('efectivo') || name.includes('cash')) {
      return '💵';
    }
    return '💰'; // Icono por defecto
  };

  // Cargar métodos de pago desde la API
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setLoading(true);
        const methods = await getPaymentMethods();
        console.log('💳 Métodos de pago cargados:', methods);
        setPaymentMethods(methods);
      } catch (error) {
        console.error('Error al cargar métodos de pago:', error);
        // Fallback en caso de error
        setPaymentMethods([
          {
            id: 1,
            payment_method: 'Webpay',
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentMethods();
  }, []);

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

  // Formatear horarios
  const formatSchedules = (schedules) => {
    if (!schedules || schedules.length === 0) return 'No especificado';
    const dayNames = {
      monday: 'Lun',
      tuesday: 'Mar',
      wednesday: 'Mié',
      thursday: 'Jue',
      friday: 'Vie',
      saturday: 'Sáb',
      sunday: 'Dom'
    };
    return schedules.map(s => `${dayNames[s.dayOfWeek]} ${s.timeSlot}`).join(', ');
  };

  // Calcular precio total de todos los cursos
  const calculateTotalPrice = () => {
    // Sumar precios de cursos completados
    const completedTotal = completedEnrollments.reduce((sum, enrollment) => {
      return sum + (enrollment._displayInfo?.priceInfo?.finalPrice || 0);
    }, 0);

    // Agregar precio del curso actual
    const currentPrice = currentEnrollment?.priceInfo?.finalPrice || 0;

    return completedTotal + currentPrice;
  };

  const totalCourses = completedEnrollments.length + 1;
  const totalPrice = calculateTotalPrice();

  return (
    <div className="simplified-step">
      <div className="step-progress">Paso 7 de 7</div>

      <h2 className="step-title">Datos personales y pago</h2>

      {/* Resumen de cursos */}
      {totalCourses > 1 && (
        <div className="courses-summary">
          <h3 className="summary-title">📚 Resumen de cursos ({totalCourses})</h3>
          <div className="courses-list">
            {completedEnrollments.map((enrollment, index) => (
              <div key={index} className="course-summary-card">
                <div className="course-number">Curso {index + 1}</div>
                <div className="course-details">
                  <h4>{enrollment._displayInfo?.technique}</h4>
                  <p>{enrollment._displayInfo?.frequency}x por semana • {enrollment._displayInfo?.durationMonths} {enrollment._displayInfo?.durationMonths === 1 ? 'mes' : 'meses'}</p>
                  <p className="course-schedule">{formatSchedules(enrollment._displayInfo?.schedules)}</p>
                  <p className="course-price">
                    ${enrollment._displayInfo?.priceInfo?.finalPrice?.toLocaleString('es-CL')}
                    {enrollment._displayInfo?.priceInfo?.discountPercent > 0 && (
                      <span className="discount-badge"> -{enrollment._displayInfo?.priceInfo?.discountPercent}%</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            <div className="course-summary-card current">
              <div className="course-number">Curso {totalCourses}</div>
              <div className="course-details">
                <h4>{currentEnrollment?.technique}</h4>
                <p>{currentEnrollment?.frequency}x por semana • {currentEnrollment?.durationMonths} {currentEnrollment?.durationMonths === 1 ? 'mes' : 'meses'}</p>
                <p className="course-schedule">{formatSchedules(currentEnrollment?.schedules)}</p>
                <p className="course-price">
                  ${currentEnrollment?.priceInfo?.finalPrice?.toLocaleString('es-CL')}
                  {currentEnrollment?.priceInfo?.discountPercent > 0 && (
                    <span className="discount-badge"> -{currentEnrollment?.priceInfo?.discountPercent}%</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Total general */}
          <div className="total-price-section">
            <div className="total-label">Total a pagar:</div>
            <div className="total-amount">${totalPrice.toLocaleString('es-CL')}</div>
          </div>
        </div>
      )}

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

          {loading ? (
            <div className="loading-message">
              <p>Cargando métodos de pago...</p>
            </div>
          ) : (
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

                  <div className="payment-method-icon">
                    {getPaymentIcon(method.payment_method)}
                  </div>

                  <div className="payment-method-content">
                    <h4 className="payment-method-name">{method.payment_method}</h4>
                  </div>
                </div>
              ))}
            </div>
          )}

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
