import { useSearchParams, useNavigate } from 'react-router-dom';
import './PaymentStatus.css';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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

  return (
    <div className="ps-page">
      <div className="ps-card">
        <img src="/logo-gustarte-letras.png" alt="Gustarte" className="ps-logo" />

        <div className="ps-icon ps-icon--error">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>

        <h1 className="ps-title">Pago no realizado</h1>
        <p className="ps-subtitle">Tu transacción no pudo ser completada</p>

        <div className="ps-details">
          <div className="ps-detail-row">
            <span className="ps-detail-label">Razón</span>
            <span className="ps-detail-value">{getErrorMessage(errorCode)}</span>
          </div>
          {buyOrder && (
            <div className="ps-detail-row">
              <span className="ps-detail-label">N° de orden</span>
              <span className="ps-detail-value ps-detail-mono">{buyOrder}</span>
            </div>
          )}
          {errorCode && (
            <div className="ps-detail-row">
              <span className="ps-detail-label">Código</span>
              <span className="ps-detail-value ps-detail-mono">{errorCode}</span>
            </div>
          )}
        </div>

        <div className="ps-help">
          <p className="ps-help-title">¿Qué puedes hacer?</p>
          <ul className="ps-help-list">
            <li>Verifica que tu tarjeta tenga fondos suficientes</li>
            <li>Confirma que los datos de tu tarjeta sean correctos</li>
            <li>Intenta con otro medio de pago</li>
          </ul>
        </div>

        <div className="ps-actions">
          <button className="ps-btn ps-btn--secondary" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
          <button className="ps-btn ps-btn--primary" onClick={() => navigate('/inscripcion')}>
            Intentar nuevamente
          </button>
        </div>

        <p className="ps-footer-text">
          ¿Necesitas ayuda? <a href="mailto:contacto@gustarte.cl?subject=Problema con pago" className="ps-link">Contáctanos</a>
        </p>
      </div>
    </div>
  );
};

export default PaymentFailure;
