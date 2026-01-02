import { useState, useEffect } from 'react';
import { getSectionCalendar } from '../../services/api';
import StartDateSelector from './StartDateSelector';
import './CopyWeeklyScheduleSelector.css';
import './MultiCourseStartDateSelector.css';

const CombinedScheduleDateSelector = ({
  selectedCourses = [],
  planType,
  selectedSchedules = [],
  onSelectSchedules,
  startDates = {},
  onStartDatesChange,
  onContinue,
  onBack,
  maxCourses = 5
}) => {
  const [courseDates, setCourseDates] = useState(startDates || {});
  const [availableDatesMap, setAvailableDatesMap] = useState({});
  const [loadingDates, setLoadingDates] = useState({});
  const [errors, setErrors] = useState({});

  const maxSchedulesAllowed = planType === 'extended' ? 1 : maxCourses;
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayNames = {
    monday: 'LUNES',
    tuesday: 'MARTES',
    wednesday: 'MIÉRCOLES',
    thursday: 'JUEVES',
    friday: 'VIERNES',
    saturday: 'SÁBADO'
  };

  const timeSlots = ['10:00-12:00', '12:30-14:30', '15:30-16:30', '18:30-20:30'];

  // Cargar fechas disponibles cuando se seleccionan horarios
  useEffect(() => {
    selectedSchedules.forEach(async (schedule) => {
      const sectionId = schedule.section?.id;
      if (!sectionId) return;

      // Evitar cargar múltiples veces
      if (availableDatesMap[sectionId]) return;

      try {
        setLoadingDates(prev => ({ ...prev, [sectionId]: true }));
        console.log(`📅 Cargando fechas para sección ${sectionId}`);

        const dates = await getSectionCalendar(sectionId);

        setAvailableDatesMap(prev => ({
          ...prev,
          [sectionId]: dates
        }));

        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[sectionId];
          return newErrors;
        });
      } catch (error) {
        console.error(`Error al cargar fechas para sección ${sectionId}:`, error);
        setErrors(prev => ({
          ...prev,
          [sectionId]: 'No se pudieron cargar las fechas disponibles'
        }));
      } finally {
        setLoadingDates(prev => ({ ...prev, [sectionId]: false }));
      }
    });
  }, [selectedSchedules, availableDatesMap]);

  // Actualizar fechas cuando cambie el estado local
  useEffect(() => {
    onStartDatesChange(courseDates);
  }, [courseDates, onStartDatesChange]);

  // Obtener horarios para una celda específica (día + franja horaria)
  const getSchedulesAtCell = (day, timeSlot) => {
    if (!selectedCourses || selectedCourses.length === 0) return [];

    const result = [];
    selectedCourses.forEach(course => {
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
    return selectedSchedules.some(schedule =>
      schedule.section?.id === courseData.section?.id
    );
  };

  // Validar si hay conflicto de horario
  const hasScheduleConflict = (courseData) => {
    return selectedSchedules.some(schedule =>
      schedule.day === courseData.day &&
      schedule.timeSlot === courseData.timeSlot
    );
  };

  // Adaptar estructura del curso para compatibilidad
  const adaptSchedule = (courseData) => {
    const [startTime, endTime] = courseData.timeSlot.split('-');
    return {
      ...courseData,
      course: {
        name: courseData.courseName,
        id: courseData.courseId
      },
      startTime: startTime,
      endTime: endTime
    };
  };

  const handleCourseClick = (courseData) => {
    const isSelected = isScheduleSelected(courseData);

    if (isSelected) {
      // Deseleccionar - remover este curso del array
      const newSchedules = selectedSchedules.filter(
        schedule => schedule.section?.id !== courseData.section?.id
      );
      onSelectSchedules(newSchedules);

      // También remover la fecha asociada
      const newCourseDates = { ...courseDates };
      delete newCourseDates[courseData.section?.id];
      setCourseDates(newCourseDates);

      console.log('❌ Curso removido:', courseData.courseName);
      return;
    }

    // Validar límite según el tipo de plan
    if (selectedSchedules.length >= maxSchedulesAllowed) {
      if (planType === 'extended') {
        alert(`⚠️ Plan Extendido: Solo puedes seleccionar UN horario\n\nEl plan extendido consiste en clases el mismo día cada semana.\n\nSi necesitas más flexibilidad, considera el Plan Mensual.`);
      } else {
        alert(`⚠️ Puedes seleccionar máximo ${maxSchedulesAllowed} horarios.\n\nSi necesitas más horarios, por favor contáctanos.`);
      }
      return;
    }

    // Validar conflictos de horario
    if (hasScheduleConflict(courseData)) {
      alert(`⚠️ Conflicto de horario\n\nYa tienes seleccionado un curso para ${courseData.day} a las ${courseData.timeSlot}.\n\nPor favor, elige otro horario.`);
      return;
    }

    // Agregar curso a la selección
    const adaptedSchedule = adaptSchedule(courseData);
    const newSchedules = [...selectedSchedules, adaptedSchedule];
    onSelectSchedules(newSchedules);
    console.log('✅ Curso agregado:', courseData.courseName, '- Total:', newSchedules.length);
  };

  const handleDateSelect = (sectionId, date) => {
    const newCourseDates = {
      ...courseDates,
      [sectionId]: date
    };
    setCourseDates(newCourseDates);
    console.log(`📆 Fecha seleccionada para sección ${sectionId}:`, date);
  };

  const allDatesSelected = selectedSchedules.every(
    schedule => courseDates[schedule.section?.id]
  );

  const selectedDatesCount = Object.keys(courseDates).filter(key => courseDates[key]).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDayName = (day) => {
    const dayNamesLower = {
      'monday': 'Lunes',
      'tuesday': 'Martes',
      'wednesday': 'Miércoles',
      'thursday': 'Jueves',
      'friday': 'Viernes',
      'saturday': 'Sábado',
      'sunday': 'Domingo'
    };
    return dayNamesLower[day?.toLowerCase()] || day;
  };

  const handleContinue = () => {
    if (selectedSchedules.length === 0) {
      alert('⚠️ Por favor selecciona al menos un horario para continuar.');
      return;
    }
    if (!allDatesSelected) {
      alert('⚠️ Por favor selecciona una fecha de inicio para todos los horarios.');
      return;
    }
    onContinue && onContinue();
  };

  const getStepDescription = () => {
    if (planType === 'extended') {
      return (
        <>
          Selecciona <strong>UN día de la semana</strong> y <strong>horario</strong> fijo.
          Con el <strong>Plan Extendido</strong>, tendrás clase el mismo día cada semana durante varias semanas.
        </>
      );
    } else {
      return (
        <>
          Selecciona los <strong>días de la semana</strong> y <strong>horarios</strong> que mejor se ajusten a tu disponibilidad.
          Con el <strong>Plan Mensual</strong>, puedes elegir varios días diferentes de la semana.
        </>
      );
    }
  };

  if (!selectedCourses || selectedCourses.length === 0) {
    return (
      <div className="enrollment-step">
        <h2>Paso 3: Selecciona Horarios y Fechas</h2>
        <div className="loading">No hay técnicas seleccionadas...</div>
      </div>
    );
  }

  return (
    <div className="enrollment-step">
      <h2>Paso 3: Selecciona Horarios y Fechas</h2>

      {/* Sección 1: Selección de Horarios */}
      <div className="plan-section">
        <h3 className="section-title">1. Elige tus horarios</h3>
        <p className="step-description">
          {getStepDescription()}
          {selectedSchedules.length > 0 && (
            <span className="selection-counter">
              {' '}({selectedSchedules.length}/{maxSchedulesAllowed} seleccionado{selectedSchedules.length > 1 ? 's' : ''})
            </span>
          )}
        </p>

        <div className="schedule-selector-layout">
          {/* Técnicas seleccionadas */}
          <div className="courses-sidebar">
            <div className="sidebar-header">
              <h3>Técnicas Seleccionadas</h3>
            </div>
            <div className="selected-course-display">
              {selectedCourses.map(course => (
                <div key={course.id} className="selected-course-item">
                  <span className="course-color-indicator" style={{ backgroundColor: course.color }}></span>
                  <span className="course-item-name">{course.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Calendario de horarios */}
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
                      const cellSchedules = getSchedulesAtCell(day, timeSlot);
                      const hasConflict = selectedSchedules.some(
                        schedule => schedule.day === day && schedule.timeSlot === timeSlot
                      );

                      return (
                        <div
                          key={`${day}-${timeSlot}`}
                          className={`grid-cell ${hasConflict ? 'cell-occupied' : ''}`}
                        >
                          {cellSchedules.map((scheduleData, idx) => {
                            const isSelected = isScheduleSelected(scheduleData);
                            return (
                              <div
                                key={`${scheduleData.courseId}-${idx}`}
                                className={`course-block ${isSelected ? 'selected multi-select' : ''}`}
                                style={{ backgroundColor: scheduleData.color }}
                                onClick={() => handleCourseClick(scheduleData)}
                              >
                                <span className="course-name">
                                  {scheduleData.timeSlot}
                                </span>
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
      </div>

      {/* Sección 2: Selección de Fechas (solo se muestra si hay horarios seleccionados) */}
      {selectedSchedules.length > 0 && (
        <div className="plan-section" style={{ marginTop: '2rem' }}>
          <h3 className="section-title">2. Selecciona las fechas de inicio</h3>
          <p className="step-description">
            Elige cuándo quieres comenzar cada curso
          </p>

          {/* Progress indicator */}
          <div className="dates-progress-bar">
            <div className="progress-info">
              <span className="progress-text">
                {selectedDatesCount} de {selectedSchedules.length} fechas seleccionadas
              </span>
              <div className="progress-percentage">
                {Math.round((selectedDatesCount / selectedSchedules.length) * 100)}%
              </div>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${(selectedDatesCount / selectedSchedules.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="multi-course-calendars">
            {selectedSchedules.map((schedule, index) => {
              const sectionId = schedule.section?.id;
              const isLoading = loadingDates[sectionId];
              const error = errors[sectionId];
              const hasSelectedDate = courseDates[sectionId];

              return (
                <div
                  key={sectionId || index}
                  className={`course-calendar-card ${hasSelectedDate ? 'has-date' : ''}`}
                >
                  {/* Header del curso */}
                  <div className="course-calendar-header">
                    <div className="course-number">
                      {index + 1}
                    </div>
                    <div
                      className="course-color-dot"
                      style={{ backgroundColor: schedule.color }}
                    />
                    <div className="course-info">
                      <h3 className="course-title">{schedule.courseName}</h3>
                      <p className="schedule-info">
                        {getDayName(schedule.day)} {schedule.timeSlot}
                        {schedule.teacher && ` · ${schedule.teacher}`}
                      </p>
                    </div>
                    {hasSelectedDate && (
                      <span className="date-selected-badge">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Calendario para este curso */}
                  {isLoading ? (
                    <div className="loading-calendar">
                      <div className="spinner"></div>
                      <p>Cargando fechas disponibles...</p>
                    </div>
                  ) : error ? (
                    <div className="error-calendar">
                      <p>{error}</p>
                    </div>
                  ) : (
                    <div className="calendar-wrapper">
                      <StartDateSelector
                        selectedSchedule={schedule}
                        selectedStartDate={courseDates[sectionId]}
                        onSelectStartDate={(date) => handleDateSelect(sectionId, date)}
                        onAvailableDatesLoad={(dates) => {
                          setAvailableDatesMap(prev => ({
                            ...prev,
                            [sectionId]: dates
                          }));
                        }}
                      />
                    </div>
                  )}

                  {hasSelectedDate && (
                    <div className="date-confirmation">
                      ✓ Comenzarás el <strong>{formatDate(courseDates[sectionId])}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Resumen de fechas seleccionadas */}
          {selectedDatesCount > 0 && (
            <div className="dates-summary">
              <h4>📅 Resumen de horarios y fechas</h4>
              <ul className="dates-summary-list">
                {selectedSchedules.map((schedule) => {
                  const sectionId = schedule.section?.id;
                  const date = courseDates[sectionId];
                  if (!date) return null;

                  return (
                    <li key={sectionId} className="date-summary-item">
                      <div
                        className="summary-color-dot"
                        style={{ backgroundColor: schedule.color }}
                      />
                      <span className="summary-course">{schedule.courseName}</span>
                      <span className="summary-separator">→</span>
                      <span className="summary-date">{formatDate(date)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Botones de navegación */}
      <div className="step-actions" style={{ marginTop: '2rem' }}>
        <button className="btn-secondary" onClick={onBack}>
          ← Volver
        </button>
        <button
          className="btn-primary"
          onClick={handleContinue}
          disabled={selectedSchedules.length === 0 || !allDatesSelected}
          title={
            selectedSchedules.length === 0
              ? 'Selecciona al menos un horario'
              : !allDatesSelected
              ? 'Selecciona una fecha para cada horario'
              : ''
          }
        >
          Continuar →
        </button>
      </div>

      {selectedSchedules.length > 0 && !allDatesSelected && selectedDatesCount > 0 && (
        <div className="incomplete-warning">
          ⚠️ Debes seleccionar una fecha de inicio para todos los horarios
        </div>
      )}
    </div>
  );
};

export default CombinedScheduleDateSelector;
