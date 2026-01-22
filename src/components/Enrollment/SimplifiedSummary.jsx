import './TechniqueSelector.css';
import './SimplifiedSummary.css';

const SimplifiedSummary = ({
  technique,
  planType,
  frequency,
  selectedDays,
  startDate,
  timeSlot,
  totalClasses,
  totalPrice,
  onEditStep,
  onContinue,
  onBack
}) => {
  const getPlanTypeName = (type) => {
    const names = {
      'trial': 'Clase de prueba',
      'monthly': 'Plan mensual',
      'extended': 'Plan extendido',
      'mixed': 'Plan mixto'
    };
    return names[type] || type;
  };

  const getDayName = (dayId) => {
    const dayNames = {
      'monday': 'Lun',
      'tuesday': 'Mar',
      'wednesday': 'Mié',
      'thursday': 'Jue',
      'friday': 'Vie',
      'saturday': 'Sáb'
    };
    return dayNames[dayId] || dayId;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formatDays = () => {
    if (!selectedDays || selectedDays.length === 0) return '';
    return selectedDays.map(d => getDayName(d)).join(' y ');
  };

  return (
    <div className="simplified-step">
      <div className="step-progress">Paso 5 de 6</div>

      <h2 className="step-title">Revisa tu inscripción</h2>

      <div className="summary-container-simple">
        {/* Técnica */}
        <div className="summary-row">
          <div className="summary-label">Técnica:</div>
          <div className="summary-value">{technique?.name || '-'}</div>
          <button className="btn-edit" onClick={() => onEditStep(1)}>
            Editar
          </button>
        </div>

        {/* Plan */}
        <div className="summary-row">
          <div className="summary-label">Plan:</div>
          <div className="summary-value">{getPlanTypeName(planType)}</div>
          <button className="btn-edit" onClick={() => onEditStep(2)}>
            Editar
          </button>
        </div>

        {/* Clases */}
        {totalClasses && (
          <div className="summary-row">
            <div className="summary-label">Clases:</div>
            <div className="summary-value">{totalClasses}</div>
            <button className="btn-edit" onClick={() => onEditStep(2)}>
              Editar
            </button>
          </div>
        )}

        {/* Días */}
        {selectedDays && selectedDays.length > 0 && (
          <div className="summary-row">
            <div className="summary-label">Días:</div>
            <div className="summary-value">{formatDays()}</div>
            <button className="btn-edit" onClick={() => onEditStep(3)}>
              Editar
            </button>
          </div>
        )}

        {/* Horario */}
        {timeSlot && (
          <div className="summary-row">
            <div className="summary-label">Horario:</div>
            <div className="summary-value">{timeSlot}</div>
            <button className="btn-edit" onClick={() => onEditStep(4)}>
              Editar
            </button>
          </div>
        )}

        {/* Inicio */}
        {startDate && (
          <div className="summary-row">
            <div className="summary-label">Inicio:</div>
            <div className="summary-value">{formatDate(startDate)}</div>
            <button className="btn-edit" onClick={() => onEditStep(4)}>
              Editar
            </button>
          </div>
        )}
      </div>

      {/* Precio Total */}
      {totalPrice && (
        <div className="total-price-box">
          <div className="price-label-large">Total a pagar</div>
          <div className="price-amount-large">${totalPrice.toLocaleString('es-CL')} CLP</div>
        </div>
      )}

      <div className="step-actions-center">
        <button
          className="btn-secondary-large"
          onClick={onBack}
        >
          ← Volver
        </button>
        <button
          className="btn-primary-large"
          onClick={onContinue}
        >
          Ir a pagar
        </button>
      </div>
    </div>
  );
};

export default SimplifiedSummary;
