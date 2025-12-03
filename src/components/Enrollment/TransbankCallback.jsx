import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmTransbankPayment } from '../../services/api';
import './TransbankCallback.css';

const TransbankCallback = () => {
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        // Extraer token_ws de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const tokenWs = urlParams.get('token_ws');

        if (!tokenWs) {
          setStatus('error');
          setError('No se recibió el token de pago');
          return;
        }

        console.log('Token recibido de Transbank:', tokenWs);

        // Enviar token al backend para confirmar transacción
        const result = await confirmTransbankPayment(tokenWs);

        console.log('Resultado de confirmación:', result);

        if (result.success) {
          setStatus('success');
          setPaymentData(result.data);
        } else {
          setStatus('error');
          setError(result.message || 'El pago no pudo ser procesado');
        }
      } catch (err) {
        console.error('Error al confirmar pago:', err);
        setStatus('error');
        setError(err.message || 'Error al confirmar el pago con Transbank');
      }
    };

    confirmPayment();
  }, []);

  const handleContinue = () => {
    // Redirigir a la página principal o de éxito
    navigate('/');
  };

  if (status === 'processing') {
    return (
      <div className="transbank-callback-container">
        <div className="callback-card">
          <div className="spinner-large"></div>
          <h2>Confirmando tu pago...</h2>
          <p>Por favor espera mientras verificamos tu transacción con Transbank</p>
          <p className="warning-text">⚠️ No cierres esta ventana</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="transbank-callback-container">
        <div className="callback-card success">
          <div className="success-icon">✓</div>
          <h2>¡Pago Exitoso!</h2>
          <p className="success-message">Tu inscripción ha sido confirmada correctamente</p>

          {paymentData && (
            <div className="payment-details">
              <h3>Detalles del Pago</h3>
              <div className="detail-row">
                <span className="label">Código de autorización:</span>
                <span className="value">{paymentData.authorization_code}</span>
              </div>
              <div className="detail-row">
                <span className="label">Monto:</span>
                <span className="value">${paymentData.amount?.toLocaleString('es-CL')}</span>
              </div>
              <div className="detail-row">
                <span className="label">Fecha:</span>
                <span className="value">{new Date(paymentData.transaction_date).toLocaleString('es-CL')}</span>
              </div>
              {paymentData.payment_type_code && (
                <div className="detail-row">
                  <span className="label">Tipo de pago:</span>
                  <span className="value">
                    {paymentData.payment_type_code === 'VD' ? 'Débito' :
                     paymentData.payment_type_code === 'VN' ? 'Crédito' :
                     paymentData.payment_type_code}
                  </span>
                </div>
              )}
            </div>
          )}

          <button className="btn-primary" onClick={handleContinue}>
            Continuar
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="transbank-callback-container">
        <div className="callback-card error">
          <div className="error-icon">✕</div>
          <h2>Error en el Pago</h2>
          <p className="error-message">{error}</p>

          <div className="error-actions">
            <button className="btn-secondary" onClick={() => navigate('/')}>
              Volver al Inicio
            </button>
            <button className="btn-primary" onClick={() => navigate('/enrollment')}>
              Intentar Nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TransbankCallback;
