import { useState } from 'react';
import { createEnrollment } from '../../services/api';
import GridScheduleSelector from './GridScheduleSelector';
import PlanSelector from './PlanSelector';
import StudentForm from './StudentForm';
import PaymentWebpay from './PaymentWebpay';

const TestEnrollmentForm = ({ onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [studentData, setStudentData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  // Nuevo orden: Horario → Plan → Datos → Pago
  const canProceedToStep2 = selectedSchedule !== null;
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
    // Construir el payload según el formato requerido por el backend
    // Nota: api.js ya envuelve esto en { enrollment: {...} }
    const enrollmentPayload = {
      name: `${studentData.firstName} ${studentData.lastName}`,
      email: studentData.email,
      phone: studentData.phone,
      section_ids: [selectedSchedule.section.id],
      payment_plan_id: selectedPlan.id,
      payment_method_id: paymentData.paymentMethodId,
      enrollment_amount: 1,
      total_tuition_fee: selectedPlan.price,
      start_date: selectedSchedule.selectedDate.date
    };

    console.log('Enviando inscripción al backend:', enrollmentPayload);

    try {
      // Enviar datos a la API
      const result = await createEnrollment(enrollmentPayload);
      console.log('Inscripción exitosa:', result);

      // Si hay un link de pago de Transbank, redirigir
      if (result.transbank_payment && result.transbank_payment.full_url) {
        console.log('Redirigiendo a Transbank:', result.transbank_payment.full_url);
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
        <button className="close-button" onClick={onClose}>×</button>

        <div className="enrollment-progress">
          <div className={`progress-step ${getStepClass(1)}`}>
            <div className="step-number">1</div>
            <div className="step-label">Horario</div>
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
              <GridScheduleSelector
                selectedSchedule={selectedSchedule}
                onSelectSchedule={setSelectedSchedule}
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
                selectedSchedule={selectedSchedule}
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

export default TestEnrollmentForm;
