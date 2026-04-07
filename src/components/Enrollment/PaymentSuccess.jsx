import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './PaymentStatus.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      sessionStorage.removeItem('enrollment_draft');
      sessionStorage.removeItem('test_enrollment_draft');
      sessionStorage.removeItem('professional_enrollment_draft');
    } catch (error) {
      console.error('Error al limpiar drafts:', error);
    }
  }, []);

  const buyOrder = searchParams.get('buy_order');
  const amount = searchParams.get('amount');
  const authCode = searchParams.get('authorization_code');
  const transactionDate = searchParams.get('transaction_date');
  const paymentType = searchParams.get('payment_type_code');

  const getPaymentTypeName = (code) => {
    const types = { VD: 'Débito', VN: 'Crédito', VC: 'Crédito en cuotas', SI: 'Sin interés', S2: 'Sin interés 2' };
    return types[code] || code;
  };

  return (
    <div className="ps-page">
      <div className="ps-card">
        <img src="/logo-gustarte-letras.png" alt="Gustarte" className="ps-logo" />

        <div className="ps-icon ps-icon--success">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20,6 9,17 4,12" />
          </svg>
        </div>

        <h1 className="ps-title">¡Pago exitoso!</h1>
        <p className="ps-subtitle">Tu inscripción ha sido confirmada</p>

        <div className="ps-details">
          {amount && (
            <div className="ps-detail-row ps-detail-row--highlight">
              <span className="ps-detail-label">Monto pagado</span>
              <span className="ps-detail-value ps-detail-price">${parseInt(amount).toLocaleString('es-CL')}</span>
            </div>
          )}
          {buyOrder && (
            <div className="ps-detail-row">
              <span className="ps-detail-label">N° de orden</span>
              <span className="ps-detail-value ps-detail-mono">{buyOrder}</span>
            </div>
          )}
          {authCode && (
            <div className="ps-detail-row">
              <span className="ps-detail-label">Autorización</span>
              <span className="ps-detail-value ps-detail-mono">{authCode}</span>
            </div>
          )}
          {transactionDate && (
            <div className="ps-detail-row">
              <span className="ps-detail-label">Fecha</span>
              <span className="ps-detail-value">
                {new Date(transactionDate).toLocaleString('es-CL', {
                  year: 'numeric', month: 'long', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
          )}
          {paymentType && (
            <div className="ps-detail-row">
              <span className="ps-detail-label">Tipo de pago</span>
              <span className="ps-detail-value">{getPaymentTypeName(paymentType)}</span>
            </div>
          )}
        </div>

        {/* <div className="ps-info">
          Recibirás un correo electrónico con los detalles de tu inscripción y el comprobante de pago.
        </div> */}

        <div className="ps-actions">
          <button className="ps-btn ps-btn--secondary" onClick={() => window.print()}>
            Imprimir comprobante
          </button>
          <button className="ps-btn ps-btn--primary" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
