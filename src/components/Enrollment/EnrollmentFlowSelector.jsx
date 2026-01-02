import { useState } from 'react';
import SimplifiedEnrollmentForm from './SimplifiedEnrollmentForm';
import TestEnrollmentForm from './TestEnrollmentForm';
import ProfessionalEnrollmentForm from './ProfessionalEnrollmentForm';
import './EnrollmentFlowSelector.css';

const EnrollmentFlowSelector = ({ onClose, onSuccess }) => {
  const [selectedFlow, setSelectedFlow] = useState(null);

  const flows = [
    {
      id: 'professional',
      name: 'Flujo Profesional',
      badge: 'RECOMENDADO',
      badgeColor: '#2563eb',
      icon: '📋',
      description: 'Diseño UX/UI profesional y minimalista',
      features: [
        'Interfaz clara y ordenada',
        'Calendario informativo',
        'Diseño sobrio y moderno',
        'Sin distracciones visuales',
        'Enfocado en conversión'
      ],
      recommended: true,
      color: '#2563eb'
    },
    {
      id: 'simplified',
      name: 'Flujo Simplificado',
      badge: 'POPULAR',
      badgeColor: '#10b981',
      icon: '✨',
      description: 'Experiencia optimizada y rápida',
      features: [
        'Una técnica a la vez',
        'Proceso guiado paso a paso',
        'Decisiones simples y claras',
        'Resumen editable',
        '6 pasos optimizados'
      ],
      recommended: false,
      color: '#47a1bf'
    },
    {
      id: 'complete',
      name: 'Flujo Completo',
      badge: 'AVANZADO',
      badgeColor: '#667eea',
      icon: '🎯',
      description: 'Máxima flexibilidad y opciones',
      features: [
        'Múltiples técnicas simultáneas',
        'Selección de múltiples horarios',
        'Vista calendario completa',
        'Configuración avanzada',
        'Ideal para planes combinados'
      ],
      recommended: false,
      color: '#667eea'
    }
  ];

  // Si ya se seleccionó un flujo, mostrarlo
  if (selectedFlow === 'professional') {
    return <ProfessionalEnrollmentForm onClose={onClose} onSuccess={onSuccess} />;
  }

  if (selectedFlow === 'simplified') {
    return <SimplifiedEnrollmentForm onClose={onClose} onSuccess={onSuccess} />;
  }

  if (selectedFlow === 'complete') {
    return <TestEnrollmentForm onClose={onClose} onSuccess={onSuccess} />;
  }

  // Pantalla de selección
  return (
    <div className="flow-selector-container">
      <div className="flow-selector-overlay" onClick={onClose}></div>

      <div className="flow-selector-modal">
        <button className="close-button" onClick={onClose}>×</button>

        <div className="flow-selector-header">
          <h1 className="flow-selector-title">Inscríbete a nuestros cursos</h1>
          <p className="flow-selector-subtitle">
            Elige la experiencia que prefieres para completar tu inscripción
          </p>
          <p style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem'}}>
            ({flows.length} opciones disponibles)
          </p>
        </div>

        <div className="flow-options-grid">
          {flows.map(flow => {
            console.log('Renderizando flujo:', flow.id, flow.name);
            return (
              <div
                key={flow.id}
                className={`flow-option-card ${flow.recommended ? 'recommended' : ''}`}
                onClick={() => setSelectedFlow(flow.id)}
              >
              {flow.recommended && (
                <div className="recommended-ribbon">Recomendado</div>
              )}

              <div className="flow-badge" style={{ background: flow.badgeColor }}>
                {flow.badge}
              </div>

              <div className="flow-icon" style={{ color: flow.color }}>
                {flow.icon}
              </div>

              <h2 className="flow-name">{flow.name}</h2>
              <p className="flow-description">{flow.description}</p>

              <div className="flow-features">
                {flow.features.map((feature, index) => (
                  <div key={index} className="flow-feature">
                    <span className="feature-check" style={{ color: flow.color }}>✓</span>
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className="btn-select-flow"
                style={{ background: flow.color }}
              >
                Seleccionar
              </button>
            </div>
            );
          })}
        </div>

        <div className="flow-selector-footer">
          <p className="footer-note">
            💡 Puedes cambiar entre flujos en cualquier momento usando el botón de reinicio
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentFlowSelector;
