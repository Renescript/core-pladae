import { useState } from 'react';
import './SimplifiedTechniqueSelector.css';
import './SimplifiedPlanConfigurator.css';

const SimplifiedPlanConfigurator = ({
  planType,
  frequency,
  selectedDays,
  onFrequencyChange,
  onDaysChange,
  onContinue,
  onBack
}) => {
  const days = [
    { id: 'monday', name: 'Lunes' },
    { id: 'tuesday', name: 'Martes' },
    { id: 'wednesday', name: 'Miércoles' },
    { id: 'thursday', name: 'Jueves' },
    { id: 'friday', name: 'Viernes' },
    { id: 'saturday', name: 'Sábado' }
  ];

  const handleDayToggle = (dayId) => {
    const maxDays = frequency || 1;

    if (selectedDays.includes(dayId)) {
      // Deseleccionar
      onDaysChange(selectedDays.filter(d => d !== dayId));
    } else {
      // Seleccionar
      if (selectedDays.length >= maxDays) {
        alert(`⚠️ Solo puedes seleccionar ${maxDays} día${maxDays > 1 ? 's' : ''} según la frecuencia elegida.`);
        return;
      }
      onDaysChange([...selectedDays, dayId]);
    }
  };

  const handleContinue = () => {
    if (!frequency) {
      alert('⚠️ Por favor selecciona una frecuencia.');
      return;
    }
    onContinue && onContinue();
  };

  return (
    <div className="simplified-step">
      <div className="step-progress">Paso 2 de 6</div>

      <h2 className="step-title">¿Cuántas veces a la semana quieres venir?</h2>

      {/* Frecuencia */}
      <div className="config-section">
        <h3 className="config-title">Frecuencia</h3>
        <div className="frequency-options">
          <div
            className={`frequency-card ${frequency === 1 ? 'selected' : ''}`}
            onClick={() => {
              onFrequencyChange(1);
              // Limpiar días seleccionados si cambia la frecuencia
              if (selectedDays.length > 1) {
                onDaysChange([]);
              }
            }}
          >
            <div className="frequency-number">1</div>
            <div className="frequency-label">vez / semana</div>
          </div>

          <div
            className={`frequency-card ${frequency === 2 ? 'selected' : ''}`}
            onClick={() => {
              onFrequencyChange(2);
              // Limpiar días seleccionados si cambia la frecuencia
              if (selectedDays.length > 2) {
                onDaysChange([]);
              }
            }}
          >
            <div className="frequency-number">2</div>
            <div className="frequency-label">veces / semana</div>
          </div>

          <div
            className={`frequency-card ${frequency === 3 ? 'selected' : ''}`}
            onClick={() => {
              onFrequencyChange(3);
              // Limpiar días seleccionados si cambia la frecuencia
              if (selectedDays.length > 3) {
                onDaysChange([]);
              }
            }}
          >
            <div className="frequency-number">3</div>
            <div className="frequency-label">veces / semana</div>
          </div>

          <div
            className={`frequency-card ${frequency === 4 ? 'selected' : ''}`}
            onClick={() => {
              onFrequencyChange(4);
              // Limpiar días seleccionados si cambia la frecuencia
              if (selectedDays.length > 4) {
                onDaysChange([]);
              }
            }}
          >
            <div className="frequency-number">4</div>
            <div className="frequency-label">veces / semana</div>
          </div>
        </div>
      </div>

      {/* Información */}
      {frequency && (
        <div className="config-section">
          <p className="info-note">
            ℹ️ En el siguiente paso seleccionarás {frequency} {frequency === 1 ? 'día y horario' : 'días y horarios'} para tus clases semanales
          </p>
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
          onClick={handleContinue}
          disabled={!frequency}
        >
          Elegir {frequency === 1 ? 'fecha y horario' : 'fechas y horarios'}
        </button>
      </div>
    </div>
  );
};

export default SimplifiedPlanConfigurator;
