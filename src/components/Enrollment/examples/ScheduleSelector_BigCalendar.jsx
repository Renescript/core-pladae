// Ejemplo con react-big-calendar
// npm install react-big-calendar moment
// Importar CSS: import 'react-big-calendar/lib/css/react-big-calendar.css'
// Adaptado para consumir datos reales de la API

import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/es'
import 'react-big-calendar/lib/css/react-big-calendar.css'

moment.locale('es');
const localizer = momentLocalizer(moment);

const ScheduleSelectorBigCalendar = ({ selectedCourse, selectedSection, onSelectSection }) => {
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

      return {
        id: `${section.id}-${scheduleItem.start_time}-${scheduleItem.end_time}`,
        title: `${section.teacher_name}`,
        start: startDateTime,
        end: endDateTime,
        resource: {
          section: section,
          schedule: scheduleItem,
          availablePlaces: section.available_places,
          totalPlaces: section.places,
          isDisabled: section.available_places === 0
        }
      };
    }).filter(Boolean); // Filtrar nulls
  });

  const handleSelectEvent = (event) => {
    const section = event.resource.section;
    if (section.available_places > 0) {
      onSelectSection(section);
    }
  };

  // Personalizar estilo de los eventos
  const eventStyleGetter = (event) => {
    const isDisabled = event.resource.isDisabled;
    const isSelected = selectedSection?.id === event.resource.section.id;

    let backgroundColor = '#3174ad';
    if (isDisabled) {
      backgroundColor = '#ccc';
    } else if (isSelected) {
      backgroundColor = '#4caf50';
    } else if (event.resource.availablePlaces <= 3) {
      backgroundColor = '#ff9800';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: isDisabled ? 0.5 : 1,
        color: 'white',
        border: '0px',
        display: 'block',
        cursor: isDisabled ? 'not-allowed' : 'pointer'
      }
    };
  };

  // Personalizar contenido del evento
  const EventComponent = ({ event }) => (
    <div style={{ padding: '2px 5px' }}>
      <strong>{event.title}</strong>
      <div style={{ fontSize: '0.85em' }}>
        {event.resource.isDisabled ? (
          <span>Sin cupos</span>
        ) : (
          <span>{event.resource.availablePlaces}/{event.resource.totalPlaces} cupos</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="enrollment-step">
      <h2>Paso 2: Selecciona tu Horario</h2>
      <p className="schedule-info">
        Selecciona una sección disponible para el curso <strong>{selectedCourse.name}</strong>
      </p>

      <div className="big-calendar-container" style={{ height: '600px', marginTop: '20px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          defaultView="week"
          views={['week', 'day']}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent
          }}
          messages={{
            week: 'Semana',
            day: 'Día',
            today: 'Hoy',
            previous: 'Anterior',
            next: 'Siguiente',
            showMore: (total) => `+ Ver más (${total})`
          }}
          min={new Date(2024, 0, 1, 8, 0, 0)} // Hora inicio: 8 AM
          max={new Date(2024, 0, 1, 22, 0, 0)} // Hora fin: 10 PM
        />
      </div>

      {selectedSection && (
        <div className="selected-section-info" style={{ marginTop: '20px', padding: '15px', background: '#e8f5e9', borderRadius: '8px' }}>
          <h3>Sección Seleccionada ✓</h3>
          <p><strong>Profesor:</strong> {selectedSection.teacher_name}</p>
          <p><strong>Cupos disponibles:</strong> {selectedSection.available_places} de {selectedSection.places}</p>
          <p><strong>Inicio:</strong> {selectedSection.start_date}</p>
          <p><strong>Fin:</strong> {selectedSection.end_date}</p>
        </div>
      )}
    </div>
  );
};

export default ScheduleSelectorBigCalendar;
