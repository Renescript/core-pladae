import { useState } from 'react';
import { createEnrollment } from '../../services/api';
import CopyWeeklyScheduleSelector from './CopyWeeklyScheduleSelector';
import PlanSelector from './PlanSelector';
import StudentForm from './StudentForm';
import PaymentWebpay from './PaymentWebpay';

const CopyEnrollmentForm = ({ onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [studentData, setStudentData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    rut: '',
    address: ''
  });

  // Nuevo orden: Horarios → Plan → Datos → Pago
  const canProceedToStep2 = selectedSchedules.length > 0;
  const canProceedToStep3 = selectedPlan !== null;
  const canProceedToStep4 = true; // Siempre puede proceder desde datos

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && canProceedToStep2) setCurrentStep(2);
    else if (currentStep === 2 && canProceedToStep3) setCurrentStep(3);
  };

  const handleEnrollmentComplete = async (paymentData) => {
    // Extraer todos los section_ids de los horarios seleccionados
    const sectionIds = selectedSchedules.map(schedule => schedule.section.id);

    // Obtener la fecha del primer horario (o usar fecha actual)
    const startDate = selectedSchedules[0]?.date || new Date().toISOString().split('T')[0];

    // Construir el payload según el formato requerido por el backend
    const enrollmentPayload = {
      name: `${studentData.firstName} ${studentData.lastName}`,
      email: studentData.email,
      phone: studentData.phone,
      rut: studentData.rut,
      section_ids: sectionIds,
      payment_plan_id: selectedPlan.id,
      payment_method_id: paymentData.paymentMethodId,
      enrollment_amount: selectedPlan.enrollment_amount || 1,
      total_tuition_fee: selectedPlan.price,
      date: startDate,
      sessions_count: selectedSchedules.length
    };

    console.log('📤 Enviando inscripción al backend:', enrollmentPayload);

    try {
      // Enviar datos a la API
      const result = await createEnrollment(enrollmentPayload);
      console.log('✅ Inscripción exitosa:', result);

      // Si hay un link de pago de Transbank, redirigir
      if (result.transbank_payment && result.transbank_payment.full_url) {
        console.log('💳 Redirigiendo a Transbank:', result.transbank_payment.full_url);
        window.location.href = result.transbank_payment.full_url;
        return;
      }

      // Si no hay redirección (método sin pago), mostrar pantalla de éxito
      const successData = {
        schedules: selectedSchedules,
        plan: selectedPlan,
        student: studentData,
        ...paymentData,
        enrollmentResponse: result
      };

      onSuccess && onSuccess(successData);
    } catch (error) {
      console.error('❌ Error al crear inscripción:', error);
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
        <button className="close-button" onClick={onClose}>×</button>

        <div className="enrollment-progress">
          <div className={`progress-step ${getStepClass(1)}`}>
            <div className="step-number">1</div>
            <div className="step-label">Horarios</div>
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
              <CopyWeeklyScheduleSelector
                selectedSchedules={selectedSchedules}
                onSelectSchedules={setSelectedSchedules}
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
                selectedSchedules={selectedSchedules}
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
                schedules: selectedSchedules,
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

export default CopyEnrollmentForm;
