import { useState, useEffect } from 'react';
import { getCoursesSchedulesGrid } from '../../services/api';
import './ProfessionalEnrollment.css';

const ProfessionalTechniqueSelector = ({ selectedTechnique, onSelectTechnique, onContinue }) => {
  const [techniques, setTechniques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const timeSlots = [
    '10:00 - 12:00',
    '12:30 - 14:30',
    '15:30 - 16:30',
    '18:30 - 20:30'
  ];

  useEffect(() => {
    const loadTechniques = async () => {
      try {
        setLoading(true);
        const coursesData = await getCoursesSchedulesGrid();
        setTechniques(coursesData);
      } catch (error) {
        console.error('Error al cargar técnicas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTechniques();
  }, []);

  const handleContinue = () => {
    if (!selectedTechnique) {
      alert('Por favor selecciona una técnica para continuar.');
      return;
    }
    onContinue && onContinue();
  };

  if (loading) {
    return (
      <div className="prof-step">
        <div className="prof-step-header">
          <span className="prof-step-number">Paso 1 de 6</span>
          <h1 className="prof-step-title">Cargando...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="prof-step">
      <div className="prof-step-header">
        <span className="prof-step-number">Paso 1 de 6</span>
        <h1 className="prof-step-title">¿Qué técnica te gustaría aprender?</h1>
      </div>

      <div className="prof-techniques-grid">
        {techniques.map(technique => (
          <div
            key={technique.id}
            className={`prof-technique-card ${selectedTechnique?.id === technique.id ? 'selected' : ''}`}
            onClick={() => onSelectTechnique(technique)}
          >
            <h3 className="prof-card-title">{technique.name}</h3>
            <p className="prof-card-description">
              {technique.name === 'Óleo' && 'Técnica clásica de pintura con pigmentos y aceite'}
              {technique.name === 'Acuarela' && 'Pintura con pigmentos solubles en agua'}
              {technique.name === 'Dibujo' && 'Representación gráfica con lápiz, carboncillo o tinta'}
              {technique.name === 'Escultura' && 'Arte tridimensional en diversos materiales'}
              {!['Óleo', 'Acuarela', 'Dibujo', 'Escultura'].includes(technique.name) && 'Técnica artística especializada'}
            </p>
            {selectedTechnique?.id === technique.id && (
              <div className="prof-selected-indicator"></div>
            )}
          </div>
        ))}
      </div>

      {/* Calendario informativo colapsable */}
      <div className="prof-calendar-section">
        <button
          className="prof-calendar-toggle"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <span>Ver disponibilidad semanal</span>
          <span className={`toggle-icon ${showCalendar ? 'open' : ''}`}>▼</span>
        </button>

        {showCalendar && (
          <div className="prof-calendar-content">
            <p className="prof-calendar-note">
              Los horarios finales se confirman más adelante
            </p>
            <div className="prof-calendar-grid">
              <div className="prof-calendar-header">
                <div className="prof-time-column"></div>
                {days.map(day => (
                  <div key={day} className="prof-day-header">{day}</div>
                ))}
              </div>
              {timeSlots.map((slot, index) => (
                <div key={slot} className="prof-calendar-row">
                  <div className="prof-time-cell">{slot}</div>
                  {days.map((day, dayIndex) => {
                    // Simulación de disponibilidad
                    const isAvailable = (index + dayIndex) % 3 !== 0;
                    const isLimited = (index + dayIndex) % 5 === 0;

                    return (
                      <div
                        key={`${day}-${slot}`}
                        className={`prof-slot-cell ${isAvailable ? 'available' : 'unavailable'} ${isLimited ? 'limited' : ''}`}
                      >
                        {isAvailable && (isLimited ? 'Cupos limitados' : 'Disponible')}
                        {!isAvailable && 'No disponible'}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="prof-step-actions">
        <button
          className="prof-btn prof-btn-primary"
          onClick={handleContinue}
          disabled={!selectedTechnique}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default ProfessionalTechniqueSelector;
