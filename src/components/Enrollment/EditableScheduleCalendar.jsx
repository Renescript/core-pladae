import React, { useState, useEffect } from 'react';
import ClassPreviewCalendar from './ClassPreviewCalendar';
import EditableClassList from './EditableClassList';
import './EditableScheduleCalendar.css';

const EditableScheduleCalendar = ({
  technique,
  frequency,
  selectedSchedules,
  durationMonths,
  classDates,
  availableDates,
  onClassDatesChange,
  onValidationChange,
  onContinue,
  onBack,
  onEditStep
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [editedDates, setEditedDates] = useState(classDates);
  const [isValid, setIsValid] = useState(true);

  // Sincronizar editedDates con classDates cuando cambian
  useEffect(() => {
    setEditedDates(classDates);
  }, [classDates]);

  // Notificar al padre cuando cambian las fechas editadas
  useEffect(() => {
    onClassDatesChange(editedDates);
  }, [editedDates, onClassDatesChange]);

  // Notificar validación
  useEffect(() => {
    onValidationChange(isValid);
  }, [isValid, onValidationChange]);

  const handleClassDatesChange = (newDates) => {
    setEditedDates(newDates);
  };

  const handleValidationChange = (valid) => {
    setIsValid(valid);
  };

  // Calcular precio
  const calculatePrice = () => {
    const pricePerClass = 7000;
    const monthlyPrice = pricePerClass * frequency * 4;
    const subtotal = monthlyPrice * durationMonths;

    const discounts = { 1: 0, 2: 10, 3: 15, 6: 20 };
    const discountPercent = discounts[durationMonths] || 0;
    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const finalPrice = subtotal - discountAmount;

    return {
      monthlyPrice,
      subtotal,
      discountPercent,
      discountAmount,
      finalPrice
    };
  };

  const priceInfo = calculatePrice();

  // Formatear horarios seleccionados
  const formatSchedules = () => {
    const dayNames = {
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };

    return selectedSchedules.map(schedule => {
      const dayName = dayNames[schedule.dayOfWeek];
      return `${dayName} ${schedule.timeSlot}`;
    }).join(', ');
  };

  const getFirstStartDate = () => {
    if (!selectedSchedules || selectedSchedules.length === 0) return null;
    const dates = selectedSchedules.map(s => s.date).sort();
    return dates[0];
  };

  const handleContinue = () => {
    if (!isValid) {
      alert('Por favor corrige las fechas duplicadas antes de continuar');
      return;
    }
    onContinue();
  };

  return (
    <div className="editable-schedule-calendar-container">
      <div className="editable-schedule-header">
        <h2>Revisa y confirma tus clases</h2>
        <p className="step-indicator">Paso 5 de 6</p>
      </div>

      <div className="summary-compact">
        <p className="summary-text">
          {editedDates.length} clases de {technique?.name || 'técnica seleccionada'} - {frequency} {frequency === 1 ? 'vez' : 'veces'}/semana - {durationMonths} {durationMonths === 1 ? 'mes' : 'meses'}
        </p>
      </div>

      <div className="schedule-content-layout">
        {/* Columna izquierda: Calendario */}
        <div className="calendar-section">
          <h3>Calendario de clases</h3>
          <ClassPreviewCalendar
            classDates={editedDates}
            startDate={getFirstStartDate()}
          />
        </div>

        {/* Columna derecha: Resumen y edición */}
        <div className="summary-section">
          <div className="summary-card">
            <h3>Resumen de inscripción</h3>

            <div className="summary-item">
              <label>Técnica:</label>
              <div className="summary-value">
                <span>{technique?.name || 'No seleccionada'}</span>
                <button
                  className="edit-btn"
                  onClick={() => onEditStep && onEditStep(1)}
                >
                  Editar
                </button>
              </div>
            </div>

            <div className="summary-item">
              <label>Horarios:</label>
              <div className="summary-value">
                <span>{formatSchedules()}</span>
                <button
                  className="edit-btn"
                  onClick={() => onEditStep && onEditStep(3)}
                >
                  Editar
                </button>
              </div>
            </div>

            <div className="summary-item">
              <label>Primera clase:</label>
              <div className="summary-value">
                <span>
                  {getFirstStartDate()
                    ? new Date(getFirstStartDate() + 'T00:00:00').toLocaleDateString('es-CL')
                    : 'No seleccionada'}
                </span>
                <button
                  className="edit-btn"
                  onClick={() => onEditStep && onEditStep(3)}
                >
                  Editar
                </button>
              </div>
            </div>

            <div className="summary-item">
              <label>Duración:</label>
              <div className="summary-value">
                <span>{durationMonths} {durationMonths === 1 ? 'mes' : 'meses'}</span>
                <button
                  className="edit-btn"
                  onClick={() => onEditStep && onEditStep(4)}
                >
                  Editar
                </button>
              </div>
            </div>

            <div className="summary-item">
              <label>Total de clases:</label>
              <div className="summary-value">
                <span>{editedDates.length} clases</span>
              </div>
            </div>

            <div className="summary-divider"></div>

            <div className="price-summary">
              {priceInfo.discountPercent > 0 && (
                <>
                  <div className="price-row">
                    <span>Subtotal:</span>
                    <span className="price-original">
                      ${priceInfo.subtotal.toLocaleString('es-CL')}
                    </span>
                  </div>
                  <div className="price-row discount-row">
                    <span>Descuento ({priceInfo.discountPercent}%):</span>
                    <span className="discount-amount">
                      -${priceInfo.discountAmount.toLocaleString('es-CL')}
                    </span>
                  </div>
                </>
              )}
              <div className="price-row total-row">
                <span>Total:</span>
                <span className="price-final">
                  ${priceInfo.finalPrice.toLocaleString('es-CL')}
                </span>
              </div>
              {priceInfo.discountPercent > 0 && (
                <div className="savings-badge">
                  ¡Ahorras ${priceInfo.discountAmount.toLocaleString('es-CL')}!
                </div>
              )}
            </div>
          </div>

          {/* Editor de fechas */}
          <div className="editor-section">
            <div className="editor-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={showEditor}
                  onChange={(e) => setShowEditor(e.target.checked)}
                />
                <span>Quiero cambiar algunas fechas</span>
              </label>
            </div>

            {showEditor && (
              <div className="editor-content">
                <EditableClassList
                  classDates={editedDates}
                  availableDates={availableDates}
                  onClassDatesChange={handleClassDatesChange}
                  dayOfWeek={selectedSchedules[0]?.dayOfWeek}
                  onValidationChange={handleValidationChange}
                />
                {!isValid && (
                  <div className="validation-warning">
                    ⚠️ Hay fechas duplicadas. Por favor corrige antes de continuar.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="schedule-actions">
        <button className="btn-secondary" onClick={onBack}>
          Volver
        </button>
        <button
          className="btn-primary"
          onClick={handleContinue}
          disabled={!isValid}
        >
          Ir a datos de pago
        </button>
      </div>
    </div>
  );
};

export default EditableScheduleCalendar;
