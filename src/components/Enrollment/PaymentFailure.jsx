import { useSearchParams, useNavigate } from 'react-router-dom';
import './PaymentStatus.css';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extraer parámetros de la URL
  const reason = searchParams.get('reason') || 'No especificado';
  const buyOrder = searchParams.get('buy_order');
  const errorCode = searchParams.get('error_code');

  const getErrorMessage = (code) => {
    const errorMessages = {
      'USER_CANCELLED': 'El usuario canceló la transacción',
      'TIMEOUT': 'La transacción excedió el tiempo límite',
      'REJECTED': 'La transacción fue rechazada por el banco',
      'INSUFFICIENT_FUNDS': 'Fondos insuficientes',
      'INVALID_CARD': 'Tarjeta inválida o no autorizada',
      'NETWORK_ERROR': 'Error de conexión con Transbank'
    };
    return errorMessages[code] || reason;
  };

  const handleRetry = () => {
    // Volver a la página de inscripción
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    // Redirigir a página de contacto o abrir email
    window.location.href = 'mailto:soporte@pladae.com?subject=Problema con pago - Orden ' + buyOrder;
  };

  return (
    <div className="payment-status-container">
      <div className="payment-status-card failure">
        <div className="status-icon">✗</div>
        <h1>Pago No Realizado</h1>
        <p className="status-message">Tu transacción no pudo ser completada</p>

        <div className="failure-details">
          <h3>Información del Error</h3>

          <div className="detail-row">
            <span className="label">Razón:</span>
            <span className="value">{getErrorMessage(errorCode)}</span>
          </div>

          {buyOrder && (
            <div className="detail-row">
              <span className="label">Número de orden:</span>
              <span className="value">{buyOrder}</span>
            </div>
          )}

          {errorCode && (
            <div className="detail-row">
              <span className="label">Código de error:</span>
              <span className="value">{errorCode}</span>
            </div>
          )}
        </div>

        <div className="info-box warning">
          <h4>¿Qué hacer ahora?</h4>
          <ul>
            <li>Verifica que tu tarjeta tenga fondos suficientes</li>
            <li>Confirma que los datos de tu tarjeta sean correctos</li>
            <li>Intenta con otro medio de pago</li>
            <li>Si el problema persiste, contacta a tu banco o a nuestro soporte</li>
          </ul>
        </div>

        <div className="actions">
          <button className="btn-secondary" onClick={handleGoHome}>
            Volver al Inicio
          </button>
          <button className="btn-primary" onClick={handleRetry}>
            Intentar Nuevamente
          </button>
        </div>

        <div className="support-section">
          <p>¿Necesitas ayuda?</p>
          <button className="btn-link" onClick={handleContactSupport}>
            Contactar Soporte
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
