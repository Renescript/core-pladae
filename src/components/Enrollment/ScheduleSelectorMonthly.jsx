import { useState, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './ScheduleSelectorMonthly.css';

// Configurar moment en español con semana comenzando en lunes
moment.updateLocale('es', {
  week: {
    dow: 1, // Lunes es el primer día de la semana
    doy: 4
  },
  months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
  monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
  weekdays: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
  weekdaysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
  weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sá'.split('_')
});
moment.locale('es');

const localizer = momentLocalizer(moment);

// Mapeo de días de inglés a número (0=domingo, 1=lunes, etc.)
const dayToNumber = {
  'sunday': 0,
  'monday': 1,
  'tuesday': 2,
  'wednesday': 3,
  'thursday': 4,
  'friday': 5,
  'saturday': 6
};

const ScheduleSelectorMonthly = ({ selectedCourse, selectedPlan, selectedSections, onSelectSections }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!selectedCourse || !selectedPlan) {
    return (
      <div className="enrollment-step disabled">
        <h2>Paso 3: Selecciona tu Horario</h2>
        <p className="info-message">
          Primero debes seleccionar un curso y un plan
        </p>
      </div>
    );
  }

  const availableSections = selectedCourse.sections || [];
  const maxSessions = selectedPlan.number_of_classes;
  const currentSelections = selectedSections.length;
  const canSelectMore = currentSelections < maxSessions;

  // Función para generar todas las ocurrencias de un día de la semana en un rango de fechas
  const generateOccurrences = (startDate, endDate, dayOfWeek, startTime, endTime, section, scheduleItem) => {
    const events = [];
    const start = moment(startDate);
    const end = moment(endDate);
    const targetDay = dayToNumber[dayOfWeek.toLowerCase()];

    // Encontrar el primer día objetivo desde la fecha de inicio
    let current = start.clone();
    while (current.day() !== targetDay) {
      current.add(1, 'day');
      if (current.isAfter(end)) return events;
    }

    // Generar todos los eventos para ese día de la semana
    while (current.isSameOrBefore(end)) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);

      const eventStart = current.clone().hour(startHour).minute(startMin).second(0);
      const eventEnd = current.clone().hour(endHour).minute(endMin).second(0);

      events.push({
        id: `${section.id}-${current.format('YYYY-MM-DD')}-${startTime}`,
        title: section.teacher_name,
        start: eventStart.toDate(),
        end: eventEnd.toDate(),
        resource: {
          section,
          scheduleItem,
          date: current.format('YYYY-MM-DD')
        }
      });

      current.add(7, 'days'); // Siguiente semana
    }

    return events;
  };

  // Generar todos los eventos del calendario
  const events = useMemo(() => {
    const allEvents = [];
    const now = moment();

    availableSections.forEach(section => {
      if (!section.schedule || section.schedule.length === 0) return;
      if (!section.start_date || !section.end_date) return;

      section.schedule.forEach(scheduleItem => {
        const occurrences = generateOccurrences(
          section.start_date,
          section.end_date,
          scheduleItem.day,
          scheduleItem.start_time,
          scheduleItem.end_time,
          section,
          scheduleItem
        );
        // Filtrar solo eventos futuros
        const futureOccurrences = occurrences.filter(event =>
          moment(event.start).isAfter(now)
        );
        allEvents.push(...futureOccurrences);
      });
    });

    return allEvents;
  }, [availableSections]);

  // Manejar click en un evento
  const handleSelectEvent = (event) => {
    const section = event.resource.section;

    if (section.available_places === 0) return;

    // Verificar si este evento específico ya está seleccionado
    const isAlreadySelected = selectedSections.some(s => s.eventId === event.id);

    if (isAlreadySelected) {
      // Deseleccionar este evento específico
      onSelectSections(selectedSections.filter(s => s.eventId !== event.id));
    } else {
      // Verificar si puede seleccionar más
      if (selectedSections.length < maxSessions) {
        // Crear objeto con toda la información del evento específico
        const selectedClass = {
          eventId: event.id,
          sectionId: section.id,
          teacher_name: section.teacher_name,
          date: event.resource.date,
          start_time: moment(event.start).format('HH:mm'),
          end_time: moment(event.end).format('HH:mm'),
          day_of_week: event.resource.scheduleItem.day,
          available_places: section.available_places,
          places: section.places
        };
        onSelectSections([...selectedSections, selectedClass]);
      }
    }
  };

  // Estilo de los eventos según su estado
  const eventStyleGetter = (event) => {
    const section = event.resource.section;
    const isSelected = selectedSections.some(s => s.eventId === event.id);
    const isDisabled = section.available_places === 0;
    const isMaxReached = !canSelectMore && !isSelected;

    let backgroundColor = '#8ab4f8';
    let cursor = 'pointer';
    let opacity = 1;

    if (isSelected) {
      backgroundColor = '#81c995';
    } else if (isDisabled) {
      backgroundColor = '#bdc1c6';
      cursor = 'not-allowed';
      opacity = 0.7;
    } else if (isMaxReached) {
      backgroundColor = '#8ab4f8';
      cursor = 'default';
      opacity = 0.5;
    }

    return {
      style: {
        backgroundColor,
        opacity,
        cursor,
        borderRadius: '6px',
        border: isSelected ? '2px solid #5bb974' : '2px solid transparent',
        color: 'white'
      }
    };
  };

  // Personalizar el contenido del evento
  const EventComponent = ({ event }) => {
    // Formato de hora más compacto
    const startTime = moment(event.start).format('HH:mm');

    return (
      <div className="custom-event">
        <div className="event-time">{startTime}</div>
        <div className="event-teacher">{event.title}</div>
      </div>
    );
  };

  const messages = {
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    today: 'Hoy',
    previous: 'Anterior',
    next: 'Siguiente',
    showMore: (total) => `+ Ver más (${total})`,
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    allDay: 'Todo el día',
    noEventsInRange: 'No hay eventos en este rango.',
    tomorrow: 'Mañana',
    yesterday: 'Ayer'
  };

  const formats = {
    dayFormat: 'dd',
    weekdayFormat: 'dddd',
    monthHeaderFormat: 'MMMM YYYY',
    dayHeaderFormat: 'dddd DD MMM',
    dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
      localizer.format(start, 'DD MMM', culture) + ' - ' +
      localizer.format(end, 'DD MMM', culture),
  };

  return (
    <div className="enrollment-step">
      <div className="schedule-header">
        <div>
          <h2>Paso 3: Selecciona tu Horario</h2>
          <p className="schedule-info">
            Selecciona <strong>{maxSessions}</strong> {maxSessions === 1 ? 'clase' : 'clases'} para el curso <strong>{selectedCourse.name}</strong>
          </p>
        </div>
        <div className="selection-counter">
          {currentSelections} de {maxSessions} {currentSelections === 1 ? 'seleccionada' : 'seleccionadas'}
          {!canSelectMore && <span className="limit-reached"> ✓ Completo</span>}
        </div>
      </div>

      <div className="calendar-container-monthly">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent
          }}
          messages={messages}
          formats={formats}
          culture="es"
          views={['month']}
          defaultView="month"
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          popup
          showAllEvents
          tooltipAccessor={(event) => {
            const section = event.resource.section;
            const time = `${moment(event.start).format('HH:mm')} - ${moment(event.end).format('HH:mm')}`;
            return `${event.title} | ${time} | ${section.available_places}/${section.places} cupos`;
          }}
        />
      </div>

      {selectedSections.length > 0 && (
        <div className="selected-section-info">
          <h3>{selectedSections.length === 1 ? 'Clase Seleccionada' : 'Clases Seleccionadas'} ✓</h3>
          <div className="selected-classes-list">
            {selectedSections.map((selectedClass, index) => (
              <div key={selectedClass.eventId} className="class-card">
                <div className="class-card-header">
                  <span className="class-number">Clase {index + 1}</span>
                  <span className="class-teacher">{selectedClass.teacher_name}</span>
                </div>
                <div className="class-card-body">
                  <div className="class-info-row">
                    <svg className="info-icon-svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                    </svg>
                    <span className="class-info-text">{moment(selectedClass.date).format('dddd DD [de] MMMM YYYY')}</span>
                  </div>
                  <div className="class-info-row">
                    <svg className="info-icon-svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                    </svg>
                    <span className="class-info-text">{selectedClass.start_time} - {selectedClass.end_time}</span>
                  </div>
                  <div className="class-info-row">
                    <svg className="info-icon-svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                      <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
                      <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                    </svg>
                    <span className="class-info-text">{selectedClass.available_places} de {selectedClass.places} cupos disponibles</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleSelectorMonthly;
