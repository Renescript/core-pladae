import { useState, useEffect, useMemo, Fragment } from 'react';
import { getCourses, getDummyCalendarData } from '../../services/api';
import moment from 'moment/min/moment-with-locales';
import './WeeklyScheduleSelector.css';

moment.locale('es');

const WeeklyScheduleSelector = ({ selectedSchedule, onSelectSchedule }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = semana actual, 1 = próxima, etc.

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);

        // Usar datos dummy para desarrollo
        const USE_DUMMY_DATA = true;

        if (USE_DUMMY_DATA) {
          const dummyData = getDummyCalendarData();
          console.log('📚 Usando datos dummy para el calendario:', dummyData);
          console.log('📚 Total cursos:', dummyData.length);
          setCourses(dummyData);
          setLoading(false);
          return;
        }

        const data = await getCourses();

        const adaptedCourses = data.map(course => ({
          id: course.id,
          name: course.title,
          description: course.description,
          sections: course.sections,
          category: course.category || 'General',
        }));

        console.log('📚 Cursos cargados para WeeklyScheduleSelector:', adaptedCourses);
        setCourses(adaptedCourses);
      } catch (err) {
        console.error('Error cargando cursos, usando datos dummy:', err);
        setCourses(getDummyCalendarData());
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Generar la semana (lunes a sábado) según el offset actual
  const weekDays = useMemo(() => {
    const startOfWeek = moment().startOf('isoWeek').add(currentWeekOffset, 'weeks'); // Lunes
    const days = [];
    for (let i = 0; i < 6; i++) { // Lunes a Sábado
      days.push(startOfWeek.clone().add(i, 'days'));
    }
    return days;
  }, [currentWeekOffset]);

  // Mapeo de días en inglés a español
  const dayMap = {
    'monday': 'Lunes',
    'tuesday': 'Martes',
    'wednesday': 'Miércoles',
    'thursday': 'Jueves',
    'friday': 'Viernes',
    'saturday': 'Sábado',
    'sunday': 'Domingo'
  };

  // Obtener horarios disponibles del curso seleccionado
  const availableSchedules = useMemo(() => {
    if (!selectedCourse) return [];

    const schedules = [];

    selectedCourse.sections.forEach(section => {
      // Incluir TODAS las secciones, no solo las que tienen cupos disponibles
      // Las sin cupos se mostrarán deshabilitadas (grises)
      if (section.schedule) {
        section.schedule.forEach(scheduleItem => {
          schedules.push({
            section,
            day: scheduleItem.day,
            startTime: scheduleItem.start_time,
            endTime: scheduleItem.end_time,
            teacher: section.teacher_name,
            availablePlaces: section.available_places,
            totalPlaces: section.places
          });
        });
      }
    });

    return schedules;
  }, [selectedCourse]);

  // Generar franjas horarias (de 8:00 a 21:00)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  // Verificar si hay una clase en un día y hora específicos
  const getScheduleAtTime = (day, time) => {
    // Obtener el nombre del día en inglés para comparar con los datos
    const dayName = day.clone().locale('en').format('dddd').toLowerCase(); // "monday", "tuesday", etc.

    return availableSchedules.filter(schedule => {
      // Comparar directamente con el día del schedule (en inglés)
      if (schedule.day.toLowerCase() !== dayName) return false;

      const scheduleStartHour = parseInt(schedule.startTime.split(':')[0]);
      const timeHour = parseInt(time.split(':')[0]);
      const scheduleEndHour = parseInt(schedule.endTime.split(':')[0]);
      const scheduleEndMin = parseInt(schedule.endTime.split(':')[1]);

      // Si el horario termina con minutos (ej: 17:30), debemos incluir esa hora
      // Por ejemplo, 15:30-17:30 debe incluir las horas 15, 16 y 17
      if (scheduleEndMin > 0) {
        return timeHour >= scheduleStartHour && timeHour <= scheduleEndHour;
      } else {
        return timeHour >= scheduleStartHour && timeHour < scheduleEndHour;
      }
    });
  };

  const handleScheduleClick = (schedule, selectedDay) => {
    const isSelected = selectedSchedule?.section.id === schedule.section.id;

    if (isSelected) {
      onSelectSchedule(null);
    } else {
      onSelectSchedule({
        course: selectedCourse,
        ...schedule,
        date: selectedDay.format('YYYY-MM-DD') // Agregar fecha específica en formato ISO
      });
    }
  };

  if (loading) {
    return (
      <div className="enrollment-step">
        <h2>Paso 1: Selecciona tu Horario</h2>
        <div className="loading">Cargando horarios...</div>
      </div>
    );
  }

  return (
    <div className="enrollment-step">
      <h2>Paso 1: Selecciona tu Horario</h2>
      <p className="step-description">Elige un curso y luego selecciona el horario que más te acomode</p>

      <div className="weekly-schedule-container">
        {/* Selector de curso lateral */}
        <div className="course-sidebar">
          <h3>Cursos Disponibles</h3>
          <div className="course-list">
            {courses.map(course => (
              <div
                key={course.id}
                className={`course-item ${selectedCourse?.id === course.id ? 'selected' : ''}`}
                onClick={() => setSelectedCourse(course)}
              >
                <div className="course-item-header">
                  <h4>{course.name}</h4>
                  <span className="course-badge">{course.category}</span>
                </div>
                <p className="course-item-desc">{course.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Calendario semanal */}
        <div className="weekly-calendar">
          {!selectedCourse ? (
            <div className="empty-state">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <p>Selecciona un curso para ver los horarios disponibles</p>
            </div>
          ) : (
            <>
              {/* Navegación de semanas */}
              <div className="week-navigation">
                <button
                  className="week-nav-btn"
                  onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                  disabled={currentWeekOffset === 0}
                >
                  ← Semana Anterior
                </button>
                <div className="week-range">
                  {weekDays[0].format('DD [de] MMMM')} - {weekDays[5].format('DD [de] MMMM [de] YYYY')}
                </div>
                <button
                  className="week-nav-btn"
                  onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                >
                  Semana Siguiente →
                </button>
              </div>


            <div className="schedule-grid">
              <div className="schedule-header">
                <div className="time-column-header">Hora</div>
                {weekDays.map(day => {
                  const dayName = day.format('dddd');
                  const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
                  return (
                    <div key={day.format('YYYY-MM-DD')} className="day-header">
                      <div className="day-name">{capitalizedDay}</div>
                      <div className="day-date">{day.format('DD [de] MMMM')}</div>
                    </div>
                  );
                })}
              </div>

              <div className="schedule-body">
                {timeSlots.map((time, timeIdx) => (
                  <Fragment key={`row-${time}`}>
                    <div key={`time-${time}`} className="time-cell">{time}</div>
                    {weekDays.map((day, dayIdx) => {
                      const schedulesAtTime = getScheduleAtTime(day, time);

                      // Buscar un schedule que INICIE en esta hora (comparando solo la hora, no los minutos)
                      const timeHour = parseInt(time.split(':')[0]);
                      const scheduleStartingNow = schedulesAtTime.find(s => {
                        const scheduleStartHour = parseInt(s.startTime.split(':')[0]);
                        return scheduleStartHour === timeHour;
                      });

                      // Si hay un schedule que INICIA en esta hora, renderizarlo
                      if (scheduleStartingNow) {
                        const isSelected = selectedSchedule?.section.id === scheduleStartingNow.section.id;

                        // Verificar si el día está en el pasado
                        const isPastDate = day.isBefore(moment(), 'day');

                        // Deshabilitar si no hay cupos O si es una fecha pasada
                        const isDisabled = scheduleStartingNow.availablePlaces === 0 || isPastDate;

                        // Calcular duración en horas (redondeando hacia arriba para cubrir fracciones)
                        const startHour = parseInt(scheduleStartingNow.startTime.split(':')[0]);
                        const startMin = parseInt(scheduleStartingNow.startTime.split(':')[1]);
                        const endHour = parseInt(scheduleStartingNow.endTime.split(':')[0]);
                        const endMin = parseInt(scheduleStartingNow.endTime.split(':')[1]);

                        let duration = endHour - startHour;
                        if (endMin > 0 || startMin > 0) {
                          duration += 1; // Agregar una hora extra si hay minutos
                        }

                        // Calcular offsets para horarios intermedios (:30)
                        const offsetTop = startMin === 30 ? 30 : 0;
                        const offsetBottom = endMin === 30 ? 30 : 0;

                        // Calcular altura exacta: cada franja horaria es de 60px
                        // Siempre establecer altura explícita para sobrescribir el height: 100% del CSS
                        const exactHeight = (duration * 60) - offsetTop - offsetBottom;

                        return (
                          <div
                            key={`${day.format('YYYY-MM-DD')}-${time}`}
                            className={`schedule-block ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                            style={{
                              gridRow: `span ${duration}`,
                              marginTop: `${offsetTop}px`,
                              height: `${exactHeight}px`,
                              backgroundColor: isDisabled ? '#bdc1c6' : undefined,
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              opacity: isDisabled ? 0.6 : 1
                            }}
                            onClick={isDisabled ? undefined : () => handleScheduleClick(scheduleStartingNow, day)}
                          >
                            <div className="schedule-time">
                              {scheduleStartingNow.startTime} - {scheduleStartingNow.endTime}
                            </div>
                            <div className="schedule-teacher">{scheduleStartingNow.teacher}</div>
                            <div className="schedule-places">
                              {scheduleStartingNow.availablePlaces}/{scheduleStartingNow.totalPlaces} cupos
                            </div>
                          </div>
                        );
                      }

                      // Si NO hay un schedule que inicie aquí, pero SÍ hay uno activo (que empezó antes),
                      // NO renderizar nada (el bloque anterior ya ocupa este espacio)
                      if (schedulesAtTime.length > 0) {
                        // Hay un schedule activo pero no inicia aquí, skip esta celda
                        return null;
                      }

                      // Si no hay ningún schedule activo, renderizar celda vacía
                      return (
                        <div key={`${day.format('YYYY-MM-DD')}-${time}`} className="schedule-cell"></div>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
            </>
          )}
        </div>
      </div>

      {selectedSchedule && (
        <div className="selected-schedule-info">
          <h3>Horario Seleccionado ✓</h3>
          <div className="selected-info-grid">
            <div className="info-item">
              <span className="info-label">Curso:</span>
              <span className="info-value">{selectedSchedule.course.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Día:</span>
              <span className="info-value">{dayMap[selectedSchedule.day.toLowerCase()]}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Horario:</span>
              <span className="info-value">{selectedSchedule.startTime} - {selectedSchedule.endTime}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Profesor:</span>
              <span className="info-value">{selectedSchedule.teacher}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyScheduleSelector;
