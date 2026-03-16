import { useState, useEffect, useRef } from 'react';
import { getSectionCalendar } from '../../services/api';
import StartDateSelector from './StartDateSelector';
import './MultiCourseStartDateSelector.css';

/**
 * Componente para seleccionar fecha de inicio para múltiples cursos
 * Muestra un calendario por cada curso seleccionado
 */
const MultiCourseStartDateSelector = ({
  selectedSchedules = [],
  startDates = {},
  onStartDatesChange,
  onNext,
  onBack
}) => {
  const [courseDates, setCourseDates] = useState(startDates || {});
  const [availableDatesMap, setAvailableDatesMap] = useState({});
  const [loadingDates, setLoadingDates] = useState({});
  const [errors, setErrors] = useState({});

  // Ref para rastrear peticiones en curso y evitar duplicados
  const loadingRequestsRef = useRef(new Set());

  // Cargar fechas disponibles para cada curso
  useEffect(() => {
    const loadAllDates = async () => {
      // Filtrar solo las secciones que necesitan cargar datos
      const sectionsToLoad = selectedSchedules.filter(schedule => {
        const sectionId = schedule.section?.id;
        if (!sectionId) return false;
        // No cargar si ya está en cache o si ya está siendo cargada
        if (availableDatesMap[sectionId] || loadingRequestsRef.current.has(sectionId)) {
          return false;
        }
        return true;
      });

      if (sectionsToLoad.length === 0) return;

      // Marcar todas las secciones como "cargando"
      const newLoadingStates = {};
      sectionsToLoad.forEach(schedule => {
        const sectionId = schedule.section.id;
        newLoadingStates[sectionId] = true;
        loadingRequestsRef.current.add(sectionId);
      });
      setLoadingDates(prev => ({ ...prev, ...newLoadingStates }));

      console.log(`📅 Cargando ${sectionsToLoad.length} secciones en paralelo`);

      // Cargar todas las fechas en paralelo usando Promise.allSettled
      const loadPromises = sectionsToLoad.map(async (schedule) => {
        const sectionId = schedule.section.id;
        try {
          console.log(`📅 Cargando fechas para sección ${sectionId}`);
          const dates = await getSectionCalendar(sectionId);
          return { sectionId, dates, error: null };
        } catch (error) {
          console.error(`❌ Error al cargar fechas para sección ${sectionId}:`, error);
          return { sectionId, dates: null, error: error.message || 'No se pudieron cargar las fechas' };
        }
      });

      const results = await Promise.allSettled(loadPromises);

      // Procesar todos los resultados de una vez
      const newDatesMap = {};
      const newErrors = {};
      const finishedLoading = {};

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { sectionId, dates, error } = result.value;
          finishedLoading[sectionId] = false;
          loadingRequestsRef.current.delete(sectionId);

          if (error) {
            newErrors[sectionId] = error;
          } else if (dates) {
            newDatesMap[sectionId] = dates;
          }
        }
      });

      // Actualizar todos los estados de una vez
      setAvailableDatesMap(prev => ({ ...prev, ...newDatesMap }));
      setErrors(prev => ({ ...prev, ...newErrors }));
      setLoadingDates(prev => ({ ...prev, ...finishedLoading }));

      console.log(`✅ Carga completada. ${Object.keys(newDatesMap).length} exitosas, ${Object.keys(newErrors).length} con errores`);
    };

    loadAllDates();
  }, [selectedSchedules, availableDatesMap]);

  // Actualizar fechas cuando cambie el estado local
  useEffect(() => {
    onStartDatesChange(courseDates);
  }, [courseDates, onStartDatesChange]);

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

  const selectedCount = Object.keys(courseDates).filter(key => courseDates[key]).length;

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
    const dayNames = {
      'monday': 'Lunes',
      'tuesday': 'Martes',
      'wednesday': 'Miércoles',
      'thursday': 'Jueves',
      'friday': 'Viernes',
      'saturday': 'Sábado',
      'sunday': 'Domingo'
    };
    return dayNames[day?.toLowerCase()] || day;
  };

  if (selectedSchedules.length === 0) {
    return (
      <div className="enrollment-step">
        <h2>Paso 2: Configura las Fechas de Inicio</h2>
        <div className="error-message">
          No hay cursos seleccionados. Por favor vuelve al paso anterior.
        </div>
        <div className="step-actions">
          <button className="btn-secondary" onClick={onBack}>
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="enrollment-step">
      <h2>Paso 2: Configura las Fechas de Inicio</h2>
      <p className="step-description">
        Selecciona cuándo quieres comenzar cada curso
      </p>

      {/* Progress indicator */}
      <div className="dates-progress-bar">
        <div className="progress-info">
          <span className="progress-text">
            {selectedCount} de {selectedSchedules.length} fechas seleccionadas
          </span>
          <div className="progress-percentage">
            {Math.round((selectedCount / selectedSchedules.length) * 100)}%
          </div>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${(selectedCount / selectedSchedules.length) * 100}%` }}
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
      {selectedCount > 0 && (
        <div className="dates-summary">
          <h4>📅 Resumen de fechas</h4>
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

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>
          ← Volver
        </button>
        <button
          className="btn-primary"
          onClick={onNext}
          disabled={!allDatesSelected}
          title={!allDatesSelected ? 'Selecciona una fecha para cada curso' : ''}
        >
          Continuar →
        </button>
      </div>

      {!allDatesSelected && selectedCount > 0 && (
        <div className="incomplete-warning">
          ⚠️ Debes seleccionar una fecha de inicio para todos los cursos
        </div>
      )}
    </div>
  );
};

export default MultiCourseStartDateSelector;
