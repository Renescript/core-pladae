import { useState, useEffect } from 'react';
import { getPaymentMethods } from '../../services/api';

const PaymentWebpay = ({ enrollmentData, onBack, onComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { course, plan, sections, student } = enrollmentData;
  // TODO: El precio será agregado al backend próximamente
  const totalAmount = plan.price || 0;

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        const methods = await getPaymentMethods();
        setPaymentMethods(methods);
        // Seleccionar el primer método por defecto
        if (methods.length > 0) {
          setSelectedPaymentMethod(methods[0]);
        }
        setError(null);
      } catch (err) {
        console.error('Error al cargar métodos de pago:', err);
        setError('No se pudieron cargar los métodos de pago.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    setIsProcessing(true);

    try {
      // Llamar directamente al endpoint de enrollments
      await onComplete({
        paymentMethodId: selectedPaymentMethod.id,
        paymentStatus: 'approved',
        transactionId: `TRX-${Date.now()}`,
        paymentDate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al procesar inscripción:', error);
      setIsProcessing(false);
      alert('Hubo un error al procesar tu inscripción. Por favor intenta nuevamente.');
    }
  };

  if (loading) {
    return (
      <div className="enrollment-step">
        <h2>Paso 5: Proceso de Pago</h2>
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Cargando métodos de pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enrollment-step">
        <h2>Paso 5: Proceso de Pago</h2>
        <div className="error-message">
          <p>{error}</p>
        </div>
        <div className="step-actions">
          <button className="btn-secondary" onClick={onBack}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="enrollment-step">
      <h2>Paso 4: Proceso de Pago</h2>

      <div className="payment-summary">
        <h3>Resumen de tu Inscripción</h3>

        <div className="summary-section">
          <h4>Curso y Horario</h4>
          {enrollmentData.schedule ? (
            <>
              <p>{enrollmentData.schedule.courseName}</p>
              <p className="summary-detail">
                {enrollmentData.schedule.day?.toUpperCase()} • {enrollmentData.schedule.timeSlot}
              </p>
              <p className="summary-detail">Profesor: {enrollmentData.schedule.teacher}</p>
              {enrollmentData.schedule.selectedDate && (
                <p className="summary-detail">
                  Inicio: {new Date(enrollmentData.schedule.selectedDate.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </>
          ) : course ? (
            <>
              <p>{course.name}</p>
              <p className="summary-detail">Duración: {course.duration} - Instructor: {course.instructor}</p>
            </>
          ) : null}
        </div>

        <div className="summary-section">
          <h4>Plan</h4>
          <p>{plan.plan}</p>
          <p className="summary-detail">{plan.description}</p>
          {plan.number_of_classes && (
            <p className="summary-detail">{plan.number_of_classes} clases incluidas</p>
          )}
        </div>

        {sections && sections.length > 0 && (
          <div className="summary-section">
            <h4>Horarios Seleccionados ({sections.length} {sections.length === 1 ? 'clase' : 'clases'})</h4>
            {sections.map((section, index) => (
              <div key={section.id} className="section-summary">
                <p className="section-title">Clase {index + 1}: {section.teacher_name}</p>
                {section.schedule && section.schedule.map((scheduleItem, idx) => (
                  <p key={idx} className="summary-detail">
                    {scheduleItem.day} {scheduleItem.start_time} - {scheduleItem.end_time}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="summary-section">
          <h4>Estudiante</h4>
          <p>{student.firstName} {student.lastName}</p>
          <p className="summary-detail">{student.email}</p>
        </div>

        <div className="payment-total">
          <span>Total a Pagar:</span>
          <span className="total-amount">${totalAmount.toLocaleString('es-CL')}</span>
        </div>
      </div>

      {/* Selección de método de pago */}
      <div className="payment-method-selection">
        <h3>Selecciona tu método de pago</h3>
        <div className="payment-methods-grid">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`payment-method-option ${selectedPaymentMethod?.id === method.id ? 'selected' : ''}`}
              onClick={() => setSelectedPaymentMethod(method)}
            >
              <div className="payment-method-icon">
                {method.payment_method.toLowerCase().includes('tarjeta') ? '💳' : '💰'}
              </div>
              <div className="payment-method-name">{method.payment_method}</div>
              {method.description && (
                <div className="payment-method-description">{method.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="payment-container">
        {isProcessing ? (
          <div className="processing-payment">
            <div className="spinner"></div>
            <p>Procesando pago...</p>
            <p className="processing-info">No cierres esta ventana</p>
          </div>
        ) : (
          <>
            <p className="payment-info">
              Al hacer clic en "Confirmar Pago", procesaremos tu inscripción con el método seleccionado.
            </p>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onBack}>
                Volver
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handlePayment}
                disabled={!selectedPaymentMethod}
              >
                Confirmar Pago {selectedPaymentMethod && `con ${selectedPaymentMethod.payment_method}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentWebpay;
