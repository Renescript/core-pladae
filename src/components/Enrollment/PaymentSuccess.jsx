import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './PaymentStatus.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Limpiar sessionStorage al confirmar pago exitoso
    try {
      sessionStorage.removeItem('enrollment_draft');
      sessionStorage.removeItem('test_enrollment_draft');
      console.log('🗑️ Drafts limpiados después de pago exitoso');
    } catch (error) {
      console.error('Error al limpiar drafts:', error);
    }
  }, []);

  // Extraer parámetros de la URL
  const buyOrder = searchParams.get('buy_order');
  const amount = searchParams.get('amount');
  const authCode = searchParams.get('authorization_code');
  const transactionDate = searchParams.get('transaction_date');
  const paymentType = searchParams.get('payment_type_code');

  const handlePrint = () => {
    window.print();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="payment-status-container">
      <div className="payment-status-card success">
        <div className="status-icon">✓</div>
        <h1>¡Pago Exitoso!</h1>
        <p className="status-message">Tu inscripción ha sido confirmada correctamente</p>

        <div className="payment-details">
          <h3>Detalles de la Transacción</h3>

          {buyOrder && (
            <div className="detail-row">
              <span className="label">Número de orden:</span>
              <span className="value">{buyOrder}</span>
            </div>
          )}

          {authCode && (
            <div className="detail-row">
              <span className="label">Código de autorización:</span>
              <span className="value">{authCode}</span>
            </div>
          )}

          {amount && (
            <div className="detail-row">
              <span className="label">Monto pagado:</span>
              <span className="value">${parseInt(amount).toLocaleString('es-CL')}</span>
            </div>
          )}

          {transactionDate && (
            <div className="detail-row">
              <span className="label">Fecha:</span>
              <span className="value">
                {new Date(transactionDate).toLocaleString('es-CL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}

          {paymentType && (
            <div className="detail-row">
              <span className="label">Tipo de pago:</span>
              <span className="value">
                {paymentType === 'VD' ? 'Tarjeta de Débito' :
                 paymentType === 'VN' ? 'Tarjeta de Crédito' :
                 paymentType === 'VC' ? 'Crédito en Cuotas' :
                 paymentType}
              </span>
            </div>
          )}
        </div>

        <div className="info-box">
          <p>Recibirás un correo electrónico con los detalles de tu inscripción y el comprobante de pago.</p>
        </div>

        <div className="actions">
          <button className="btn-secondary" onClick={handlePrint}>
            Imprimir Comprobante
          </button>
          <button className="btn-primary" onClick={handleGoHome}>
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
