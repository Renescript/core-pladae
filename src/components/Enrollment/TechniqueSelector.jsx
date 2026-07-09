import { useState, useEffect } from 'react';
import { getCoursesSchedulesGrid } from '../../services/api';
import WorkshopPricing from '../Landing/WorkshopPricing';
import HorariosGrid from '../Landing/HorariosGrid';
import InfoDrawer from './InfoDrawer';
import '../Landing/landing.css';
import './TechniqueSelector.css';

const TechniqueSelector = ({ selectedTechnique, onSelectTechnique, onContinue }) => {
  const [techniques, setTechniques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(null); // 'precios' | 'horario' | null

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

  const handleSelectTechnique = (technique) => {
    onSelectTechnique(technique);
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
        <h2>Selecciona la técnica que quieres aprender</h2>
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
            <span className="technique-name">{technique.name}</span>
          </button>
        ))}
      </div>

      <div className="step-actions step-actions--primary">
        <button
          type="button"
          className="btn-primary"
          onClick={handleContinue}
          disabled={!selectedTechnique}
        >
          Continuar
        </button>
      </div>

      <div className="technique-info-actions">
        <button
          type="button"
          className="technique-info-btn"
          onClick={() => setOpenDrawer('precios')}
        >
          Ver Tarifas
        </button>
        <button
          type="button"
          className="technique-info-btn"
          onClick={() => setOpenDrawer('horario')}
        >
          Ver Horario
        </button>
      </div>

      <InfoDrawer
        open={openDrawer === 'precios'}
        onClose={() => setOpenDrawer(null)}
        title="Tarifas"
      >
        <WorkshopPricing
          showHeader={false}
          showActions={false}
          courseTitle={selectedTechnique?.name || null}
        />
      </InfoDrawer>

      <InfoDrawer
        open={openDrawer === 'horario'}
        onClose={() => setOpenDrawer(null)}
        title="Horario general"
      >
        <HorariosGrid showActions={false} />
      </InfoDrawer>
    </div>
  );
};

export default TechniqueSelector;
