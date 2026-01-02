import { useState, useEffect } from 'react';
import { getPaymentMethods } from '../../services/api';

const PaymentWebpay = ({ enrollmentData, onBack, onComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { schedules = [], startDates = {}, plan, student } = enrollmentData;
  const totalAmount = plan?.price || 0;

  const getDayName = (day) => {
    const dayNames = {
      'monday': 'Lunes',
      'tuesday': 'Martes',
      'wednesday': 'Miércoles',
      'thursday': 'Jueves',
      'friday': 'Viernes',
      'saturday': 'Sábado',
      'sunday': 'Domingo'
    };
    return dayNames[day?.toLowerCase()] || day;
  };

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

        {/* Cursos y Horarios */}
        {schedules.length > 0 && (
          <div className="summary-card">
            <div className="summary-card-header">
              Cursos y Horarios ({schedules.length} {schedules.length === 1 ? 'curso' : 'cursos'})
            </div>
            <div className="summary-card-content">
              {schedules.map((schedule, index) => {
                const sectionId = schedule.section?.id;
                const startDate = startDates[sectionId];
                return (
                  <div key={sectionId || index} className="course-summary-item-payment">
                    {index > 0 && <div className="course-divider"></div>}
                    <div className="info-row">
                      <span className="info-label">Curso {schedules.length > 1 ? `${index + 1}:` : ':'}</span>
                      <span className="info-value">{schedule.courseName}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Horario:</span>
                      <span className="info-value">{getDayName(schedule.day)} {schedule.timeSlot}</span>
                    </div>
                    {schedule.teacher && (
                      <div className="info-row">
                        <span className="info-label">Profesor/a:</span>
                        <span className="info-value">{schedule.teacher}</span>
                      </div>
                    )}
                    {startDate && (
                      <div className="info-row">
                        <span className="info-label">Inicio:</span>
                        <span className="info-value">
                          {new Date(startDate + 'T00:00:00').toLocaleDateString('es-ES', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Plan */}
        <div className="summary-card">
          <div className="summary-card-header">Plan Seleccionado</div>
          <div className="summary-card-content">
            <div className="info-row">
              <span className="info-label">Plan:</span>
              <span className="info-value">{plan.plan}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Descripción:</span>
              <span className="info-value">{plan.description}</span>
            </div>
            {plan.number_of_classes && (
              <div className="info-row">
                <span className="info-label">Clases:</span>
                <span className="info-value">{plan.number_of_classes} clases incluidas</span>
              </div>
            )}
          </div>
        </div>

        {/* Estudiante */}
        <div className="summary-card">
          <div className="summary-card-header">Datos del Estudiante</div>
          <div className="summary-card-content">
            <div className="info-row">
              <span className="info-label">Nombre:</span>
              <span className="info-value">{student.firstName} {student.lastName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{student.email}</span>
            </div>
            {student.phone && (
              <div className="info-row">
                <span className="info-label">Teléfono:</span>
                <span className="info-value">{student.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="payment-total-card">
          <span className="total-label">Total a Pagar</span>
          <span className="total-amount">${totalAmount.toLocaleString('es-CL')} CLP</span>
        </div>
      </div>

      {/* Selección de método de pago */}
      <div className="payment-method-selection">
        <h3>Selecciona tu método de pago</h3>
        <div className="payment-methods-simple">
          {paymentMethods.map((method) => {
            const isWebpay = method.payment_method.toLowerCase().includes('webpay') ||
                           method.payment_method.toLowerCase().includes('transbank') ||
                           method.payment_method.toLowerCase().includes('tarjeta');

            return (
              <div
                key={method.id}
                className={`payment-logo-wrapper ${selectedPaymentMethod?.id === method.id ? 'selected' : ''}`}
                onClick={() => setSelectedPaymentMethod(method)}
              >
                {isWebpay ? (
                  <img src="/webpay.png" alt="Webpay" className="webpay-logo-large" />
                ) : (
                  <span className="payment-emoji-large">💰</span>
                )}
              </div>
            );
          })}
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
