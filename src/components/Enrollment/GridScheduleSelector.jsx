import { useState } from 'react';
import './CopyWeeklyScheduleSelector.css';

const GridScheduleSelector = ({
  selectedCourses = [], // Cursos/técnicas seleccionados en el paso anterior
  planType, // Tipo de plan: 'monthly' o 'extended'
  selectedSchedules = [], // Cambio: ahora es un array de horarios seleccionados
  onSelectSchedules, // Cambio: callback para actualizar múltiples horarios
  onContinue,
  onBack,
  maxCourses = 5
}) => {
  // Determinar el límite de horarios según el tipo de plan
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

  // Manejar el click en "Continuar"
  const handleContinue = () => {
    if (selectedSchedules.length === 0) {
      alert('⚠️ Por favor selecciona al menos un curso para continuar.');
      return;
    }
    onContinue && onContinue();
  };

  if (!selectedCourses || selectedCourses.length === 0) {
    return (
      <div className="enrollment-step">
        <h2>Paso 3: Selecciona tus Horarios</h2>
        <div className="loading">No hay técnicas seleccionadas...</div>
      </div>
    );
  }

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

  return (
    <div className="enrollment-step">
      <h2>Paso 3: Selecciona tus Horarios</h2>
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

        {/* Botones de navegación */}
        <div className="step-actions">
          <button className="btn-secondary" onClick={onBack}>
            ← Volver
          </button>
          <button
            className="btn-primary"
            onClick={handleContinue}
            disabled={selectedSchedules.length === 0}
          >
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
};

export default GridScheduleSelector;
