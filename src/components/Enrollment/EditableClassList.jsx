import { useState, useEffect } from 'react';
import './EditableClassList.css';

/**
 * Componente para editar las fechas de las clases programadas
 * Permite cambiar cada clase a fechas alternativas disponibles
 */
const EditableClassList = ({ classDates, availableDates, onClassDatesChange, dayOfWeek, onValidationChange }) => {
  const [expandedClass, setExpandedClass] = useState(null);

  // Detectar fechas duplicadas
  const findDuplicates = () => {
    const dateCount = {};
    const duplicates = new Set();

    classDates.forEach((date, index) => {
      if (!dateCount[date]) {
        dateCount[date] = [];
      }
      dateCount[date].push(index);
    });

    Object.entries(dateCount).forEach(([date, indices]) => {
      if (indices.length > 1) {
        indices.forEach(idx => duplicates.add(idx));
      }
    });

    return duplicates;
  };

  const duplicateIndices = findDuplicates();
  const hasDuplicates = duplicateIndices.size > 0;

  // Notificar al padre sobre el estado de validación
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(!hasDuplicates);
    }
  }, [hasDuplicates, onValidationChange]);

  // Filtrar fechas disponibles que sean del mismo día de la semana
  const getAvailableDatesForDay = () => {
    console.log('🔍 availableDates recibidas:', availableDates);
    console.log('🔍 Tipo de availableDates:', typeof availableDates, Array.isArray(availableDates));

    if (!availableDates || availableDates.length === 0) {
      console.log('⚠️ No hay availableDates disponibles');
      return [];
    }

    // Las availableDates ya vienen filtradas por día de la semana del Paso 1
    const mapped = availableDates.map(d => d.date || d);
    console.log('📅 Fechas mapeadas:', mapped);
    return mapped;
  };

  const availableDatesForDay = getAvailableDatesForDay();
  console.log('📋 EditableClassList - availableDatesForDay:', availableDatesForDay);
  console.log('📋 EditableClassList - classDates:', classDates);

  const handleToggleExpand = (index) => {
    console.log('🖱️ Click en cambiar fecha, clase:', index);
    console.log('🖱️ Estado actual expandedClass:', expandedClass);
    const newState = expandedClass === index ? null : index;
    console.log('🖱️ Nuevo estado expandedClass:', newState);
    setExpandedClass(newState);
  };

  const handleDateChange = (classIndex, newDate) => {
    const updatedDates = [...classDates];
    updatedDates[classIndex] = newDate;
    onClassDatesChange(updatedDates);
    setExpandedClass(null); // Cerrar el selector después de cambiar
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateShort = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="editable-class-list">
      <div className="list-header">
        <h3>✏️ Editar fechas de clases</h3>
        <p className="list-description">
          Puedes cambiar la fecha de cualquier clase a otra fecha disponible
        </p>
      </div>

      {hasDuplicates && (
        <div className="duplicate-warning-banner">
          <span className="warning-icon">⚠️</span>
          <div className="warning-content">
            <strong>Fechas duplicadas detectadas</strong>
            <p>Hay clases programadas para la misma fecha. Por favor, cambia las fechas duplicadas antes de continuar.</p>
          </div>
        </div>
      )}

      <div className="class-items">
        {classDates.map((date, index) => {
          const isExpanded = expandedClass === index;
          const isFirstClass = index === 0;
          const isDuplicate = duplicateIndices.has(index);

          return (
            <div key={index} className={`class-item ${isExpanded ? 'expanded' : ''} ${isDuplicate ? 'duplicate' : ''}`}>
              <div className="class-item-header">
                <div className="class-number">
                  <span className="number-badge">Clase {index + 1}</span>
                  {isFirstClass && <span className="first-class-badge">Primera clase</span>}
                  {isDuplicate && <span className="duplicate-badge">⚠️ Duplicada</span>}
                </div>

                <div className="class-date">
                  <span className="date-icon">📅</span>
                  <span className="date-text">{formatDate(date)}</span>
                </div>

                <button
                  className="change-date-btn"
                  onClick={() => handleToggleExpand(index)}
                >
                  {isExpanded ? (
                    <>
                      <span className="btn-icon">✕</span>
                      Cancelar
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">🔄</span>
                      Cambiar fecha
                    </>
                  )}
                </button>
              </div>

              {isExpanded && (
                <div className="date-selector">
                  <p className="selector-title">Selecciona una nueva fecha:</p>
                  <p style={{ fontSize: '0.8rem', color: '#666' }}>
                    Fechas disponibles: {availableDatesForDay.length}
                  </p>
                  <div className="available-dates-grid">
                    {availableDatesForDay.length === 0 ? (
                      <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#dc3545' }}>
                        No hay fechas disponibles para cambiar
                      </p>
                    ) : null}
                    {availableDatesForDay.map((availableDate) => {
                      const isCurrentDate = availableDate === date;
                      const isPast = new Date(availableDate) < new Date(new Date().setHours(0, 0, 0, 0));
                      const isDisabled = isPast;

                      return (
                        <button
                          key={availableDate}
                          className={`date-option ${isCurrentDate ? 'current' : ''}`}
                          onClick={() => !isDisabled && handleDateChange(index, availableDate)}
                          disabled={isDisabled}
                        >
                          <span className="date-option-text">
                            {formatDateShort(availableDate)}
                          </span>
                          {isCurrentDate && <span className="current-badge">Actual</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="list-footer">
        <div className="footer-icon">💡</div>
        <p className="footer-text">
          Los cambios se reflejarán automáticamente en el calendario de arriba
        </p>
      </div>
    </div>
  );
};

export default EditableClassList;
