import { useState, useEffect, useMemo, useRef } from 'react';
import { getCoursesSchedulesGrid } from '../../services/api';
import './TechniqueSelector.css';

const TechniqueSelector = ({ selectedTechnique, onSelectTechnique, onContinue }) => {
  const [techniques, setTechniques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('monday');
  const scheduleRef = useRef(null);

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

  // Días de la semana para la grilla
  const weekDays = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' }
  ];

  // Franjas horarias únicas ordenadas
  const timeSlots = useMemo(() => {
    const slots = new Set();
    techniques.forEach(technique => {
      technique.schedules?.forEach(schedule => {
        slots.add(schedule.timeSlot);
      });
    });
    return Array.from(slots).sort((a, b) => {
      const timeA = a.split('-')[0];
      const timeB = b.split('-')[0];
      return timeA.localeCompare(timeB);
    });
  }, [techniques]);

  // Obtener clases para un día y horario específico
  const getClassesAt = (day, timeSlot) => {
    const classes = [];
    techniques.forEach(technique => {
      technique.schedules?.forEach(schedule => {
        if (schedule.day === day && schedule.timeSlot === timeSlot) {
          classes.push({
            ...schedule,
            techniqueName: technique.name,
            techniqueId: technique.id,
            color: technique.color
          });
        }
      });
    });
    return classes;
  };

  const handleSelectTechnique = (technique) => {
    onSelectTechnique(technique);
    // Scroll hacia el calendario después de seleccionar
    setTimeout(() => {
      scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleContinue = () => {
    if (!selectedTechnique) {
      alert('Por favor selecciona una técnica para continuar.');
      return;
    }
    onContinue && onContinue();
  };

  if (loading) {
    return (
      <div className="step-container">
        <p>Cargando técnicas...</p>
      </div>
    );
  }

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-indicator">Paso 1 de 5</span>
        <h2>¿Qué técnica te gustaría aprender?</h2>
      </div>

      {/* Grilla de técnicas */}
      <div className="techniques-grid">
        {techniques.map(technique => (
          <button
            key={technique.id}
            type="button"
            className={`technique-card ${selectedTechnique?.id === technique.id ? 'selected' : ''}`}
            onClick={() => handleSelectTechnique(technique)}
            style={{
              '--technique-color': technique.color
            }}
          >
            <span className="technique-name">
              {technique.name}
              <svg
                className="technique-underline"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
                style={{ color: technique.color }}
              >
                <path d="M0 5 Q 25 0, 50 5 T 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      {/* Calendario semanal - Desktop */}
      <div ref={scheduleRef} className="weekly-grid-container weekly-grid-desktop">
        <h3 className="weekly-grid-title">Horarios disponibles</h3>
        <div className="weekly-grid">
          {/* Header con días */}
          <div className="weekly-grid-header">
            <div className="weekly-grid-corner"></div>
            {weekDays.map(day => (
              <div key={day.key} className="weekly-grid-day-header">
                {day.label}
              </div>
            ))}
          </div>

          {/* Filas de horarios */}
          <div className="weekly-grid-body">
            {timeSlots.map(timeSlot => (
              <div key={timeSlot} className="weekly-grid-row">
                <div className="weekly-grid-time">{timeSlot}</div>
                {weekDays.map(day => {
                  const classes = getClassesAt(day.key, timeSlot);
                  return (
                    <div key={`${day.key}-${timeSlot}`} className="weekly-grid-cell">
                      {classes.map((cls, idx) => {
                        const isSelected = selectedTechnique?.id === cls.techniqueId;
                        return (
                          <button
                            key={idx}
                            type="button"
                            className={`weekly-grid-class ${isSelected ? 'selected' : ''}`}
                            style={{
                              backgroundColor: cls.color,
                              opacity: selectedTechnique && !isSelected ? 0.4 : 1
                            }}
                            onClick={() => onSelectTechnique(
                              techniques.find(t => t.id === cls.techniqueId)
                            )}
                            title={cls.techniqueName}
                          >
                            <span className="class-name">{cls.techniqueName}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendario semanal - Móvil (tabs por día) */}
      <div className="weekly-grid-container weekly-grid-mobile">
        <h3 className="weekly-grid-title">Horarios disponibles</h3>

        {/* Tabs de días */}
        <div className="weekly-tabs">
          {weekDays.map(day => (
            <button
              key={day.key}
              type="button"
              className={`weekly-tab ${activeDay === day.key ? 'active' : ''}`}
              onClick={() => setActiveDay(day.key)}
            >
              {day.label.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Contenido del día activo */}
        <div className="weekly-tab-content">
          {(() => {
            const dayClasses = [];
            timeSlots.forEach(timeSlot => {
              const classes = getClassesAt(activeDay, timeSlot);
              classes.forEach(cls => {
                dayClasses.push({ ...cls, timeSlot });
              });
            });

            if (dayClasses.length === 0) {
              return (
                <div className="weekly-tab-empty">
                  No hay clases este día
                </div>
              );
            }

            return dayClasses.map((cls, idx) => {
              const isSelected = selectedTechnique?.id === cls.techniqueId;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`weekly-tab-class ${isSelected ? 'selected' : ''}`}
                  style={{
                    borderLeftColor: cls.color,
                    opacity: selectedTechnique && !isSelected ? 0.5 : 1
                  }}
                  onClick={() => onSelectTechnique(
                    techniques.find(t => t.id === cls.techniqueId)
                  )}
                >
                  <span className="tab-class-time">{cls.timeSlot}</span>
                  <span
                    className="tab-class-name"
                    style={{ color: cls.color }}
                  >
                    {cls.techniqueName}
                  </span>
                </button>
              );
            });
          })()}
        </div>
      </div>

      <div className="step-actions">
        <button
          type="button"
          className="btn-primary"
          onClick={handleContinue}
          disabled={!selectedTechnique}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default TechniqueSelector;
