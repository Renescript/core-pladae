// Ejemplo con @aldabil/react-scheduler
// npm install @aldabil/react-scheduler
// Adaptado para consumir datos reales de la API

import { Scheduler } from '@aldabil/react-scheduler';
import { es } from 'date-fns/locale';

const ScheduleSelectorReactScheduler = ({ selectedCourse, selectedSection, onSelectSection }) => {
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

  const availableSections = selectedCourse.sections || [];

  // Mapeo de días de inglés a número de día de la semana
  const dayMapping = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  };

  // Convertir las secciones a eventos del calendario
  const events = availableSections.flatMap(section => {
    if (!section.schedule || section.schedule.length === 0) return [];

    return section.schedule.map(scheduleItem => {
      // Mapear día de inglés a número
      const dayNum = dayMapping[scheduleItem.day.toLowerCase()];

      if (dayNum === undefined) {
        console.warn(`Día no reconocido: ${scheduleItem.day}`);
        return null;
      }

      const today = new Date();
      const currentDay = today.getDay();
      const daysUntilSchedule = (dayNum - currentDay + 7) % 7;
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + daysUntilSchedule);

      // Parsear start_time y end_time
      const [startHour, startMin] = scheduleItem.start_time.split(':').map(Number);
      const [endHour, endMin] = scheduleItem.end_time.split(':').map(Number);

      const startDateTime = new Date(eventDate);
      startDateTime.setHours(startHour, startMin, 0);

      const endDateTime = new Date(eventDate);
      endDateTime.setHours(endHour, endMin, 0);

      const isDisabled = section.available_places === 0;
      const isSelected = selectedSection?.id === section.id;

      return {
        event_id: `${section.id}-${scheduleItem.start_time}-${scheduleItem.end_time}`,
        title: section.teacher_name,
        start: startDateTime,
        end: endDateTime,
        disabled: isDisabled,
        color: isDisabled ? '#9e9e9e' : isSelected ? '#4caf50' : '#667eea',
        section: section,
        scheduleItem: scheduleItem
      };
    }).filter(Boolean); // Filtrar nulls
  });

  const handleEventClick = (event) => {
    if (!event.disabled) {
      onSelectSection(event.section);
    }
  };

  return (
    <div className="enrollment-step">
      <h2>Paso 2: Selecciona tu Horario</h2>
      <p className="schedule-info">
        Selecciona una sección disponible para el curso <strong>{selectedCourse.name}</strong>
      </p>

      <div className="react-scheduler-container" style={{ marginTop: '20px' }}>
        <Scheduler
          view="week"
          events={events}
          height={600}
          locale={es}
          week={{
            weekDays: [0, 1, 2, 3, 4, 5, 6],
            weekStartOn: 1, // Lunes
            startHour: 8,
            endHour: 22,
            step: 60
          }}
          translations={{
            navigation: {
              month: "Mes",
              week: "Semana",
              day: "Día",
              today: "Hoy"
            },
            form: {
              addTitle: "Agregar Evento",
              editTitle: "Editar Evento",
              confirm: "Confirmar",
              delete: "Eliminar",
              cancel: "Cancelar"
            },
            event: {
              title: "Título",
              start: "Inicio",
              end: "Fin",
              allDay: "Todo el día"
            }
          }}
          onEventClick={handleEventClick}
          editable={false}
          deletable={false}
          eventRenderer={(event) => {
            const section = event.section;
            const scheduleItem = event.scheduleItem;
            return (
              <div style={{
                padding: '5px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <strong>{event.title}</strong>
                <div style={{ fontSize: '0.85em', marginTop: '2px' }}>
                  {scheduleItem.start_time} - {scheduleItem.end_time}
                </div>
                <div style={{ fontSize: '0.8em', marginTop: '2px' }}>
                  {event.disabled ? (
                    <span>Sin cupos</span>
                  ) : (
                    <span>{section.available_places}/{section.places} cupos</span>
                  )}
                </div>
              </div>
            );
          }}
        />
      </div>

      {selectedSection && (
        <div className="selected-section-info" style={{
          marginTop: '20px',
          padding: '20px',
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
          borderRadius: '12px',
          borderLeft: '4px solid #4caf50'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#2e7d32' }}>Sección Seleccionada ✓</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '4px' }}>Profesor:</div>
              <div style={{ fontWeight: '600' }}>{selectedSection.teacher_name}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '4px' }}>Cupos disponibles:</div>
              <div style={{ fontWeight: '600' }}>{selectedSection.available_places} de {selectedSection.places}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '4px' }}>Fecha inicio:</div>
              <div style={{ fontWeight: '600' }}>{selectedSection.start_date}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '4px' }}>Fecha fin:</div>
              <div style={{ fontWeight: '600' }}>{selectedSection.end_date}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleSelectorReactScheduler;
