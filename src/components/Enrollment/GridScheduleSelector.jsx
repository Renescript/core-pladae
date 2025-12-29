import { useState, useEffect, useCallback, useRef } from 'react';
import { getCoursesSchedulesGrid } from '../../services/api';
import StartDateSelector from './StartDateSelector';
import './CopyWeeklyScheduleSelector.css';

const GridScheduleSelector = ({ selectedSchedule, onSelectSchedule }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCourses, setVisibleCourses] = useState({});
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]); // Almacenar fechas disponibles
  const startDateSelectorRef = useRef(null); // Referencia para scroll

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayNames = {
    monday: 'LUNES',
    tuesday: 'MARTES',
    wednesday: 'MIÉRCOLES',
    thursday: 'JUEVES',
    friday: 'VIERNES',
    saturday: 'SÁBADO'
  };

  const timeSlots = ['10:00-12:00', '12:30-14:30', '15:30-17:30', '18:30-20:30'];

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const data = await getCoursesSchedulesGrid();
        console.log('📚 Cursos cargados desde el backend:', data);
        setCourses(data);

        // Inicializar todos los cursos como visibles
        const initialVisible = {};
        data.forEach(course => {
          initialVisible[course.id] = true;
        });
        setVisibleCourses(initialVisible);
      } catch (error) {
        console.error('Error al cargar cursos:', error);
        alert('Hubo un error al cargar los horarios. Usando datos de ejemplo.');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const toggleCourseVisibility = (courseId) => {
    setVisibleCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const toggleAllCourses = (visible) => {
    const newVisible = {};
    courses.forEach(course => {
      newVisible[course.id] = visible;
    });
    setVisibleCourses(newVisible);
  };

  // Obtener cursos para una celda específica (día + franja horaria)
  const getCoursesAtCell = (day, timeSlot) => {
    const result = [];
    courses.forEach(course => {
      // Solo mostrar cursos visibles
      if (!visibleCourses[course.id]) return;

      course.schedules.forEach(schedule => {
        if (schedule.day === day && schedule.timeSlot === timeSlot) {
          result.push({
            ...schedule,
            courseId: course.id,
            courseName: course.name,
            color: course.color
          });
        }
      });
    });
    return result;
  };

  // Verificar si un horario está seleccionado
  const isScheduleSelected = (courseData) => {
    if (!selectedSchedule) return false;
    return selectedSchedule.courseId === courseData.courseId &&
           selectedSchedule.day === courseData.day &&
           selectedSchedule.timeSlot === courseData.timeSlot;
  };


  const handleCourseClick = (courseData) => {
    const isSelected = isScheduleSelected(courseData);

    if (isSelected) {
      // Deseleccionar
      onSelectSchedule(null);
      setSelectedStartDate(null);
      setAvailableDates([]);
    } else {
      // Adaptar estructura para compatibilidad con StartDateSelector
      const [startTime, endTime] = courseData.timeSlot.split('-');
      const adaptedSchedule = {
        ...courseData,
        course: {
          name: courseData.courseName,
          id: courseData.courseId
        },
        startTime: startTime,
        endTime: endTime
      };
      onSelectSchedule(adaptedSchedule);

      // Hacer scroll hacia el calendario
      setTimeout(() => {
        if (startDateSelectorRef.current) {
          // Buscar el calendar-container dentro del StartDateSelector
          const calendarContainer = startDateSelectorRef.current.querySelector('.calendar-container');
          const element = calendarContainer || startDateSelectorRef.current;
          const yOffset = -80; // Offset para posicionamiento óptimo
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

          // Scroll más suave y lento
          const start = window.pageYOffset;
          const distance = y - start;
          const duration = 1000; // 1 segundo de duración
          let startTime = null;

          function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            // Easing function para suavidad
            const ease = progress < 0.5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            window.scrollTo(0, start + distance * ease);

            if (timeElapsed < duration) {
              requestAnimationFrame(animation);
            }
          }

          requestAnimationFrame(animation);
        }
      }, 150);
    }
  };

  const handleAvailableDatesLoad = useCallback((dates) => {
    console.log('📅 Fechas disponibles recibidas en GridScheduleSelector:', dates);
    setAvailableDates(dates);
    // No llamar a onSelectSchedule aquí para evitar loops
    // Las fechas se pasarán cuando el usuario seleccione una fecha de inicio
  }, []);

  const handleStartDateSelect = (date) => {
    setSelectedStartDate(date);
    // Actualizar el schedule con la fecha seleccionada Y las fechas disponibles
    if (selectedSchedule) {
      const updatedSchedule = {
        ...selectedSchedule,
        selectedDate: { date: date },
        availableDates: availableDates // Asegurar que siempre tenga availableDates
      };
      console.log('📅 GridScheduleSelector - actualizando schedule con:', updatedSchedule);
      onSelectSchedule(updatedSchedule);
    }
  };

  if (loading) {
    return (
      <div className="enrollment-step">
        <h2>Paso 1: Selecciona tu Horario</h2>
        <div className="loading">Cargando horarios disponibles...</div>
      </div>
    );
  }

  return (
    <div className="enrollment-step">
      <h2>Paso 1: Selecciona tu Horario</h2>
      <p className="step-description">
        Haz clic en el curso y horario que deseas.
      </p>

      <div className="schedule-selector-layout">
        {/* Columna izquierda: Lista de cursos */}
        <div className="courses-sidebar">
          <div className="sidebar-header">
            <h3>Cursos Disponibles</h3>
            <div className="filter-actions">
              <button className="filter-btn" onClick={() => toggleAllCourses(true)}>
                Mostrar todos
              </button>
              <button className="filter-btn" onClick={() => toggleAllCourses(false)}>
                Ocultar todos
              </button>
            </div>
          </div>
          <div className="courses-list">
            {courses.map(course => (
              <label
                key={course.id}
                className={`course-item ${visibleCourses[course.id] ? 'active' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={visibleCourses[course.id] || false}
                  onChange={() => toggleCourseVisibility(course.id)}
                />
                <span className="course-color-indicator" style={{ backgroundColor: course.color }}></span>
                <span className="course-item-name">{course.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Columna derecha: Grilla de horarios */}
        <div className="schedule-grid-wrapper">
          <div className="grid-calendar-container">
            <div className="grid-calendar">
              {/* Header con días */}
              <div className="grid-header">
                <div className="time-header"></div>
                {days.map(day => (
                  <div key={day} className="day-header">
                    {dayNames[day]}
                  </div>
                ))}
              </div>

              {/* Filas de horarios */}
              {timeSlots.map(timeSlot => (
                <div key={timeSlot} className="grid-row">
                  <div className="time-cell">{timeSlot}</div>
                  {days.map(day => {
                    const cellCourses = getCoursesAtCell(day, timeSlot);
                    return (
                      <div key={`${day}-${timeSlot}`} className="grid-cell">
                        {cellCourses.map((courseData, idx) => {
                          const isSelected = isScheduleSelected(courseData);
                          return (
                            <div
                              key={`${courseData.courseId}-${idx}`}
                              className={`course-block ${isSelected ? 'selected' : ''}`}
                              style={{ backgroundColor: courseData.color }}
                              onClick={() => handleCourseClick(courseData)}
                            >
                              <span className="course-name">{courseData.courseName}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div ref={startDateSelectorRef}>
        <StartDateSelector
          selectedSchedule={selectedSchedule}
          selectedStartDate={selectedStartDate}
          onSelectStartDate={handleStartDateSelect}
          onAvailableDatesLoad={handleAvailableDatesLoad}
        />
      </div>
    </div>
  );
};

export default GridScheduleSelector;
