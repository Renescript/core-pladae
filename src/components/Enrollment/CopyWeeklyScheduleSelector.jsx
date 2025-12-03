import { useState, useEffect } from 'react';
import { getCoursesSchedulesGrid } from '../../services/api';
import './CopyWeeklyScheduleSelector.css';

const CopyWeeklyScheduleSelector = ({ selectedSchedules, onSelectSchedules }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCourses, setVisibleCourses] = useState({});

  const MAX_SELECTIONS = 4;

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
    return selectedSchedules.some(
      s => s.courseId === courseData.courseId &&
           s.day === courseData.day &&
           s.timeSlot === courseData.timeSlot
    );
  };

  const handleCourseClick = (courseData) => {
    const isSelected = isScheduleSelected(courseData);

    if (isSelected) {
      // Deseleccionar
      const newSelections = selectedSchedules.filter(
        s => !(s.courseId === courseData.courseId &&
               s.day === courseData.day &&
               s.timeSlot === courseData.timeSlot)
      );
      onSelectSchedules(newSelections);
    } else {
      // Seleccionar (validar máximo)
      if (selectedSchedules.length < MAX_SELECTIONS) {
        onSelectSchedules([...selectedSchedules, courseData]);
      } else {
        alert(`Solo puedes seleccionar hasta ${MAX_SELECTIONS} horarios`);
      }
    }
  };

  const handleRemoveSchedule = (scheduleToRemove) => {
    const newSelections = selectedSchedules.filter(
      s => !(s.courseId === scheduleToRemove.courseId &&
             s.day === scheduleToRemove.day &&
             s.timeSlot === scheduleToRemove.timeSlot)
    );
    onSelectSchedules(newSelections);
  };

  if (loading) {
    return (
      <div className="enrollment-step">
        <h2>Paso 1: Selecciona tus Horarios</h2>
        <div className="loading">Cargando horarios disponibles...</div>
      </div>
    );
  }

  return (
    <div className="enrollment-step">
      <h2>Paso 1: Selecciona tus Horarios</h2>
      <p className="step-description">
        Selecciona entre 1 y {MAX_SELECTIONS} horarios. Haz clic en los cursos que te interesan.
      </p>

      {/* Filtro de cursos */}
      <div className="course-filter">
        <div className="filter-header">
          <h3>Filtrar Cursos</h3>
          <div className="filter-actions">
            <button onClick={() => toggleAllCourses(true)}>Mostrar todos</button>
            <button onClick={() => toggleAllCourses(false)}>Ocultar todos</button>
          </div>
        </div>
        <div className="filter-options">
          {courses.map(course => (
            <label
              key={course.id}
              className={`filter-item ${visibleCourses[course.id] ? 'active' : ''}`}
              style={{ '--course-color': course.color }}
            >
              <input
                type="checkbox"
                checked={visibleCourses[course.id] || false}
                onChange={() => toggleCourseVisibility(course.id)}
              />
              <span className="filter-color" style={{ backgroundColor: course.color }}></span>
              <span className="filter-name">{course.name}</span>
            </label>
          ))}
        </div>
      </div>

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
                          {isSelected && <span className="selected-badge">✓</span>}
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

      {selectedSchedules.length > 0 && (
        <div className="selected-schedules-info">
          <h3>
            Horarios Seleccionados ({selectedSchedules.length}/{MAX_SELECTIONS}) ✓
          </h3>
          <div className="selected-list">
            {selectedSchedules.map((schedule, idx) => (
              <div key={idx} className="selected-item" style={{ borderLeftColor: schedule.color }}>
                <div className="selected-item-content">
                  <span className="course-badge" style={{ backgroundColor: schedule.color }}>
                    {schedule.courseName}
                  </span>
                  <span className="schedule-day">{dayNames[schedule.day]}</span>
                  <span className="schedule-time">{schedule.timeSlot}</span>
                  <span className="schedule-teacher">{schedule.teacher}</span>
                  <span className="schedule-capacity">
                    {schedule.available}/{schedule.places} cupos
                  </span>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveSchedule(schedule)}
                  title="Eliminar horario"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CopyWeeklyScheduleSelector;
