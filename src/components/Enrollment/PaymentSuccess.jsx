import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getPaymentSummary } from '../../services/api';
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
  // El back manda enrollment_pending=1 cuando el pago SÍ se cobró pero la matrícula
  // quedó en revisión. Nunca hay que mostrar "pago fallido" con la plata cobrada.
  const enrollmentPending = searchParams.get('enrollment_pending') === '1';
  // Pago de una sesión especial (no un curso): el back manda kind y el nombre.
  const sessionTitle = searchParams.get('kind') === 'special_session' ? searchParams.get('session') : null;
  const summaryToken = searchParams.get('summary');

  // Último paso: escribir a Gustarte por WhatsApp para entrar al grupo del taller.
  // El back arma el mensaje con nombre, taller y horario; si falla, va uno genérico.
  const fallbackText = `Hola, acabo de inscribirme en Gustarte${buyOrder ? ` (orden ${buyOrder})` : ''}. ¿Me pueden agregar al grupo de WhatsApp?`;
  const [whatsappUrl, setWhatsappUrl] = useState(
    `https://wa.me/56923718373?text=${encodeURIComponent(fallbackText)}`
  );

  useEffect(() => {
    if (!summaryToken) return;
    let cancelled = false;
    getPaymentSummary(summaryToken)
      .then((data) => { if (!cancelled && data?.whatsapp_url) setWhatsappUrl(data.whatsapp_url); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [summaryToken]);

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

        <h1 className="ps-title">{enrollmentPending ? '¡Pago recibido!' : '¡Pago exitoso!'}</h1>
        <p className="ps-subtitle">
          {enrollmentPending
            ? 'Estamos terminando de confirmar tu inscripción y te escribimos hoy mismo'
            : sessionTitle
              ? `Tu lugar en ${sessionTitle} está confirmado. Te enviamos los detalles por correo.`
              : 'Tu inscripción ha sido confirmada'}
        </p>

        {enrollmentPending && (
          <div className="ps-info" role="alert">
            Tu pago quedó registrado correctamente. Nos falta un último paso para dejar tus clases
            agendadas y nuestro equipo ya está avisado. Guarda este comprobante: si quieres apurarnos,
            escríbenos al WhatsApp <a href="https://wa.me/56923718373">+56 9 2371 8373</a> con tu
            número de orden.
          </div>
        )}

        <div className="ps-whatsapp-step">
          <p className="ps-whatsapp-kicker">Último paso para completar tu inscripción</p>
          <p className="ps-whatsapp-text">
            Envíanos un mensaje por WhatsApp para agregarte al grupo de tu taller. El mensaje ya
            va escrito con tus datos: solo tienes que enviarlo.
          </p>
          <a className="ps-btn ps-btn--whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Enviar mensaje por WhatsApp
          </a>
        </div>

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
