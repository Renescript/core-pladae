import { useState, useEffect } from 'react';
import { createEnrollment } from '../../services/api';
import CourseTechniqueSelector from './CourseTechniqueSelector';
import CombinedPlanSelector from './CombinedPlanSelector';
import CombinedScheduleDateSelector from './CombinedScheduleDateSelector';
import FinalEnrollmentSummary from './FinalEnrollmentSummary';
import StudentForm from './StudentForm';
import PaymentWebpay from './PaymentWebpay';
import EnrollmentProgressSummary from './EnrollmentProgressSummary';

const STORAGE_KEY = 'multi_enrollment_draft';

/**
 * Guarda el progreso del formulario en sessionStorage
 */
const saveDraftToSession = (data) => {
  try {
    const safeDraft = {
      currentStep: data.currentStep,
      planType: data.planType,
      selectedCourses: data.selectedCourses, // Cursos/técnicas seleccionados (array)
      selectedSchedules: data.selectedSchedules, // Array de horarios
      startDates: data.startDates, // Objeto con fechas por curso
      selectedPlan: data.selectedPlan,
      studentData: {
        firstName: data.studentData?.firstName || '',
        lastName: data.studentData?.lastName || '',
        phone: data.studentData?.phone || '',
        // NO guardamos el email por seguridad
      },
      timestamp: Date.now()
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeDraft));
    console.log('💾 Progreso guardado (multi-enrollment)');
  } catch (error) {
    console.error('Error al guardar draft:', error);
  }
};

/**
 * Recupera el progreso guardado del sessionStorage
 */
const loadDraftFromSession = () => {
  try {
    const draft = sessionStorage.getItem(STORAGE_KEY);
    if (!draft) return null;

    const parsed = JSON.parse(draft);

    // Verificar que no sea muy antiguo (1 hora)
    const ONE_HOUR = 60 * 60 * 1000;
    if (Date.now() - parsed.timestamp > ONE_HOUR) {
      console.log('⏰ Draft expirado (más de 1 hora)');
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    console.log('✅ Draft recuperado (test-enrollment):', parsed);
    return parsed;
  } catch (error) {
    console.error('Error al cargar draft:', error);
    return null;
  }
};

/**
 * Limpia el draft del sessionStorage
 */
const clearDraftFromSession = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Draft eliminado (test-enrollment)');
  } catch (error) {
    console.error('Error al limpiar draft:', error);
  }
};

const TestEnrollmentForm = ({ onClose, onSuccess }) => {
  // Intentar cargar draft guardado
  const savedDraft = loadDraftFromSession();

  const [currentStep, setCurrentStep] = useState(savedDraft?.currentStep || 1);
  const [planType, setPlanType] = useState(savedDraft?.planType || null); // 'monthly' o 'extended'
  const [selectedCourses, setSelectedCourses] = useState(savedDraft?.selectedCourses || []); // Técnicas/cursos seleccionados (array)
  const [selectedSchedules, setSelectedSchedules] = useState(savedDraft?.selectedSchedules || []); // Array de horarios
  const [startDates, setStartDates] = useState(savedDraft?.startDates || {}); // Fechas de inicio por curso
  const [availableDatesMap, setAvailableDatesMap] = useState({}); // Fechas disponibles por curso
  const [selectedPlan, setSelectedPlan] = useState(savedDraft?.selectedPlan || null);
  const [studentData, setStudentData] = useState(savedDraft?.studentData || {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [isClassDatesValid, setIsClassDatesValid] = useState(true);
  const [finalClassDates, setFinalClassDates] = useState({}); // Fechas finales por curso

  // Auto-guardar progreso cuando cambie el estado
  useEffect(() => {
    // Solo guardar si hay algún progreso (evitar guardar estado inicial vacío)
    if (currentStep > 1 || planType || selectedCourses.length > 0 || selectedSchedules.length > 0 || selectedPlan || studentData.firstName) {
      saveDraftToSession({
        currentStep,
        planType,
        selectedCourses,
        selectedSchedules,
        startDates,
        selectedPlan,
        studentData
      });
    }
  }, [currentStep, planType, selectedCourses, selectedSchedules, startDates, selectedPlan, studentData]);

  // Validaciones para avanzar entre pasos (6 pasos)
  // Paso 1 → 2: Al menos una técnica/curso seleccionado
  const canProceedToStep2 = selectedCourses.length > 0;

  // Paso 2 → 3: Tipo de plan y plan específico seleccionados
  const canProceedToStep3 = planType !== null && selectedPlan !== null && isClassDatesValid;

  // Paso 3 → 4: Al menos un horario seleccionado y todas las fechas configuradas
  const allStartDatesSelected = selectedSchedules.every(
    schedule => startDates[schedule.section?.id]
  );
  const canProceedToStep4 = selectedSchedules.length > 0 && allStartDatesSelected;

  // Paso 4 → 5: Resumen revisado (siempre puede continuar)
  const canProceedToStep5 = true;

  // Paso 5 → 6: Datos del estudiante completos
  const canProceedToStep6 = studentData.firstName && studentData.lastName && studentData.email && studentData.phone;

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && canProceedToStep2) setCurrentStep(2);
    else if (currentStep === 2 && canProceedToStep3) setCurrentStep(3);
    else if (currentStep === 3 && canProceedToStep4) setCurrentStep(4);
    else if (currentStep === 4 && canProceedToStep5) setCurrentStep(5);
    else if (currentStep === 5 && canProceedToStep6) setCurrentStep(6);
  };

  // Función para editar un paso específico desde el resumen
  const handleEditStep = (step) => {
    setCurrentStep(step);
  };

  // Limpiar draft al cerrar
  const handleClose = () => {
    clearDraftFromSession();
    onClose();
  };

  // Función para reiniciar completamente el formulario (útil para desarrollo/testing)
  const handleResetForm = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar el formulario? Se perderán todos los datos.')) {
      clearDraftFromSession();
      setCurrentStep(1);
      setPlanType(null);
      setSelectedCourses([]);
      setSelectedSchedules([]);
      setStartDates({});
      setSelectedPlan(null);
      setStudentData({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      });
      setIsClassDatesValid(true);
      setFinalClassDates({});
      console.log('🔄 Formulario reiniciado completamente');
    }
  };

  const handleEnrollmentComplete = async (paymentData) => {
    // Construir section_ids array
    const sectionIds = selectedSchedules.map(schedule => schedule.section.id);

    // Construir section_dates object con las fechas finales por curso
    const sectionDatesPayload = {};
    selectedSchedules.forEach(schedule => {
      const sectionId = schedule.section.id;
      sectionDatesPayload[sectionId] = finalClassDates[sectionId] || [];
    });

    // Construir el payload según el formato requerido por el backend
    const enrollmentPayload = {
      name: `${studentData.firstName} ${studentData.lastName}`,
      email: studentData.email,
      phone: studentData.phone,
      section_ids: sectionIds,
      payment_plan_id: selectedPlan.id,
      payment_method_id: paymentData.paymentMethodId,
      enrollment_amount: selectedSchedules.length, // Cantidad de cursos
      total_tuition_fee: selectedPlan.price,
      start_date: Object.values(startDates)[0], // Primera fecha de inicio
      section_dates: sectionDatesPayload
    };

    console.log('📤 Enviando inscripción multi-curso al backend:', enrollmentPayload);

    try {
      // Enviar datos a la API
      const result = await createEnrollment(enrollmentPayload);
      console.log('Inscripción exitosa:', result);

      // Si hay un link de pago de Transbank, redirigir
      if (result.transbank_payment && result.transbank_payment.full_url) {
        console.log('Redirigiendo a Transbank:', result.transbank_payment.full_url);
        // Limpiar draft antes de redirigir
        clearDraftFromSession();
        window.location.href = result.transbank_payment.full_url;
        return;
      }

      // Si no hay redirección (método sin pago), mostrar pantalla de éxito
      const successData = {
        schedules: selectedSchedules, // Array de cursos
        startDates: startDates,
        plan: selectedPlan,
        student: studentData,
        ...paymentData,
        enrollmentResponse: result
      };

      // Limpiar draft después de éxito
      clearDraftFromSession();

      onSuccess && onSuccess(successData);
    } catch (error) {
      console.error('Error al crear inscripción:', error);
      // Mostrar el error al usuario
      alert(`Hubo un error al procesar tu inscripción: ${error.message}`);
    }
  };

  const getStepClass = (step) => {
    if (step === currentStep) return 'active';
    if (step < currentStep) return 'completed';
    return '';
  };

  return (
    <div className="enrollment-container">
        <div className="enrollment-header-buttons">
          <button className="reset-button" onClick={handleResetForm} title="Reiniciar formulario">
            🔄
          </button>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        <div className="enrollment-progress">
          <div className={`progress-step ${getStepClass(1)}`}>
            <div className="step-number">1</div>
            <div className="step-label">Técnicas</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${getStepClass(2)}`}>
            <div className="step-number">2</div>
            <div className="step-label">Plan</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${getStepClass(3)}`}>
            <div className="step-number">3</div>
            <div className="step-label">Horarios</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${getStepClass(4)}`}>
            <div className="step-number">4</div>
            <div className="step-label">Resumen</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${getStepClass(5)}`}>
            <div className="step-number">5</div>
            <div className="step-label">Datos</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${getStepClass(6)}`}>
            <div className="step-number">6</div>
            <div className="step-label">Pago</div>
          </div>
        </div>

        <div className="enrollment-content">
          <div className="enrollment-layout-with-summary">
            {/* Sidebar izquierdo: Resumen */}
            <div className="enrollment-summary-sidebar">
              <EnrollmentProgressSummary
                currentStep={currentStep}
                selectedSchedules={selectedSchedules}
                startDates={startDates}
                selectedPlan={selectedPlan}
                studentData={studentData}
              />
            </div>

            {/* Contenido principal */}
            <div className="enrollment-main-content">
              {/* Paso 1: Selección de Técnicas */}
              {currentStep === 1 && (
                <CourseTechniqueSelector
                  selectedCourses={selectedCourses}
                  onSelectCourses={setSelectedCourses}
                  onContinue={handleNextStep}
                  maxCourses={5}
                />
              )}

              {/* Paso 2: Plan (Tipo + Plan específico combinados) */}
              {currentStep === 2 && (
                <CombinedPlanSelector
                  selectedPlanType={planType}
                  onSelectPlanType={setPlanType}
                  selectedPlan={selectedPlan}
                  onSelectPlan={handleSelectPlan}
                  selectedSchedules={selectedSchedules}
                  startDates={startDates}
                  availableDatesMap={availableDatesMap}
                  onValidationChange={setIsClassDatesValid}
                  onClassDatesChange={setFinalClassDates}
                  onContinue={handleNextStep}
                  onBack={() => setCurrentStep(1)}
                />
              )}

              {/* Paso 3: Horarios y Fechas (combinados) */}
              {currentStep === 3 && (
                <CombinedScheduleDateSelector
                  selectedCourses={selectedCourses}
                  planType={planType}
                  selectedSchedules={selectedSchedules}
                  onSelectSchedules={setSelectedSchedules}
                  startDates={startDates}
                  onStartDatesChange={setStartDates}
                  onContinue={handleNextStep}
                  onBack={() => setCurrentStep(2)}
                  maxCourses={5}
                />
              )}

              {/* Paso 4: Resumen de Inscripción */}
              {currentStep === 4 && (
                <FinalEnrollmentSummary
                  selectedCourses={selectedCourses}
                  planType={planType}
                  selectedPlan={selectedPlan}
                  selectedSchedules={selectedSchedules}
                  startDates={startDates}
                  onEditStep={handleEditStep}
                  onContinue={handleNextStep}
                  onBack={() => setCurrentStep(3)}
                />
              )}

              {/* Paso 5: Datos del Estudiante */}
              {currentStep === 5 && (
                <StudentForm
                  studentData={studentData}
                  onUpdateStudent={setStudentData}
                  onNext={handleNextStep}
                  onBack={() => setCurrentStep(4)}
                />
              )}

              {/* Paso 6: Pago */}
              {currentStep === 6 && (
                <PaymentWebpay
                  enrollmentData={{
                    schedules: selectedSchedules,
                    startDates: startDates,
                    plan: selectedPlan,
                    student: studentData
                  }}
                  onBack={() => setCurrentStep(5)}
                  onComplete={handleEnrollmentComplete}
                />
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default TestEnrollmentForm;
