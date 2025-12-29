import { useState, useEffect, useCallback, useRef } from 'react';
import { getPlans, getPreviewClassDates } from '../../services/api';
import ClassPreviewCalendar from './ClassPreviewCalendar';
import EnrollmentSummary from './EnrollmentSummary';
import EditableClassList from './EditableClassList';
import './CopyWeeklyScheduleSelector.css';

const PlanSelector = ({
  selectedPlan,
  onSelectPlan,
  selectedSchedules = [],
  selectedSchedule = null,
  availableDates = [], // Fechas disponibles del Paso 1
  onValidationChange, // Callback para notificar el estado de validación
  onClassDatesChange // Callback para pasar las fechas finales al padre
}) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewDates, setPreviewDates] = useState([]);
  const [editedClassDates, setEditedClassDates] = useState(null); // Fechas editadas por el usuario
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isClassDatesValid, setIsClassDatesValid] = useState(true); // Estado de validación
  const [showDateEditor, setShowDateEditor] = useState(false); // Control para mostrar/ocultar editor
  const previewSectionRef = useRef(null); // Referencia para scroll

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await getPlans();
        console.log('Planes recibidos de la API:', data);
        setPlans(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar los planes:', err);
        setError('No se pudieron cargar los planes. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Cargar vista previa de fechas cuando se selecciona un plan
  useEffect(() => {
    const loadPreviewDates = async () => {
      // Solo cargar si hay plan seleccionado, horario seleccionado y fecha de inicio
      if (!selectedPlan || !selectedSchedule || !selectedSchedule.selectedDate) {
        setPreviewDates([]);
        setEditedClassDates(null);
        return;
      }

      try {
        setLoadingPreview(true);
        const sectionId = selectedSchedule.section.id;
        const startDate = selectedSchedule.selectedDate.date;
        const paymentPlanId = selectedPlan.id;

        console.log('📆 Cargando vista previa con:', { sectionId, startDate, paymentPlanId });

        const dates = await getPreviewClassDates(sectionId, startDate, paymentPlanId);
        console.log('📆 Fechas de clases previstas:', dates);

        setPreviewDates(dates || []);
        setEditedClassDates(null); // Resetear fechas editadas cuando cambia el plan
      } catch (error) {
        console.error('Error al cargar vista previa de fechas:', error);
        setPreviewDates([]);
        setEditedClassDates(null);
      } finally {
        setLoadingPreview(false);
      }
    };

    loadPreviewDates();
  }, [selectedPlan, selectedSchedule]);

  // Manejar cambios en las fechas de clases editadas por el usuario
  const handleClassDatesChange = (newDates) => {
    console.log('📝 Fechas de clases actualizadas:', newDates);
    setEditedClassDates(newDates);
    // Notificar al padre las fechas finales
    if (onClassDatesChange) {
      onClassDatesChange(newDates);
    }
  };

  // Manejar cambios en el estado de validación
  const handleValidationChange = useCallback((isValid) => {
    console.log('✅ Estado de validación actualizado:', isValid);
    setIsClassDatesValid(isValid);
  }, []);

  // Notificar al padre sobre el estado de validación
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isClassDatesValid);
    }
  }, [isClassDatesValid, onValidationChange]);

  // Notificar al padre las fechas cuando se cargan o actualizan
  useEffect(() => {
    const currentDates = editedClassDates || previewDates;
    if (onClassDatesChange && currentDates.length > 0) {
      onClassDatesChange(currentDates);
    }
  }, [editedClassDates, previewDates, onClassDatesChange]);

  // Usar fechas editadas si existen, o las fechas del preview
  const displayedClassDates = editedClassDates || previewDates;

  // Validar compatibilidad entre plan y horarios seleccionados
  const validatePlanCompatibility = (plan) => {
    // Si no hay horarios seleccionados, todos los planes son válidos
    if (selectedSchedules.length === 0) {
      return { valid: true, message: '' };
    }

    // Contar cursos únicos seleccionados
    const uniqueCourses = new Set(selectedSchedules.map(s => s.courseId));
    const coursesCount = uniqueCourses.size;
    const schedulesCount = selectedSchedules.length;

    // Validar según max_courses si existe en el plan
    if (plan.max_courses !== undefined) {
      if (coursesCount > plan.max_courses) {
        return {
          valid: false,
          message: `Este plan permite máximo ${plan.max_courses} curso${plan.max_courses > 1 ? 's' : ''}. Has seleccionado ${coursesCount} curso${coursesCount > 1 ? 's diferentes' : ''}.`
        };
      }
    }

    // Validar según tipo de plan
    if (plan.type === 'base' && coursesCount > 1) {
      return {
        valid: false,
        message: `El Plan Base solo permite 1 curso. Has seleccionado ${coursesCount} cursos diferentes.`
      };
    }

    // Validar cantidad de horarios vs sesiones permitidas
    if (plan.sessions_per_month !== undefined && schedulesCount > plan.sessions_per_month) {
      return {
        valid: false,
        message: `Este plan incluye ${plan.sessions_per_month} sesiones mensuales. Has seleccionado ${schedulesCount} horarios.`
      };
    }

    return { valid: true, message: '' };
  };

  const handlePlanClick = (plan) => {
    const validation = validatePlanCompatibility(plan);

    if (!validation.valid) {
      alert(`⚠️ Plan incompatible\n\n${validation.message}\n\nPor favor, ajusta tus horarios seleccionados o elige otro plan.`);
      return;
    }

    console.log('Plan seleccionado:', plan);
    onSelectPlan(plan);
    setShowDateEditor(false); // Resetear el estado del editor al cambiar plan

    // Scroll suave hacia la vista previa después de seleccionar
    setTimeout(() => {
      if (previewSectionRef.current) {
        const yOffset = -80;
        const y = previewSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;

        // Custom smooth scroll animation
        const start = window.pageYOffset;
        const distance = y - start;
        const duration = 1000;
        let startTime = null;

        function animation(currentTime) {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);

          // Easing function
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
  };

  if (loading) {
    return (
      <div className="enrollment-step">
        <h2>Paso 2: Elige tu Plan</h2>
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Cargando planes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enrollment-step">
        <h2>Paso 2: Elige tu Plan</h2>
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="enrollment-step">
        <h2>Paso 2: Elige tu Plan</h2>
        <div className="info-message">
          <p>No hay planes disponibles en este momento.</p>
        </div>
      </div>
    );
  }

  // Calcular información de la selección actual
  const uniqueCourses = new Set(selectedSchedules.map(s => s.courseId));
  const coursesCount = uniqueCourses.size;
  const schedulesCount = selectedSchedules.length;

  return (
    <div className="enrollment-step">
      <h2>Paso 2: Elige tu Plan</h2>

      {selectedSchedules.length > 0 && (
        <div className="selection-summary">
          <p>
            Has seleccionado <strong>{schedulesCount}</strong> horario{schedulesCount > 1 ? 's' : ''}
            {coursesCount > 1 ? ` de ${coursesCount} cursos diferentes` : ' del mismo curso'}
          </p>
        </div>
      )}

      <div className="plans-selection">
        {plans.map(plan => {
          const isSelected = selectedPlan?.id === plan.id;
          const validation = validatePlanCompatibility(plan);
          const isCompatible = validation.valid;

          return (
            <div
              key={plan.id}
              className={`plan-option ${isSelected ? 'selected' : ''} ${!isCompatible ? 'incompatible' : ''}`}
              onClick={() => handlePlanClick(plan)}
            >
              <h3>{plan.plan}</h3>
              <p className="plan-description">{plan.description}</p>

              <div className="plan-price">
                <span className="price-amount">${plan.price?.toLocaleString('es-CL')}</span>
              </div>

              <div className="plan-details">
                {plan.number_of_classes && (
                  <div className="plan-classes">
                    <span className="classes-number">{plan.number_of_classes}</span>
                    <span className="classes-label">clases incluidas</span>
                  </div>
                )}

                {plan.max_courses && (
                  <div className="plan-info-item">
                    <span className="info-label">Máximo:</span>
                    <span className="info-value">{plan.max_courses} curso{plan.max_courses > 1 ? 's' : ''}</span>
                  </div>
                )}

                {plan.type && (
                  <div className="plan-type-badge">
                    {plan.type === 'base' ? '📘 Base' : '🎨 Mixto'}
                  </div>
                )}
              </div>

              {!isCompatible && selectedSchedules.length > 0 && (
                <div className="incompatibility-warning">
                  ⚠️ {validation.message}
                </div>
              )}

              {isCompatible && !isSelected && selectedSchedules.length > 0 && (
                <div className="compatibility-badge">
                  ✓ Compatible
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Vista previa de fechas de clases en calendario */}
      {selectedPlan && selectedSchedule && selectedSchedule.selectedDate && (
        <div className="preview-dates-section" ref={previewSectionRef}>
          {loadingPreview ? (
            <div className="loading-preview">
              <div className="spinner"></div>
              <p>Cargando fechas de clases...</p>
            </div>
          ) : displayedClassDates.length > 0 ? (
            <>
              <ClassPreviewCalendar
                classDates={displayedClassDates}
                startDate={selectedSchedule.selectedDate.date}
              />

              {/* Checkbox para mostrar/ocultar el editor de fechas */}
              <div className="change-dates-checkbox-container">
                <label className="change-dates-checkbox-label">
                  <input
                    type="checkbox"
                    checked={showDateEditor}
                    onChange={(e) => setShowDateEditor(e.target.checked)}
                    className="change-dates-checkbox"
                  />
                  <span className="checkbox-text">Quiero cambiar las fechas de mis clases</span>
                </label>
              </div>

              {/* <EnrollmentSummary
                selectedSchedule={selectedSchedule}
                selectedPlan={selectedPlan}
                classDates={displayedClassDates}
                startDate={selectedSchedule.selectedDate.date}
              /> */}

              {/* Editor de fechas - solo visible cuando showDateEditor es true */}
              {showDateEditor && (
                <EditableClassList
                  classDates={displayedClassDates}
                  availableDates={availableDates}
                  onClassDatesChange={handleClassDatesChange}
                  onValidationChange={handleValidationChange}
                  dayOfWeek={selectedSchedule.day}
                />
              )}
              {/* Debug info */}
              {console.log('📊 PlanSelector pasando a EditableClassList:', {
                displayedClassDates,
                availableDates,
                availableDatesLength: availableDates?.length
              })}
            </>
          ) : (
            <div className="no-preview">No se pudieron cargar las fechas de clases</div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanSelector;
