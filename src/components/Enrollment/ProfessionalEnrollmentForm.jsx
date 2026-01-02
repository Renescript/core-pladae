import { useState, useEffect } from 'react';
import { createEnrollment, getDurationPlans } from '../../services/api';
import SimplifiedTechniqueSelector from './SimplifiedTechniqueSelector';
import SimplifiedPlanConfigurator from './SimplifiedPlanConfigurator';
import MultiDayScheduleSelector from './MultiDayScheduleSelector';
import DurationSelector from './DurationSelector';
import EditableScheduleCalendar from './EditableScheduleCalendar';
import SimplifiedDataPayment from './SimplifiedDataPayment';
import './ProfessionalEnrollment.css';
import './ProfessionalEnrollmentOverrides.css';

const STORAGE_KEY = 'professional_enrollment_draft';

const saveDraft = (data) => {
  try {
    const safeDraft = {
      currentStep: data.currentStep,
      technique: data.technique,
      frequency: data.frequency,
      selectedSchedules: data.selectedSchedules,
      durationMonths: data.durationMonths,
      classDates: data.classDates,
      studentData: {
        firstName: data.studentData?.firstName || '',
        lastName: data.studentData?.lastName || '',
        email: data.studentData?.email || '',
        phone: data.studentData?.phone || ''
      },
      paymentMethod: data.paymentMethod,
      timestamp: Date.now()
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeDraft));
  } catch (error) {
    console.error('Error al guardar draft:', error);
  }
};

const loadDraft = () => {
  try {
    const draft = sessionStorage.getItem(STORAGE_KEY);
    if (!draft) return null;

    const parsed = JSON.parse(draft);
    const ONE_HOUR = 60 * 60 * 1000;
    if (Date.now() - parsed.timestamp > ONE_HOUR) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Error al cargar draft:', error);
    return null;
  }
};

const clearDraft = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error al limpiar draft:', error);
  }
};

const ProfessionalEnrollmentForm = ({ onClose, onSuccess }) => {
  const savedDraft = loadDraft();

  const [currentStep, setCurrentStep] = useState(savedDraft?.currentStep || 1);
  const [technique, setTechnique] = useState(savedDraft?.technique || null);
  const [frequency, setFrequency] = useState(savedDraft?.frequency || null);
  const [selectedSchedules, setSelectedSchedules] = useState(savedDraft?.selectedSchedules || []);
  const [durationMonths, setDurationMonths] = useState(savedDraft?.durationMonths || null);
  const [classDates, setClassDates] = useState(savedDraft?.classDates || []);
  const [availableDates, setAvailableDates] = useState([]);
  const [isCalendarValid, setIsCalendarValid] = useState(true);
  const [durationPlans, setDurationPlans] = useState([]);
  const [studentData, setStudentData] = useState(savedDraft?.studentData || {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState(savedDraft?.paymentMethod || null);

  // Cargar planes de duración al montar el componente
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plans = await getDurationPlans();
        setDurationPlans(plans);
      } catch (error) {
        console.error('Error al cargar planes de duración:', error);
      }
    };
    loadPlans();
  }, []);

  // Funciones de cálculo de precios
  const calculateMonthlyPrice = () => {
    // Obtener el precio desde la técnica o desde el horario más bajo seleccionado
    let pricePerClass = 15000; // Fallback

    if (technique?.price_per_class) {
      pricePerClass = technique.price_per_class;
    } else if (selectedSchedules.length > 0) {
      // Si hay horarios seleccionados, usar el precio promedio
      const prices = selectedSchedules
        .map(schedule => {
          const scheduleData = technique?.schedules?.find(s =>
            s.timeSlot === schedule.timeSlot && s.dayOfWeek === schedule.dayOfWeek
          );
          return scheduleData?.pricePerSession;
        })
        .filter(price => price != null);

      if (prices.length > 0) {
        pricePerClass = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
      }
    }

    const classesPerMonth = frequency * 4;
    return pricePerClass * classesPerMonth;
  };

  const getDiscountPercentage = (months) => {
    // Buscar el descuento en los planes cargados desde la API
    const plan = durationPlans.find(p => p.months === months);
    return plan ? plan.discount_percentage : 0;
  };

  const calculateFinalPrice = () => {
    if (!durationMonths || !frequency) return { subtotal: 0, discountPercent: 0, discountAmount: 0, finalPrice: 0, monthlyPrice: 0 };

    const monthlyPrice = calculateMonthlyPrice();
    const subtotal = monthlyPrice * durationMonths;
    const discountPercent = getDiscountPercentage(durationMonths);
    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const finalPrice = subtotal - discountAmount;

    return { subtotal, discountPercent, discountAmount, finalPrice, monthlyPrice };
  };

  const calculateTotalClasses = () => {
    if (!frequency || !durationMonths) return 0;
    return frequency * 4 * durationMonths;
  };

  // Función para generar fechas de clases
  const generateClassDates = () => {
    if (!selectedSchedules || selectedSchedules.length === 0 || !durationMonths || !frequency) {
      console.error('Faltan datos para generar fechas de clases');
      return;
    }

    const totalClassesPerDay = Math.ceil((frequency * 4 * durationMonths) / frequency);
    const allDates = [];

    const dayMap = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
      'thursday': 4, 'friday': 5, 'saturday': 6
    };

    // Para cada día de la semana seleccionado
    selectedSchedules.forEach(schedule => {
      const startDate = schedule.date;
      const targetDayNumber = dayMap[schedule.dayOfWeek];
      const dates = [];
      let currentDate = new Date(startDate + 'T00:00:00');

      // Generar fechas para este día de la semana
      while (dates.length < totalClassesPerDay) {
        const dayOfWeek = currentDate.getDay();

        if (dayOfWeek === targetDayNumber) {
          const dateStr = currentDate.toISOString().split('T')[0];

          if (availableDates.length === 0 || availableDates.some(d => (d.date || d) === dateStr)) {
            dates.push(dateStr);
          } else {
            console.warn(`Fecha ${dateStr} no disponible en calendario, saltando...`);
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);

        if (dates.length < totalClassesPerDay &&
          currentDate > new Date(startDate).setMonth(new Date(startDate).getMonth() + durationMonths + 1)) {
          console.error(`No se pudieron generar todas las fechas para ${schedule.dayOfWeek}`);
          break;
        }
      }

      allDates.push(...dates);
    });

    // Ordenar todas las fechas
    allDates.sort();

    console.log(`✅ Generadas ${allDates.length} fechas de clases:`, allDates);
    setClassDates(allDates);
  };

  useEffect(() => {
    if (currentStep > 1 || technique) {
      saveDraft({
        currentStep,
        technique,
        frequency,
        selectedSchedules,
        durationMonths,
        classDates,
        studentData,
        paymentMethod
      });
    }
  }, [currentStep, technique, frequency, selectedSchedules, durationMonths, classDates, studentData, paymentMethod]);

  const handleClose = () => {
    clearDraft();
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar el formulario?')) {
      clearDraft();
      setCurrentStep(1);
      setTechnique(null);
      setFrequency(null);
      setSelectedSchedules([]);
      setDurationMonths(null);
      setClassDates([]);
      setAvailableDates([]);
      setIsCalendarValid(true);
      setStudentData({ firstName: '', lastName: '', email: '', phone: '' });
      setPaymentMethod(null);
    }
  };

  const handleEditStep = (step) => {
    setCurrentStep(step);
  };

  // Manejar cambio de técnica con reseteo de pasos posteriores
  const handleTechniqueChange = (newTechnique) => {
    // Si la técnica cambió, resetear todos los pasos posteriores
    if (technique && technique.id !== newTechnique?.id) {
      console.log('🔄 Técnica cambió, reseteando pasos posteriores...');

      // Resetear todos los estados de pasos posteriores
      setFrequency(null);
      setSelectedSchedules([]);
      setDurationMonths(null);
      setClassDates([]);
      setAvailableDates([]);
      setIsCalendarValid(true);

      // Si no estamos en el paso 1, volver al paso 2
      if (currentStep > 2) {
        console.log('↩️ Volviendo al paso 2 después de cambiar técnica');
        setCurrentStep(2);
      }
    }
    setTechnique(newTechnique);
  };

  // Manejar cambio de frecuencia con reseteo de horarios
  const handleFrequencyChange = (newFrequency) => {
    // Si la frecuencia cambió, resetear horarios y pasos posteriores
    if (frequency && frequency !== newFrequency) {
      console.log('🔄 Frecuencia cambió, reseteando horarios...');

      setSelectedSchedules([]);
      setDurationMonths(null);
      setClassDates([]);

      // Si no estamos en el paso 2, volver al paso 3
      if (currentStep > 3) {
        console.log('↩️ Volviendo al paso 3 después de cambiar frecuencia');
        setCurrentStep(3);
      }
    }
    setFrequency(newFrequency);
  };

  // Manejar cambio de horarios con reseteo de duración
  const handleSchedulesChange = (newSchedules) => {
    // Si los horarios cambiaron significativamente, resetear duración y fechas
    const hasChanges = JSON.stringify(selectedSchedules) !== JSON.stringify(newSchedules);
    if (hasChanges && durationMonths && selectedSchedules.length > 0) {
      console.log('🔄 Horarios cambiaron, reseteando duración y fechas...');

      setDurationMonths(null);
      setClassDates([]);

      // Si no estamos en el paso 3, volver al paso 4
      if (currentStep > 4) {
        console.log('↩️ Volviendo al paso 4 después de cambiar horarios');
        setCurrentStep(4);
      }
    }
    setSelectedSchedules(newSchedules);
  };

  const handleEnrollmentComplete = async () => {
    const priceInfo = calculateFinalPrice();

    // Extraer días y horarios de selectedSchedules
    const days = selectedSchedules.map(s => s.dayOfWeek);
    const timeSlots = selectedSchedules.map(s => s.timeSlot);
    const sectionIds = selectedSchedules.map(s => s.sectionId).filter(id => id);

    const enrollmentPayload = {
      name: `${studentData.firstName} ${studentData.lastName}`,
      email: studentData.email,
      phone: studentData.phone,
      technique: technique?.id,
      frequency: frequency,
      days: days,
      schedules: selectedSchedules,
      section_ids: sectionIds,
      instalments_number: durationMonths,
      duration_months: durationMonths,
      total_tuition_fee: priceInfo.finalPrice,
      monthly_price: priceInfo.monthlyPrice,
      discount_percent: priceInfo.discountPercent,
      class_dates: classDates,
      total_classes: classDates.length,
      payment_method: paymentMethod,
      total_price: priceInfo.finalPrice
    };

    try {
      console.log('📤 Enviando inscripción:', enrollmentPayload);
      const result = await createEnrollment(enrollmentPayload);

      if (result.transbank_payment && result.transbank_payment.full_url) {
        clearDraft();
        window.location.href = result.transbank_payment.full_url;
        return;
      }

      const successData = {
        technique,
        frequency,
        selectedSchedules,
        durationMonths,
        classDates,
        priceInfo,
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
    <div className="prof-enrollment-wrapper">
      <div className="prof-enrollment-container">
        <div className="prof-header-controls">
          <button className="prof-header-btn" onClick={handleReset} title="Reiniciar formulario">
            ↻
          </button>
          <button className="prof-header-btn" onClick={handleClose}>×</button>
        </div>

        <div className="prof-enrollment-content">
          {/* Paso 1: Selección de técnica */}
          {currentStep === 1 && (
            <SimplifiedTechniqueSelector
              selectedTechnique={technique}
              onSelectTechnique={handleTechniqueChange}
              onContinue={() => setCurrentStep(2)}
            />
          )}

          {/* Paso 2: Frecuencia */}
          {currentStep === 2 && (
            <SimplifiedPlanConfigurator
              frequency={frequency}
              selectedDays={[]}
              onFrequencyChange={handleFrequencyChange}
              onDaysChange={() => {}}
              onContinue={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {/* Paso 3: Múltiples fechas y horarios */}
          {currentStep === 3 && (
            <MultiDayScheduleSelector
              technique={technique}
              frequency={frequency}
              selectedSchedules={selectedSchedules}
              onSchedulesChange={handleSchedulesChange}
              onAvailableDatesChange={setAvailableDates}
              onContinue={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {/* Paso 4: Duración con ofertas */}
          {currentStep === 4 && (
            <DurationSelector
              selectedDuration={durationMonths}
              onDurationChange={setDurationMonths}
              frequency={frequency}
              monthlyPrice={calculateMonthlyPrice()}
              onContinue={() => {
                generateClassDates();
                setCurrentStep(5);
              }}
              onBack={() => setCurrentStep(3)}
            />
          )}

          {/* Paso 5: Calendario resumen editable */}
          {currentStep === 5 && (
            <EditableScheduleCalendar
              technique={technique}
              frequency={frequency}
              selectedSchedules={selectedSchedules}
              durationMonths={durationMonths}
              classDates={classDates}
              availableDates={availableDates}
              onClassDatesChange={setClassDates}
              onValidationChange={setIsCalendarValid}
              onContinue={() => setCurrentStep(6)}
              onBack={() => setCurrentStep(4)}
              onEditStep={handleEditStep}
            />
          )}

          {/* Paso 6: Datos personales y pago */}
          {currentStep === 6 && (
            <SimplifiedDataPayment
              studentData={studentData}
              onStudentDataChange={setStudentData}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onComplete={handleEnrollmentComplete}
              onBack={() => setCurrentStep(5)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalEnrollmentForm;
