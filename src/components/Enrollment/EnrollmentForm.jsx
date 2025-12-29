import { useState, useEffect } from 'react';
import { createEnrollment } from '../../services/api';
import WeeklyScheduleSelector from './WeeklyScheduleSelector';
import StartDateSelector from './StartDateSelector';
import PlanSelector from './PlanSelector';
import StudentForm from './StudentForm';
import PaymentWebpay from './PaymentWebpay';

const STORAGE_KEY = 'enrollment_draft';

/**
 * Guarda el progreso del formulario en sessionStorage
 * Solo guarda datos no sensibles (sin email completo)
 */
const saveDraftToSession = (data) => {
  try {
    const safeDraft = {
      currentStep: data.currentStep,
      selectedSchedule: data.selectedSchedule,
      selectedStartDate: data.selectedStartDate,
      selectedPlan: data.selectedPlan,
      studentData: {
        firstName: data.studentData?.firstName || '',
        lastName: data.studentData?.lastName || '',
        phone: data.studentData?.phone || '',
        rut: data.studentData?.rut || '',
        address: data.studentData?.address || '',
        // NO guardamos el email por seguridad
      },
      timestamp: Date.now()
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeDraft));
    console.log('💾 Progreso guardado');
  } catch (error) {
    console.error('Error al guardar draft:', error);
  }
};

/**
 * Recupera el progreso guardado del sessionStorage
 * Si tiene más de 1 hora, lo descarta
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

    console.log('✅ Draft recuperado:', parsed);
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
    console.log('🗑️ Draft eliminado');
  } catch (error) {
    console.error('Error al limpiar draft:', error);
  }
};

const EnrollmentForm = ({ onClose, onSuccess }) => {
  // Intentar cargar draft guardado
  const savedDraft = loadDraftFromSession();

  const [currentStep, setCurrentStep] = useState(savedDraft?.currentStep || 1);
  const [selectedSchedule, setSelectedSchedule] = useState(savedDraft?.selectedSchedule || null);
  const [selectedStartDate, setSelectedStartDate] = useState(savedDraft?.selectedStartDate || null);
  const [selectedPlan, setSelectedPlan] = useState(savedDraft?.selectedPlan || null);
  const [studentData, setStudentData] = useState(savedDraft?.studentData || {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    rut: '',
    address: ''
  });

  // Nuevo orden: Horario + Fecha → Plan → Datos → Pago
  const canProceedToStep2 = selectedSchedule !== null && selectedStartDate !== null;
  const canProceedToStep3 = selectedPlan !== null;

  // Auto-guardar progreso cuando cambie el estado
  useEffect(() => {
    // Solo guardar si hay algún progreso (evitar guardar estado inicial vacío)
    if (currentStep > 1 || selectedSchedule || selectedStartDate || selectedPlan || studentData.firstName) {
      saveDraftToSession({
        currentStep,
        selectedSchedule,
        selectedStartDate,
        selectedPlan,
        studentData
      });
    }
  }, [currentStep, selectedSchedule, selectedStartDate, selectedPlan, studentData]);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && canProceedToStep2) setCurrentStep(2);
    else if (currentStep === 2 && canProceedToStep3) setCurrentStep(3);
  };

  // Limpiar draft al cerrar
  const handleClose = () => {
    clearDraftFromSession();
    onClose();
  };

  const handleEnrollmentComplete = async (paymentData) => {
    // Construir el payload según el formato requerido por el backend
    // Nota: api.js ya envuelve esto en { enrollment: {...} }
    const enrollmentPayload = {
      name: `${studentData.firstName} ${studentData.lastName}`,
      email: studentData.email,
      section_ids: [selectedSchedule.section.id],
      payment_plan_id: selectedPlan.id,
      payment_method_id: paymentData.paymentMethodId,
      enrollment_amount: 1,
      total_tuition_fee: selectedPlan.price,
      start_date: selectedStartDate || selectedSchedule.date
    };

    console.log('Enviando inscripción al backend:', enrollmentPayload);

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
        course: selectedSchedule.course,
        schedule: selectedSchedule,
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
        <button className="close-button" onClick={handleClose}>×</button>

        <div className="enrollment-progress">
          <div className={`progress-step ${getStepClass(1)}`}>
            <div className="step-number">1</div>
            <div className="step-label">Horario y Fecha</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${getStepClass(2)}`}>
            <div className="step-number">2</div>
            <div className="step-label">Plan</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${getStepClass(3)}`}>
            <div className="step-number">3</div>
            <div className="step-label">Datos</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${getStepClass(4)}`}>
            <div className="step-number">4</div>
            <div className="step-label">Pago</div>
          </div>
        </div>

        <div className="enrollment-content">
          {currentStep === 1 && (
            <>
              <WeeklyScheduleSelector
                selectedSchedule={selectedSchedule}
                onSelectSchedule={setSelectedSchedule}
              />

              <StartDateSelector
                selectedSchedule={selectedSchedule}
                selectedStartDate={selectedStartDate}
                onSelectStartDate={setSelectedStartDate}
              />

              <div className="step-actions">
                <button
                  className="btn-primary"
                  onClick={handleNextStep}
                  disabled={!canProceedToStep2}
                >
                  Continuar
                </button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <PlanSelector
                selectedPlan={selectedPlan}
                onSelectPlan={handleSelectPlan}
              />
              <div className="step-actions">
                <button className="btn-secondary" onClick={() => setCurrentStep(1)}>
                  Volver
                </button>
                <button
                  className="btn-primary"
                  onClick={handleNextStep}
                  disabled={!canProceedToStep3}
                >
                  Continuar
                </button>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <StudentForm
              studentData={studentData}
              onUpdateStudent={setStudentData}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <PaymentWebpay
              enrollmentData={{
                course: selectedSchedule?.course,
                sections: selectedSchedule ? [selectedSchedule.section] : [],
                schedule: selectedSchedule,
                plan: selectedPlan,
                student: studentData
              }}
              onBack={() => setCurrentStep(3)}
              onComplete={handleEnrollmentComplete}
            />
          )}
        </div>
      </div>
  );
};

export default EnrollmentForm;
