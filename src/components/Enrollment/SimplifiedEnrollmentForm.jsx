import { useState, useEffect } from 'react';
import { createEnrollment, getPlans } from '../../services/api';
import SimplifiedTechniqueSelector from './SimplifiedTechniqueSelector';
import SimplifiedClassQuantitySelector from './SimplifiedClassQuantitySelector';
import SimplifiedDateTimeSelector from './SimplifiedDateTimeSelector';
import SimplifiedSummary from './SimplifiedSummary';
import SimplifiedDataPayment from './SimplifiedDataPayment';
import './SimplifiedEnrollmentForm.css';

const STORAGE_KEY = 'simplified_enrollment_draft';

/**
 * Guarda el progreso en sessionStorage
 */
const saveDraft = (data) => {
  try {
    const safeDraft = {
      currentStep: data.currentStep,
      technique: data.technique,
      selectedPlan: data.selectedPlan,
      startDate: data.startDate,
      timeSlot: data.timeSlot,
      studentData: {
        firstName: data.studentData?.firstName || '',
        lastName: data.studentData?.lastName || '',
        phone: data.studentData?.phone || ''
      },
      paymentMethod: data.paymentMethod,
      timestamp: Date.now()
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeDraft));
    console.log('💾 Progreso guardado');
  } catch (error) {
    console.error('Error al guardar draft:', error);
  }
};

/**
 * Carga el progreso desde sessionStorage
 */
const loadDraft = () => {
  try {
    const draft = sessionStorage.getItem(STORAGE_KEY);
    if (!draft) return null;

    const parsed = JSON.parse(draft);

    // Verificar que no sea muy antiguo (1 hora)
    const ONE_HOUR = 60 * 60 * 1000;
    if (Date.now() - parsed.timestamp > ONE_HOUR) {
      console.log('⏰ Draft expirado');
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
 * Limpia el draft
 */
const clearDraft = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Draft eliminado');
  } catch (error) {
    console.error('Error al limpiar draft:', error);
  }
};

const SimplifiedEnrollmentForm = ({ onClose, onSuccess }) => {
  const savedDraft = loadDraft();

  const [currentStep, setCurrentStep] = useState(savedDraft?.currentStep || 1);
  const [technique, setTechnique] = useState(savedDraft?.technique || null);
  const [selectedPlan, setSelectedPlan] = useState(savedDraft?.selectedPlan || null);
  const [startDate, setStartDate] = useState(savedDraft?.startDate || null);
  const [timeSlot, setTimeSlot] = useState(savedDraft?.timeSlot || null);
  const [studentData, setStudentData] = useState(savedDraft?.studentData || {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState(savedDraft?.paymentMethod || null);

  // Auto-guardar progreso
  useEffect(() => {
    if (currentStep > 1 || technique || selectedPlan) {
      saveDraft({
        currentStep,
        technique,
        selectedPlan,
        startDate,
        timeSlot,
        studentData,
        paymentMethod
      });
    }
  }, [currentStep, technique, selectedPlan, startDate, timeSlot, studentData, paymentMethod]);

  // Limpiar draft al cerrar
  const handleClose = () => {
    clearDraft();
    onClose();
  };

  // Reiniciar formulario
  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar el formulario?')) {
      clearDraft();
      setCurrentStep(1);
      setTechnique(null);
      setSelectedPlan(null);
      setStartDate(null);
      setTimeSlot(null);
      setStudentData({ firstName: '', lastName: '', email: '', phone: '' });
      setPaymentMethod(null);
      console.log('🔄 Formulario reiniciado');
    }
  };

  // Navegar a un paso específico (para editar desde el resumen)
  const handleEditStep = (step) => {
    setCurrentStep(step);
  };

  // Completar inscripción
  const handleEnrollmentComplete = async () => {
    // Encontrar el schedule seleccionado
    const selectedDate = new Date(startDate + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];

    const selectedSchedule = technique.schedules.find(
      schedule => schedule.day === dayName && schedule.timeSlot === timeSlot
    );

    const enrollmentPayload = {
      name: `${studentData.firstName} ${studentData.lastName}`,
      email: studentData.email,
      phone: studentData.phone,
      section_ids: [selectedSchedule?.section?.id],
      payment_plan_id: selectedPlan?.id,
      payment_method_id: paymentMethod,
      enrollment_amount: selectedPlan?.enrollment_amount || 0,
      total_tuition_fee: selectedPlan?.price || 0,
      instalments_number: 1,
      start_date: startDate
    };

    console.log('📤 Enviando inscripción:', enrollmentPayload);

    try {
      const result = await createEnrollment(enrollmentPayload);
      console.log('✅ Inscripción exitosa:', result);

      // Si hay redirección a Transbank
      if (result.transbank_payment && result.transbank_payment.full_url) {
        console.log('Redirigiendo a Transbank:', result.transbank_payment.full_url);
        clearDraft();
        window.location.href = result.transbank_payment.full_url;
        return;
      }

      // Éxito sin redirección
      const successData = {
        technique,
        selectedPlan,
        startDate,
        timeSlot,
        student: studentData,
        paymentMethod,
        enrollmentResponse: result
      };

      clearDraft();
      onSuccess && onSuccess(successData);
    } catch (error) {
      console.error('❌ Error al crear inscripción:', error);
      alert(`Hubo un error al procesar tu inscripción: ${error.message}`);
    }
  };

  return (
    <div className="simplified-enrollment-container">
      {/* Header */}
      <div className="simplified-enrollment-header">
        <button className="reset-button" onClick={handleReset} title="Reiniciar formulario">
          🔄
        </button>
        <button className="close-button" onClick={handleClose}>×</button>
      </div>

      {/* Contenido */}
      <div className="simplified-enrollment-content">
        {/* Paso 1: Técnica */}
        {currentStep === 1 && (
          <SimplifiedTechniqueSelector
            selectedTechnique={technique}
            onSelectTechnique={setTechnique}
            onContinue={() => setCurrentStep(2)}
          />
        )}

        {/* Paso 2: Cantidad de clases */}
        {currentStep === 2 && (
          <SimplifiedClassQuantitySelector
            selectedQuantity={selectedPlan}
            onSelectQuantity={setSelectedPlan}
            onContinue={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {/* Paso 3: Fecha + Horario */}
        {currentStep === 3 && (
          <SimplifiedDateTimeSelector
            technique={technique}
            selectedStartDate={startDate}
            selectedTimeSlot={timeSlot}
            onStartDateChange={setStartDate}
            onTimeSlotChange={setTimeSlot}
            onContinue={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {/* Paso 4: Resumen */}
        {currentStep === 4 && (
          <SimplifiedSummary
            technique={technique}
            selectedPlan={selectedPlan}
            startDate={startDate}
            timeSlot={timeSlot}
            onEditStep={handleEditStep}
            onContinue={() => setCurrentStep(5)}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {/* Paso 5: Datos + Pago */}
        {currentStep === 5 && (
          <SimplifiedDataPayment
            studentData={studentData}
            onStudentDataChange={setStudentData}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            totalPrice={selectedPlan?.price + selectedPlan?.enrollment_amount}
            onComplete={handleEnrollmentComplete}
            onBack={() => setCurrentStep(4)}
          />
        )}
      </div>
    </div>
  );
};

export default SimplifiedEnrollmentForm;
