// Solución Custom con CSS Grid - Sin dependencias adicionales
// Más liviano y con control total del diseño
// Adaptado para consumir datos reales de la API

import './ScheduleSelector_CustomGrid.css';

const ScheduleSelectorCustomGrid = ({ selectedCourse, selectedPlan, selectedSections, onSelectSections }) => {
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

  // Mapeo de días de inglés a español
  const dayMapping = {
    'monday': 'Lunes',
    'tuesday': 'Martes',
    'wednesday': 'Miércoles',
    'thursday': 'Jueves',
    'friday': 'Viernes',
    'saturday': 'Sábado',
    'sunday': 'Domingo'
  };

  // Organizar horarios por día
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 a 21:00
  const minHour = 8;
  const pixelsPerHour = 40; // Reducido de 60px a 40px para ser más compacto

  // Agrupar eventos por día
  const eventsByDay = {};
  daysOfWeek.forEach(day => {
    eventsByDay[day] = [];
  });

  availableSections.forEach(section => {
    if (!section.schedule || section.schedule.length === 0) return;

    section.schedule.forEach(scheduleItem => {
      // Mapear día de inglés a español
      const dayInSpanish = dayMapping[scheduleItem.day.toLowerCase()] || scheduleItem.day;

      // Parsear horas
      const [startHour, startMin] = scheduleItem.start_time.split(':').map(Number);
      const [endHour, endMin] = scheduleItem.end_time.split(':').map(Number);

      // Calcular posición y altura
      const startInHours = startHour + startMin / 60;
      const endInHours = endHour + endMin / 60;
      const durationInHours = endInHours - startInHours;

      // Posición desde el inicio del día (8:00)
      const topOffset = (startInHours - minHour) * pixelsPerHour;
      const height = durationInHours * pixelsPerHour;

      const timeRange = `${scheduleItem.start_time} - ${scheduleItem.end_time}`;

      if (eventsByDay[dayInSpanish]) {
        eventsByDay[dayInSpanish].push({
          section,
          scheduleItem: { ...scheduleItem, day: dayInSpanish, time: timeRange },
          topOffset,
          height
        });
      }
    });
  });

  const handleSelectSection = (section) => {
    if (section.available_places === 0) return;

    const isAlreadySelected = selectedSections.some(s => s.id === section.id);

    if (isAlreadySelected) {
      // Deseleccionar
      onSelectSections(selectedSections.filter(s => s.id !== section.id));
    } else {
      // Verificar si puede seleccionar más
      if (selectedSections.length < selectedPlan.number_of_classes) {
        onSelectSections([...selectedSections, section]);
      }
    }
  };

  const formatTime = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const maxSessions = selectedPlan.number_of_classes;
  const currentSelections = selectedSections.length;
  const canSelectMore = currentSelections < maxSessions;

  return (
    <div className="enrollment-step">
      <h2>Paso 3: Selecciona tu Horario</h2>
      <p className="schedule-info">
        Selecciona <strong>{maxSessions}</strong> {maxSessions === 1 ? 'sección' : 'secciones'} para el curso <strong>{selectedCourse.name}</strong>
      </p>
      <p className="selection-counter">
        {currentSelections} de {maxSessions} {currentSelections === 1 ? 'clase seleccionada' : 'clases seleccionadas'}
        {!canSelectMore && <span className="limit-reached"> - Límite alcanzado</span>}
      </p>

      <div className="custom-calendar-container">
        <div className="calendar-wrapper">
          {/* Columna de horas */}
          <div className="time-column">
            <div className="time-header">Hora</div>
            <div className="time-slots">
              {hours.map(hour => (
                <div key={`time-${hour}`} className="time-slot">
                  {formatTime(hour)}
                </div>
              ))}
            </div>
          </div>

          {/* Columnas de días */}
          <div className="days-container">
            {daysOfWeek.map(day => (
              <div key={`day-${day}`} className="day-column">
                <div className="day-header">{day}</div>
                <div className="day-slots-container">
                  {/* Grid de horas de fondo */}
                  <div className="day-slots">
                    {hours.map(hour => (
                      <div key={`slot-${day}-${hour}`} className="hour-slot"></div>
                    ))}
                  </div>

                  {/* Eventos posicionados absolutamente */}
                  <div className="events-layer">
                    {eventsByDay[day]?.map(({ section, scheduleItem, topOffset, height }) => {
                      const isSelected = selectedSections.some(s => s.id === section.id);
                      const isDisabled = section.available_places === 0;
                      const isMaxReached = !canSelectMore && !isSelected;

                      return (
                        <div
                          key={`event-${section.id}-${scheduleItem.start_time}-${scheduleItem.end_time}`}
                          className={`schedule-event ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${isMaxReached ? 'max-reached' : ''}`}
                          style={{
                            top: `${topOffset}px`,
                            height: `${height}px`,
                            minHeight: '50px',
                            cursor: isDisabled ? 'not-allowed' : isMaxReached ? 'default' : 'pointer'
                          }}
                          onClick={() => handleSelectSection(section)}
                        >
                          <div className="event-content">
                            <div className="event-title">{section.teacher_name}</div>
                            <div className="event-time">{scheduleItem.time}</div>
                            <div className="event-places">
                              {isDisabled ? (
                                <span className="no-places">Sin cupos</span>
                              ) : (
                                <span>{section.available_places}/{section.places} cupos</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedSections.length > 0 && (
        <div className="selected-section-info">
          <h3>{selectedSections.length === 1 ? 'Sección Seleccionada' : 'Secciones Seleccionadas'} ✓</h3>
          {selectedSections.map((section, index) => (
            <div key={section.id} className="info-grid">
              <h4>Clase {index + 1}</h4>
              <div className="info-item">
                <span className="info-label">Profesor:</span>
                <span className="info-value">{section.teacher_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Horario:</span>
                <span className="info-value">
                  {section.schedule.map(s => `${s.day} ${s.start_time}-${s.end_time}`).join(', ')}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Cupos disponibles:</span>
                <span className="info-value">{section.available_places} de {section.places}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Fecha inicio:</span>
                <span className="info-value">{section.start_date}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Fecha fin:</span>
                <span className="info-value">{section.end_date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleSelectorCustomGrid;
