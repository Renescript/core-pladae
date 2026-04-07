import { useState, useEffect, useRef } from 'react';
import { createEnrollment, getPaymentPeriods } from '../../services/api';
import TechniqueSelector from './TechniqueSelector';
import SimplifiedPlanConfigurator from './SimplifiedPlanConfigurator';
import MultiDayScheduleSelector from './MultiDayScheduleSelector';
import DurationSelector from './DurationSelector';
import EditableScheduleCalendar from './EditableScheduleCalendar';
import AddAnotherCoursePrompt from './AddAnotherCoursePrompt';
import SimplifiedDataPayment from './SimplifiedDataPayment';
import EnrollmentProgress from './EnrollmentProgress';
import CartSummary from './CartSummary';
import './enrollment-global.css';

const STORAGE_KEY = 'professional_enrollment_draft';

const saveDraft = (data) => {
  try {
    const safeDraft = {
      currentStep: data.currentStep,
      technique: data.technique,
      frequency: data.frequency,
      weeklyPlan: data.weeklyPlan, // Guardar el plan semanal completo
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
  const saveTimeoutRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(savedDraft?.currentStep || 1);
  const [technique, setTechnique] = useState(savedDraft?.technique || null);
  const [frequency, setFrequency] = useState(savedDraft?.frequency || null);
  const [weeklyPlan, setWeeklyPlan] = useState(savedDraft?.weeklyPlan || null); // Guardar el plan semanal completo
  const [selectedSchedules, setSelectedSchedules] = useState(savedDraft?.selectedSchedules || []);
  const [durationMonths, setDurationMonths] = useState(savedDraft?.durationMonths || null);
  const [classDates, setClassDates] = useState(savedDraft?.classDates || []);
  const [availableDates, setAvailableDates] = useState([]);
  const [isCalendarValid, setIsCalendarValid] = useState(true);
  const [paymentPeriods, setPaymentPeriods] = useState([]);
  const [studentData, setStudentData] = useState(savedDraft?.studentData || {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState(savedDraft?.paymentMethod || null);

  // Estado para manejar múltiples enrollments
  const [completedEnrollments, setCompletedEnrollments] = useState([]);

  // Cargar períodos de pago al montar el componente
  useEffect(() => {
    const loadPaymentPeriods = async () => {
      try {
        const periods = await getPaymentPeriods();
        setPaymentPeriods(periods);
      } catch (error) {
        console.error('Error al cargar períodos de pago:', error);
      }
    };
    loadPaymentPeriods();
  }, []);

  // Detectar si algún horario seleccionado cae en sábado
  const hasSaturdaySchedule = selectedSchedules.some(s => s?.dayOfWeek === 'saturday');

  // Funciones de cálculo de precios
  const calculateMonthlyPrice = () => {
    if (weeklyPlan?.price) {
      // Si hay horario de sábado y el plan tiene precio de sábado, usarlo
      if (hasSaturdaySchedule && weeklyPlan.saturday_price) {
        return weeklyPlan.saturday_price;
      }
      return weeklyPlan.price;
    }

    // Fallback: calcular desde técnica si no hay weekly_plan
    let pricePerClass = 7000;
    if (technique?.price_per_class) {
      pricePerClass = technique.price_per_class;
    }
    const classesPerMonth = frequency * 4;
    return pricePerClass * classesPerMonth;
  };

  const getDiscountPercentage = (months) => {
    // Buscar el descuento en los períodos de pago cargados desde la API
    const period = paymentPeriods.find(p => p.months === months);
    return period ? period.discount_percentage : 0;
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
    if (!durationMonths) return 0;

    // Si es clase de prueba, usar number_of_classes del plan
    if (weeklyPlan?.number_of_classes && weeklyPlan.weekly_classes === 1 && weeklyPlan.number_of_classes === 1) {
      console.log('🎨 Clase de prueba detectada, total: 1 clase');
      return 1;
    }

    // Para planes regulares, usar number_of_classes * durationMonths
    if (weeklyPlan?.number_of_classes) {
      const total = weeklyPlan.number_of_classes * durationMonths;
      console.log(`📊 Plan regular: ${weeklyPlan.number_of_classes} clases/mes × ${durationMonths} meses = ${total} clases`);
      return total;
    }

    // Fallback
    if (!frequency) return 0;
    return frequency * 4 * durationMonths;
  };

  // Función para generar fechas de clases
  const generateClassDates = () => {
    if (!selectedSchedules || selectedSchedules.length === 0 || !durationMonths) {
      console.error('Faltan datos para generar fechas de clases');
      return;
    }

    // Calcular total de clases usando el plan semanal
    const totalClasses = calculateTotalClasses();
    console.log(`📅 Generando ${totalClasses} fechas de clase`);

    // Calcular cuántas clases por día (distribuir equitativamente entre los días seleccionados)
    const totalClassesPerDay = Math.ceil(totalClasses / selectedSchedules.length);
    console.log(`📅 ${totalClassesPerDay} clases por día de la semana`);

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

  // Guardar draft con debounce para evitar escrituras frecuentes
  useEffect(() => {
    if (currentStep > 1 || technique) {
      // Cancelar el timeout anterior
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Guardar después de 500ms de inactividad
      saveTimeoutRef.current = setTimeout(() => {
        saveDraft({
          currentStep,
          technique,
          frequency,
          weeklyPlan,
          selectedSchedules,
          durationMonths,
          classDates,
          studentData,
          paymentMethod
        });
      }, 500);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentStep, technique, frequency, weeklyPlan, selectedSchedules, durationMonths, classDates, studentData, paymentMethod]);

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
      setWeeklyPlan(null);
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
      setWeeklyPlan(null); // También resetear el plan semanal
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

      // NO resetear weeklyPlan aquí porque handlePlanSelect llama a esta función
      // y no queremos perder el plan que acabamos de setear
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

  // Manejar selección de plan semanal completo
  const handlePlanSelect = (plan) => {
    console.log('📋 ========== handlePlanSelect llamado ==========');
    console.log('📋 Plan completo recibido:', JSON.stringify(plan, null, 2));
    console.log('📋 Plan.price:', plan?.price);
    console.log('📋 Plan.weekly_classes:', plan?.weekly_classes);
    setWeeklyPlan(plan);
    console.log('✅ weeklyPlan actualizado');
    // También actualizar la frecuencia para mantener compatibilidad
    handleFrequencyChange(plan.weekly_classes);
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

  // Crear el objeto de enrollment del curso actual
  const buildCurrentEnrollment = () => {
    // Extraer section_ids únicos de los horarios seleccionados
    const sectionIds = selectedSchedules
      .map(s => s.sectionId)
      .filter(id => id != null);

    // Agrupar fechas por section_id
    const sectionDates = {};

    selectedSchedules.forEach(schedule => {
      const sectionId = schedule.sectionId;
      if (!sectionId) return;

      // Filtrar fechas que corresponden a este día de la semana
      const dayMap = {
        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
        'thursday': 4, 'friday': 5, 'saturday': 6
      };
      const targetDay = dayMap[schedule.dayOfWeek];

      const datesForThisSection = classDates.filter(dateStr => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.getDay() === targetDay;
      });

      sectionDates[sectionId] = datesForThisSection;
    });

    // Obtener la primera fecha de inicio
    const startDate = classDates.length > 0 ? classDates[0] : null;

    // Buscar el payment_period_id según durationMonths
    const paymentPeriod = paymentPeriods.find(p => p.months === durationMonths);

    return {
      name: `${studentData.firstName} ${studentData.lastName}`,
      email: studentData.email,
      phone: studentData.phone,
      weekly_plan_id: weeklyPlan?.id,
      payment_method_id: paymentMethod,
      payment_period_id: paymentPeriod?.id || null,
      start_date: startDate,
      section_ids: sectionIds,
      section_dates: sectionDates
    };
  };

  // Manejar cuando el usuario quiere agregar otro curso
  const handleAddAnotherCourse = () => {
    // Extraer section_ids únicos de los horarios seleccionados
    const sectionIds = selectedSchedules
      .map(s => s.sectionId)
      .filter(id => id != null);

    // Agrupar fechas por section_id
    const sectionDates = {};

    selectedSchedules.forEach(schedule => {
      const sectionId = schedule.sectionId;
      if (!sectionId) return;

      // Filtrar fechas que corresponden a este día de la semana
      const dayMap = {
        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
        'thursday': 4, 'friday': 5, 'saturday': 6
      };
      const targetDay = dayMap[schedule.dayOfWeek];

      const datesForThisSection = classDates.filter(dateStr => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.getDay() === targetDay;
      });

      sectionDates[sectionId] = datesForThisSection;
    });

    // Obtener la primera fecha de inicio
    const startDate = classDates.length > 0 ? classDates[0] : null;

    // Buscar el payment_period_id según durationMonths
    const paymentPeriod = paymentPeriods.find(p => p.months === durationMonths);

    // Calcular el precio de este curso
    const priceInfo = calculateFinalPrice();

    // Guardar solo los datos del curso (sin name, email, phone, payment_method_id)
    // Esos se agregarán al final cuando se complete el formulario
    const enrollmentWithDetails = {
      weekly_plan_id: weeklyPlan?.id,
      payment_period_id: paymentPeriod?.id || null,
      start_date: startDate,
      section_ids: sectionIds,
      section_dates: sectionDates,
      _displayInfo: {
        technique: technique?.name,
        frequency,
        isTrialClass: weeklyPlan?.weekly_classes === 1 && weeklyPlan?.number_of_classes === 1,
        durationMonths,
        totalClasses: classDates.length,
        schedules: selectedSchedules,
        priceInfo: {
          monthlyPrice: priceInfo.monthlyPrice,
          subtotal: priceInfo.subtotal,
          discountPercent: priceInfo.discountPercent,
          discountAmount: priceInfo.discountAmount,
          finalPrice: priceInfo.finalPrice
        }
      }
    };

    setCompletedEnrollments([...completedEnrollments, enrollmentWithDetails]);

    // Reset del flujo para agregar otro curso
    setTechnique(null);
    setFrequency(null);
    setWeeklyPlan(null);
    setSelectedSchedules([]);
    setDurationMonths(null);
    setClassDates([]);
    setAvailableDates([]);
    setIsCalendarValid(true);

    // Volver al paso 1
    setCurrentStep(1);
  };

  // Manejar cuando el usuario continúa sin agregar más cursos
  const handleContinueToPayment = () => {
    setCurrentStep(7); // Ir al paso de datos y pago
  };

  // Enviar todos los enrollments al backend
  const handleEnrollmentComplete = async () => {
    // Construir el enrollment actual
    const currentEnrollment = buildCurrentEnrollment();

    // Datos comunes para todos los enrollments (nombre, email, teléfono, método de pago)
    const commonData = {
      name: `${studentData.firstName} ${studentData.lastName}`,
      email: studentData.email,
      phone: studentData.phone,
      payment_method_id: paymentMethod
    };

    // Completar todos los enrollments con los datos comunes
    const allEnrollments = [
      // Enrollments completados anteriormente
      ...completedEnrollments.map(enrollment => ({
        ...commonData,
        weekly_plan_id: enrollment.weekly_plan_id,
        payment_period_id: enrollment.payment_period_id,
        start_date: enrollment.start_date,
        section_ids: enrollment.section_ids,
        section_dates: enrollment.section_dates
      })),
      // Enrollment actual (ya tiene todos los datos)
      currentEnrollment
    ];

    const payload = {
      enrollments: allEnrollments
    };

    try {
      console.log('📤 ========== PAYLOAD COMPLETO ==========');
      console.log('📤 Enviando enrollments:', payload);
      console.log('📤 JSON stringificado:');
      console.log(JSON.stringify(payload, null, 2));
      console.log('📤 ======================================');

      const result = await createEnrollment(payload);

      if (result.transbank_payment && result.transbank_payment.full_url) {
        clearDraft();
        window.location.href = result.transbank_payment.full_url;
        return;
      }

      const successData = {
        enrollments: allEnrollments,
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
      <div className="enrollment-wrapper">
        <div className="enrollment-body">
        <div className="enrollment-form-col">
          <div className="enrollment-header">
            <img src="/logo-gustarte-letras.png" alt="Gustarte" className="enrollment-logo" />
          </div>
          {completedEnrollments.length > 0 && currentStep <= 5 && (
            <div className="enrollment-course-indicator">
              <span className="course-indicator-badge">Curso {completedEnrollments.length + 1}</span>
              <span className="course-indicator-text">
                Ya tienes <strong>{completedEnrollments.map(e => e._displayInfo?.technique).join(', ')}</strong> — ahora elige tu siguiente curso
              </span>
            </div>
          )}
          {/* Paso 1: Selección de técnica */}
          {currentStep === 1 && (
            <TechniqueSelector
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
              onPlanSelect={handlePlanSelect}
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
              onContinue={() => {
                const isTrial = weeklyPlan?.weekly_classes === 1 && weeklyPlan?.number_of_classes === 1;
                if (isTrial) {
                  setDurationMonths(1);
                  // generateClassDates usa durationMonths del state, pero aún no se actualizó,
                  // así que generamos las fechas inline
                  const totalClasses = 1;
                  const dayMap = { 'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6 };
                  const allDates = [];
                  selectedSchedules.forEach(schedule => {
                    const startDate = schedule.date;
                    const targetDayNumber = dayMap[schedule.dayOfWeek];
                    let currentDate = new Date(startDate + 'T00:00:00');
                    let count = 0;
                    while (count < totalClasses) {
                      if (currentDate.getDay() === targetDayNumber) {
                        allDates.push(currentDate.toISOString().split('T')[0]);
                        count++;
                      }
                      currentDate.setDate(currentDate.getDate() + 1);
                    }
                  });
                  allDates.sort();
                  setClassDates(allDates);
                  setCurrentStep(6);
                } else {
                  setCurrentStep(4);
                }
              }}
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
              weeklyPlan={weeklyPlan}
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
              weeklyPlan={weeklyPlan}
              paymentPeriods={paymentPeriods}
              selectedSchedules={selectedSchedules}
              durationMonths={durationMonths}
              classDates={classDates}
              availableDates={availableDates}
              onClassDatesChange={setClassDates}
              onValidationChange={setIsCalendarValid}
              onContinue={() => {
                // Si ya hay 1 curso completado (segundo curso), ir directo al pago
                if (completedEnrollments.length >= 1) {
                  setCurrentStep(7);
                } else {
                  setCurrentStep(6);
                }
              }}
              onBack={() => setCurrentStep(4)}
              onEditStep={handleEditStep}
            />
          )}

          {/* Paso 6: ¿Agregar otro curso? */}
          {currentStep === 6 && (
            <AddAnotherCoursePrompt
              completedEnrollments={completedEnrollments}
              currentCourse={{
                technique: technique?.name,
                frequency,
                isTrialClass: weeklyPlan?.weekly_classes === 1 && weeklyPlan?.number_of_classes === 1,
                durationMonths,
                selectedSchedules,
                priceInfo: calculateFinalPrice(),
                totalClasses: classDates.length
              }}
              onAddAnother={handleAddAnotherCourse}
              onContinue={handleContinueToPayment}
              onBack={() => {
                const isTrial = weeklyPlan?.weekly_classes === 1 && weeklyPlan?.number_of_classes === 1;
                setCurrentStep(isTrial ? 3 : 5);
              }}
            />
          )}

          {/* Paso 7: Datos personales y pago */}
          {currentStep === 7 && (
            <SimplifiedDataPayment
              studentData={studentData}
              onStudentDataChange={setStudentData}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              completedEnrollments={completedEnrollments}
              currentEnrollment={{
                technique: technique?.name,
                frequency,
                durationMonths,
                totalClasses: classDates.length,
                schedules: selectedSchedules,
                priceInfo: calculateFinalPrice()
              }}
              onComplete={handleEnrollmentComplete}
              onBack={() => setCurrentStep(6)}
            />
          )}
        </div>

        <div className="enrollment-sidebar">
          <CartSummary
            technique={technique}
            weeklyPlan={weeklyPlan}
            frequency={frequency}
            selectedSchedules={selectedSchedules}
            durationMonths={durationMonths}
            classDates={classDates}
            priceInfo={calculateFinalPrice()}
            completedEnrollments={completedEnrollments}
            embedded
          />
        </div>
        </div>
      </div>
  );
};

export default ProfessionalEnrollmentForm;
