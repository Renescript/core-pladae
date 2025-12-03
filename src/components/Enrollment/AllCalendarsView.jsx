// Componente que muestra TODOS los calendarios uno debajo del otro
// Consume datos reales de la API

import { useState } from 'react';
import ScheduleSelectorCustomGrid from './examples/ScheduleSelector_CustomGrid';
import ScheduleSelectorBigCalendar from './examples/ScheduleSelector_BigCalendar';
import ScheduleSelectorReactScheduler from './examples/ScheduleSelector_ReactScheduler';
import ScheduleSelectorScheduleX from './examples/ScheduleSelector_ScheduleX';
import './AllCalendarsView.css';

const AllCalendarsView = ({ selectedCourse, selectedSection, onSelectSection }) => {
  const [expandedCalendar, setExpandedCalendar] = useState('custom'); // Por defecto muestra el custom

  if (!selectedCourse) {
    return (
      <div className="enrollment-step disabled">
        <h2>Paso 2: Selecciona tu Horario</h2>
        <p className="info-message">
          Primero debes seleccionar un curso
        </p>
      </div>
    );
  }

  const calendars = [
    {
      id: 'custom',
      name: 'CSS Grid Custom',
      description: 'Sin dependencias, control total del diseño',
      component: ScheduleSelectorCustomGrid,
      available: true,
      installCmd: null,
      color: '#667eea'
    },
    {
      id: 'react-scheduler',
      name: '@aldabil/react-scheduler',
      description: 'Moderno y fácil de usar',
      component: ScheduleSelectorReactScheduler,
      available: true,
      installCmd: 'npm install @aldabil/react-scheduler',
      color: '#f59e0b'
    },
    {
      id: 'big-calendar',
      name: 'react-big-calendar',
      description: 'Popular, inspirado en Google Calendar',
      component: ScheduleSelectorBigCalendar,
      available: true,
      installCmd: 'npm install react-big-calendar moment',
      color: '#10b981'
    },
    {
      id: 'schedule-x',
      name: '@schedule-x/calendar',
      description: 'Material Design, muy moderno',
      component: ScheduleSelectorScheduleX,
      available: true,
      installCmd: 'npm install @schedule-x/react @schedule-x/calendar @schedule-x/theme-default',
      color: '#8b5cf6'
    }
  ];

  const toggleCalendar = (calendarId) => {
    setExpandedCalendar(expandedCalendar === calendarId ? null : calendarId);
  };

  return (
    <div className="all-calendars-container">
      <div className="calendars-header">
        <h2>Paso 2: Selecciona tu Horario</h2>
        <p className="schedule-info">
          Comparación de diferentes calendarios para el curso <strong>{selectedCourse.name}</strong>
        </p>
        <p className="calendar-hint">
          Haz clic en cada calendario para expandirlo y ver los horarios disponibles
        </p>
      </div>

      {selectedSection && (
        <div className="global-selection-banner">
          <div className="banner-content">
            <span className="banner-icon">✓</span>
            <div className="banner-text">
              <strong>Sección Seleccionada:</strong> {selectedSection.teacher_name} -
              {selectedSection.available_places} cupos disponibles
            </div>
          </div>
        </div>
      )}

      <div className="calendars-showcase">
        {calendars.map((calendar) => (
          <div key={calendar.id} className="calendar-section">
            <div
              className="calendar-section-header"
              style={{ borderLeftColor: calendar.color }}
              onClick={() => calendar.available && toggleCalendar(calendar.id)}
            >
              <div className="header-left">
                <div
                  className="calendar-icon"
                  style={{ backgroundColor: calendar.color }}
                >
                  {calendar.available ? '✓' : '⚠'}
                </div>
                <div className="header-info">
                  <h3>{calendar.name}</h3>
                  <p>{calendar.description}</p>
                </div>
              </div>
              <div className="header-right">
                {!calendar.available && (
                  <span className="install-badge">Requiere instalación</span>
                )}
                {calendar.available && (
                  <button
                    className="expand-btn"
                    style={{ color: calendar.color }}
                  >
                    {expandedCalendar === calendar.id ? '▼' : '▶'}
                  </button>
                )}
              </div>
            </div>

            {calendar.available && expandedCalendar === calendar.id && (
              <div className="calendar-content">
                <calendar.component
                  selectedCourse={selectedCourse}
                  selectedSection={selectedSection}
                  onSelectSection={onSelectSection}
                />
              </div>
            )}

            {!calendar.available && (
              <div className="calendar-install-info">
                <div className="install-instructions">
                  <p><strong>Para usar este calendario:</strong></p>
                  <ol>
                    <li>Instala las dependencias:</li>
                    <code className="install-command">{calendar.installCmd}</code>
                    <li>Descomenta el import en <code>AllCalendarsView.jsx</code></li>
                    <li>Actualiza el componente en el array de calendars</li>
                    <li>Reinicia el servidor de desarrollo</li>
                  </ol>
                  <p className="install-note">
                    📖 Consulta <code>src/components/Enrollment/examples/README.md</code> para más detalles
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="calendars-footer">
        <div className="footer-info">
          <h4>ℹ️ Información</h4>
          <ul>
            <li>Actualmente solo el <strong>CSS Grid Custom</strong> está disponible sin instalaciones adicionales</li>
            <li>Para probar otros calendarios, instala las dependencias necesarias</li>
            <li>Todos los calendarios consumen los mismos datos de la API</li>
            <li>La selección de sección se comparte entre todos los calendarios</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AllCalendarsView;
