import { useState, useEffect } from 'react';
import { getCoursesSchedulesGrid, getSectionCalendar } from '../../services/api';
import './CopyWeeklyScheduleSelector.css';

const GridScheduleSelector = ({ selectedSchedule, onSelectSchedule }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCourses, setVisibleCourses] = useState({});
  const [availableDates, setAvailableDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

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

  // Log para debugging
  console.log('🔍 RENDER - availableDates:', availableDates);
  console.log('🔍 RENDER - availableDates.length:', availableDates.length);
  console.log('🔍 RENDER - loadingDates:', loadingDates);
  console.log('🔍 RENDER - selectedSchedule:', selectedSchedule);

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

  // Sincronizar selectedDate cuando se carga un draft guardado
  useEffect(() => {
    if (selectedSchedule?.selectedDate) {
      console.log('🔄 Sincronizando selectedDate desde draft guardado:', selectedSchedule.selectedDate);
      setSelectedDate(selectedSchedule.selectedDate);
    }
  }, [selectedSchedule?.selectedDate]);

  // Cargar fechas disponibles cuando se selecciona un horario
  useEffect(() => {
    console.log('🔄 useEffect EJECUTADO - selectedSchedule cambió:', selectedSchedule);

    const loadAvailableDates = async () => {
      if (!selectedSchedule || !selectedSchedule.section) {
        console.log('⚠️ No hay selectedSchedule o section, limpiando fechas');
        setAvailableDates([]);
        setSelectedDate(null);
        return;
      }

      try {
        setLoadingDates(true);
        const sectionId = selectedSchedule.section.id;

        console.log(`📅 Cargando fechas para sección ${sectionId} (próximos 3 meses automáticos)`);

        const calendar = await getSectionCalendar(sectionId);
        console.log('📅 Fechas disponibles (tipo):', typeof calendar, Array.isArray(calendar));
        console.log('📅 Fechas disponibles (datos):', calendar);
        console.log('📅 Cantidad de fechas recibidas:', calendar?.length);

        console.log('⚡ A PUNTO DE ACTUALIZAR ESTADO con:', calendar);
        setAvailableDates(calendar || []);
        console.log('📅 setAvailableDates EJECUTADO con array de longitud:', (calendar || []).length);
      } catch (error) {
        console.error('❌ Error al cargar fechas disponibles:', error);
        console.log('⚡ Limpiando availableDates por error');
        setAvailableDates([]);
      } finally {
        setLoadingDates(false);
      }
    };

    loadAvailableDates();
  }, [selectedSchedule]);

  const handleCourseClick = (courseData) => {
    const isSelected = isScheduleSelected(courseData);

    if (isSelected) {
      // Deseleccionar
      onSelectSchedule(null);
      setAvailableDates([]);
      setSelectedDate(null);
    } else {
      // Seleccionar (solo uno)
      onSelectSchedule(courseData);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Actualizar el schedule con la fecha seleccionada
    if (selectedSchedule) {
      onSelectSchedule({
        ...selectedSchedule,
        selectedDate: date
      });
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

      {selectedSchedule && (
        <div className="available-dates-section">
            <h4>Selecciona una fecha de inicio</h4>

            {loadingDates ? (
              <div className="loading-dates">Cargando fechas disponibles...</div>
            ) : availableDates.length > 0 ? (
              <div className="dates-grid">
                {availableDates.map((dateItem, idx) => {
                  const isDateSelected = selectedDate?.date === dateItem.date;
                  const hasAvailability = dateItem.available_places > 0;

                  return (
                    <div
                      key={idx}
                      className={`date-card ${isDateSelected ? 'selected' : ''} ${!hasAvailability ? 'full' : ''}`}
                      onClick={() => hasAvailability && handleDateSelect(dateItem)}
                      style={{ cursor: hasAvailability ? 'pointer' : 'not-allowed' }}
                    >
                      <div className="date-label">{new Date(dateItem.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                      <div className="date-availability">
                        {hasAvailability ? (
                          <span className="available">{dateItem.available_places} cupos</span>
                        ) : (
                          <span className="full-text">Completo</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-dates">No hay fechas disponibles en los próximos 3 meses</div>
            )}
        </div>
      )}
    </div>
  );
};

export default GridScheduleSelector;
