// Ejemplo con @schedule-x/calendar
// npm install @schedule-x/react @schedule-x/calendar @schedule-x/theme-default
// Adaptado para consumir datos reales de la API

import { ScheduleXCalendar, useNextCalendarApp } from '@schedule-x/react'
import {
  createViewWeek,
  createViewDay,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import '@schedule-x/theme-default/dist/index.css'
import { useMemo, useEffect } from 'react'

const ScheduleSelectorScheduleX = ({ selectedCourse, selectedSection, onSelectSection }) => {
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

  // Plugin de eventos
  const eventsService = useMemo(() => createEventsServicePlugin(), []);

  // Convertir las secciones a eventos del calendario
  const events = useMemo(() => {
    return availableSections.flatMap(section => {
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

        // Formatear fecha para Schedule-X (YYYY-MM-DD)
        const year = eventDate.getFullYear();
        const month = String(eventDate.getMonth() + 1).padStart(2, '0');
        const day = String(eventDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Formatear tiempos (HH:MM)
        const startTime = scheduleItem.start_time;
        const endTime = scheduleItem.end_time;

        const isDisabled = section.available_places === 0;
        const isSelected = selectedSection?.id === section.id;

        return {
          id: `${section.id}-${scheduleItem.start_time}-${scheduleItem.end_time}`,
          title: `${section.teacher_name} (${section.available_places}/${section.places} cupos)`,
          start: `${dateStr} ${startTime}`,
          end: `${dateStr} ${endTime}`,
          calendarId: isDisabled ? 'disabled' : isSelected ? 'selected' : 'default',
          _section: section,
          _schedule: scheduleItem
        };
      }).filter(Boolean);
    });
  }, [availableSections, selectedSection]);

  // Crear calendario
  const calendar = useNextCalendarApp({
    views: [createViewWeek(), createViewDay()],
    defaultView: 'week',
    locale: 'es-ES',
    firstDayOfWeek: 1,
    plugins: [eventsService],
    events: events,
    calendars: {
      default: {
        colorName: 'default',
        lightColors: {
          main: '#667eea',
          container: '#e0e7ff',
          onContainer: '#1e1b4b',
        },
      },
      selected: {
        colorName: 'selected',
        lightColors: {
          main: '#4caf50',
          container: '#c8e6c9',
          onContainer: '#1b5e20',
        },
      },
      disabled: {
        colorName: 'disabled',
        lightColors: {
          main: '#9e9e9e',
          container: '#e0e0e0',
          onContainer: '#424242',
        },
      },
    },
    callbacks: {
      onEventClick(calendarEvent) {
        const section = calendarEvent._section;
        if (section && section.available_places > 0) {
          onSelectSection(section);
        }
      },
    },
  });

  // Actualizar eventos cuando cambian
  useEffect(() => {
    if (eventsService) {
      eventsService.set(events);
    }
  }, [events, eventsService]);

  return (
    <div className="enrollment-step">
      <h2>Paso 2: Selecciona tu Horario</h2>
      <p className="schedule-info">
        Selecciona una sección disponible para el curso <strong>{selectedCourse.name}</strong>
      </p>

      <div className="schedule-x-container" style={{ height: '500px', maxHeight: '500px' }}>
        <ScheduleXCalendar calendarApp={calendar} />
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

export default ScheduleSelectorScheduleX;
