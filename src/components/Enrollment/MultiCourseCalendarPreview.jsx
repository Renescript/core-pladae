import { useState, useEffect } from 'react';
import { getPreviewClassDates } from '../../services/api';
import EditableClassList from './EditableClassList';
import './MultiCourseCalendarPreview.css';

/**
 * Componente para mostrar vista previa consolidada de fechas de clase
 * para múltiples cursos en un calendario
 */
const MultiCourseCalendarPreview = ({
  selectedSchedules = [],
  startDates = {},
  selectedPlan,
  availableDatesMap = {},
  onClassDatesChange,
  onValidationChange
}) => {
  const [allCourseDates, setAllCourseDates] = useState({});
  const [editedDates, setEditedDates] = useState({});
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Cargar fechas de preview para cada curso
  useEffect(() => {
    const loadAllPreviewDates = async () => {
      if (!selectedPlan) return;

      setLoading(true);
      const newCourseDates = {};

      try {
        for (const schedule of selectedSchedules) {
          const sectionId = schedule.section?.id;
          const startDate = startDates[sectionId];

          if (!sectionId || !startDate) continue;

          console.log(`📆 Cargando preview para curso ${schedule.courseName}`);
          const dates = await getPreviewClassDates(sectionId, startDate, selectedPlan.id);
          newCourseDates[sectionId] = dates || [];
        }

        setAllCourseDates(newCourseDates);
        setEditedDates({}); // Resetear fechas editadas
      } catch (error) {
        console.error('Error al cargar preview de fechas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllPreviewDates();
  }, [selectedSchedules, startDates, selectedPlan]);

  // Notificar fechas finales al padre
  useEffect(() => {
    const finalDates = {};
    Object.keys(allCourseDates).forEach(sectionId => {
      finalDates[sectionId] = editedDates[sectionId] || allCourseDates[sectionId] || [];
    });

    if (onClassDatesChange && Object.keys(finalDates).length > 0) {
      onClassDatesChange(finalDates);
    }
  }, [allCourseDates, editedDates, onClassDatesChange]);

  // Notificar validación al padre
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  const handleCourseClassDatesChange = (sectionId, newDates) => {
    setEditedDates(prev => ({
      ...prev,
      [sectionId]: newDates
    }));
  };

  const handleCourseValidationChange = (sectionId, valid) => {
    // Verificar que TODOS los cursos sean válidos
    const allValid = selectedSchedules.every(schedule => {
      const id = schedule.section?.id;
      if (id === sectionId) return valid;
      // Asumir que otros cursos son válidos si no han sido invalidados
      return true;
    });
    setIsValid(allValid);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getDayName = (day) => {
    const dayNames = {
      'monday': 'Lun',
      'tuesday': 'Mar',
      'wednesday': 'Mié',
      'thursday': 'Jue',
      'friday': 'Vie',
      'saturday': 'Sáb',
      'sunday': 'Dom'
    };
    return dayNames[day?.toLowerCase()] || day;
  };

  if (loading) {
    return (
      <div className="multi-course-preview-section">
        <div className="loading-preview">
          <div className="spinner"></div>
          <p>Cargando calendario de clases...</p>
        </div>
      </div>
    );
  }

  const hasAnyDates = Object.keys(allCourseDates).some(
    sectionId => allCourseDates[sectionId]?.length > 0
  );

  if (!hasAnyDates) {
    return null;
  }

  return (
    <div className="multi-course-preview-section">
      <div className="preview-header">
        <h3>📅 Vista Previa de tus Clases</h3>
        <p className="preview-description">
          Este es el calendario de todas tus clases según el plan seleccionado
        </p>
      </div>

      {/* Calendario consolidado por curso */}
      <div className="courses-preview-grid">
        {selectedSchedules.map((schedule) => {
          const sectionId = schedule.section?.id;
          const courseDates = editedDates[sectionId] || allCourseDates[sectionId] || [];

          if (courseDates.length === 0) return null;

          return (
            <div key={sectionId} className="course-preview-card">
              <div className="course-preview-header">
                <div
                  className="course-preview-color"
                  style={{ backgroundColor: schedule.color }}
                />
                <div className="course-preview-info">
                  <h4>{schedule.courseName}</h4>
                  <p>
                    {getDayName(schedule.day)} {schedule.timeSlot}
                  </p>
                </div>
                <div className="course-preview-count">
                  {courseDates.length} clases
                </div>
              </div>

              <div className="course-dates-list">
                {courseDates.slice(0, 6).map((dateStr, index) => (
                  <div key={index} className="date-chip">
                    <span className="date-number">{index + 1}</span>
                    <span className="date-text">{formatDate(dateStr)}</span>
                  </div>
                ))}
                {courseDates.length > 6 && (
                  <div className="date-chip more">
                    +{courseDates.length - 6} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkbox para editar fechas */}
      <div className="change-dates-checkbox-container">
        <label className="change-dates-checkbox-label">
          <input
            type="checkbox"
            checked={showEditor}
            onChange={(e) => setShowEditor(e.target.checked)}
            className="change-dates-checkbox"
          />
          <span className="checkbox-text">
            Quiero personalizar las fechas de mis clases
          </span>
        </label>
      </div>

      {/* Editor de fechas por curso */}
      {showEditor && (
        <div className="dates-editor-section">
          <h4 className="editor-title">Personalizar Fechas de Clases</h4>
          <p className="editor-description">
            Modifica las fechas de cada curso según tu preferencia. Asegúrate de no repetir fechas.
          </p>

          {selectedSchedules.map((schedule) => {
            const sectionId = schedule.section?.id;
            const courseDates = editedDates[sectionId] || allCourseDates[sectionId] || [];
            const courseAvailableDates = availableDatesMap[sectionId] || [];

            if (courseDates.length === 0) return null;

            return (
              <div key={sectionId} className="course-editor-card">
                <div className="course-editor-header">
                  <div
                    className="course-editor-color"
                    style={{ backgroundColor: schedule.color }}
                  />
                  <h5>{schedule.courseName}</h5>
                </div>

                <EditableClassList
                  classDates={courseDates}
                  availableDates={courseAvailableDates}
                  onClassDatesChange={(newDates) =>
                    handleCourseClassDatesChange(sectionId, newDates)
                  }
                  onValidationChange={(valid) =>
                    handleCourseValidationChange(sectionId, valid)
                  }
                  dayOfWeek={schedule.day}
                />
              </div>
            );
          })}

          {!isValid && (
            <div className="validation-error">
              ⚠️ Corrige las fechas duplicadas antes de continuar
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiCourseCalendarPreview;
