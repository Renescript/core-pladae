// Componente Demo para comparar todos los calendarios
// Usa este componente para probar visualmente cada opción

import { useState } from 'react';
import ScheduleSelectorCustomGrid from './ScheduleSelector_CustomGrid';
// Descomenta estas líneas después de instalar las dependencias:
// import ScheduleSelectorBigCalendar from './ScheduleSelector_BigCalendar';
// import ScheduleSelectorReactScheduler from './ScheduleSelector_ReactScheduler';
// import ScheduleSelectorScheduleX from './ScheduleSelector_ScheduleX';
import './CalendarDemo.css';

const CalendarDemo = () => {
  const [selectedCalendar, setSelectedCalendar] = useState('custom');
  const [selectedSection, setSelectedSection] = useState(null);

  // Datos de ejemplo basados en tu API real
  const mockCourse = {
    id: 1,
    name: 'Óleo',
    description: 'Curso de pintura al óleo',
    sections: [
      {
        id: 1,
        teacher_name: 'Profesor 1',
        available_places: 10,
        places: 10,
        start_date: '2025-11-10',
        end_date: '2025-12-31',
        schedule: [
          { day: 'tuesday', start_time: '10:00', end_time: '12:00' },
          { day: 'thursday', start_time: '14:00', end_time: '16:00' }
        ]
      },
      {
        id: 2,
        teacher_name: 'Profesor 2',
        available_places: 5,
        places: 20,
        start_date: '2025-12-01',
        end_date: '2025-12-31',
        schedule: [
          { day: 'monday', start_time: '09:00', end_time: '11:00' },
          { day: 'wednesday', start_time: '15:00', end_time: '17:00' },
          { day: 'friday', start_time: '10:00', end_time: '12:00' }
        ]
      },
      {
        id: 3,
        teacher_name: 'Profesor 3',
        available_places: 0,
        places: 15,
        start_date: '2025-11-15',
        end_date: '2025-12-20',
        schedule: [
          { day: 'monday', start_time: '16:00', end_time: '18:00' },
          { day: 'wednesday', start_time: '18:00', end_time: '20:00' }
        ]
      }
    ]
  };

  const calendars = [
    {
      id: 'custom',
      name: 'CSS Grid Custom',
      component: ScheduleSelectorCustomGrid,
      status: '✅ Disponible',
      size: 'Muy liviano',
      difficulty: 'Fácil',
      dependencies: 'Ninguna'
    },
    // Descomenta después de instalar:
    // {
    //   id: 'big-calendar',
    //   name: 'React Big Calendar',
    //   component: ScheduleSelectorBigCalendar,
    //   status: '⚠️ Requiere instalación',
    //   size: 'Medio',
    //   difficulty: 'Media',
    //   dependencies: 'react-big-calendar, moment'
    // },
    // {
    //   id: 'react-scheduler',
    //   name: '@aldabil/react-scheduler',
    //   component: ScheduleSelectorReactScheduler,
    //   status: '⚠️ Requiere instalación',
    //   size: 'Ligero',
    //   difficulty: 'Fácil',
    //   dependencies: '@aldabil/react-scheduler'
    // },
    // {
    //   id: 'schedule-x',
    //   name: '@schedule-x/calendar',
    //   component: ScheduleSelectorScheduleX,
    //   status: '⚠️ Requiere instalación',
    //   size: 'Medio',
    //   difficulty: 'Media',
    //   dependencies: '@schedule-x/react, @schedule-x/calendar'
    // }
  ];

  const currentCalendar = calendars.find(cal => cal.id === selectedCalendar);
  const CalendarComponent = currentCalendar?.component;

  const handleSelectSection = (section) => {
    setSelectedSection(section);
    console.log('Sección seleccionada:', section);
  };

  return (
    <div className="calendar-demo-container">
      <div className="demo-header">
        <h1>Comparación de Calendarios para Horarios</h1>
        <p>Prueba diferentes opciones de calendario y elige la que más te guste</p>
      </div>

      <div className="calendar-selector">
        <h2>Selecciona un Calendario:</h2>
        <div className="calendar-buttons">
          {calendars.map(calendar => (
            <button
              key={calendar.id}
              className={`calendar-btn ${selectedCalendar === calendar.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedCalendar(calendar.id);
                setSelectedSection(null);
              }}
            >
              <div className="btn-title">{calendar.name}</div>
              <div className="btn-status">{calendar.status}</div>
            </button>
          ))}
        </div>

        {currentCalendar && (
          <div className="calendar-info">
            <div className="info-card">
              <span className="info-label">Tamaño:</span>
              <span className="info-value">{currentCalendar.size}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Dificultad:</span>
              <span className="info-value">{currentCalendar.difficulty}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Dependencias:</span>
              <span className="info-value">{currentCalendar.dependencies}</span>
            </div>
          </div>
        )}
      </div>

      <div className="calendar-preview">
        {CalendarComponent ? (
          <CalendarComponent
            selectedCourse={mockCourse}
            selectedSection={selectedSection}
            onSelectSection={handleSelectSection}
          />
        ) : (
          <div className="no-component">
            <h3>Componente no disponible</h3>
            <p>Este calendario requiere instalación de dependencias.</p>
            <p>Consulta el README.md para instrucciones de instalación.</p>
          </div>
        )}
      </div>

      <div className="demo-footer">
        <h3>Instrucciones:</h3>
        <ol>
          <li>Haz clic en los botones de arriba para cambiar entre calendarios</li>
          <li>Haz clic en un evento del calendario para seleccionar una sección</li>
          <li>Los eventos grises son secciones sin cupos disponibles</li>
          <li>Los eventos verdes son las secciones seleccionadas</li>
        </ol>
        <p>
          <strong>📚 Para más información:</strong> Lee el archivo{' '}
          <code>src/components/Enrollment/examples/README.md</code>
        </p>
      </div>
    </div>
  );
};

export default CalendarDemo;
