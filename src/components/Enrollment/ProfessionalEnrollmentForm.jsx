import { useState, useEffect, useRef } from 'react';
import { createEnrollment, getPaymentPeriods, getPreviewClassDates, getRenewal, getCoursesSchedulesGrid, getWeeklyPlans, getAccount, logoutAccount } from '../../services/api';
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
      // classSectionIds va alineado por índice con classDates: si se pierde,
      // el payload no sabe a qué sección pertenece cada fecha.
      classSectionIds: data.classSectionIds,
      originalClassDates: data.originalClassDates,
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

// "2026-10-28" -> "28/10" (sin pasar por Date para no correr el día por zona horaria).
const formatRenewalDate = (iso) => {
  const [, month, day] = String(iso).split('-');
  return `${day}/${month}`;
};

const ProfessionalEnrollmentForm = ({ onClose, onSuccess, renewalToken = null, initialCourseId = null }) => {
  // Con link de renovación o de taller se parte de cero (el borrador de otra visita no aplica).
  const savedDraft = renewalToken || initialCourseId ? null : loadDraft();
  const saveTimeoutRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(savedDraft?.currentStep || 1);
  const [technique, setTechnique] = useState(savedDraft?.technique || null);
  const [frequency, setFrequency] = useState(savedDraft?.frequency || null);
  const [weeklyPlan, setWeeklyPlan] = useState(savedDraft?.weeklyPlan || null); // Guardar el plan semanal completo
  const [selectedSchedules, setSelectedSchedules] = useState(savedDraft?.selectedSchedules || []);
  const [durationMonths, setDurationMonths] = useState(savedDraft?.durationMonths || null);
  const [classDates, setClassDates] = useState(savedDraft?.classDates || []);
  // Sección de cada clase, alineada por índice con classDates. Es lo que define
  // el section_dates del payload (antes se deducía por día de la semana, que se
  // desincronizaba de las fechas reales).
  const [classSectionIds, setClassSectionIds] = useState(savedDraft?.classSectionIds || []);
  const [originalClassDates, setOriginalClassDates] = useState(savedDraft?.originalClassDates || []);
  const [availableDates, setAvailableDates] = useState(savedDraft?.availableDates || []);
  // Fechas que el back saltó por falta de cupos (informativo para la alumna).
  const [skippedDates, setSkippedDates] = useState([]);
  const [generatingDates, setGeneratingDates] = useState(false);
  const [datesError, setDatesError] = useState(null);
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

  // Renovación (?renovar=TOKEN): se prellena con la última compra de la alumna y
  // se parte en el paso de duración. renewal = datos del back; renewalNotice = aviso.
  const [renewal, setRenewal] = useState(null);
  const [renewalLoading, setRenewalLoading] = useState(Boolean(renewalToken));
  const [renewalNotice, setRenewalNotice] = useState(null);

  useEffect(() => {
    if (!renewalToken) return;
    let cancelled = false;

    const loadRenewal = async () => {
      try {
        clearDraft();
        const [data, courses, plans] = await Promise.all([
          getRenewal(renewalToken),
          getCoursesSchedulesGrid(),
          getWeeklyPlans()
        ]);
        if (cancelled) return;

        // El link solo trae el nombre; correo y teléfono vienen enmascarados y
        // ella los escribe (así un link reenviado no expone sus datos).
        setStudentData({
          firstName: data.student.first_name || '',
          lastName: data.student.last_name || '',
          email: '',
          phone: ''
        });

        const course = courses.find(c => c.id === data.course_id);
        const plan = plans.find(p => p.id === data.weekly_plan_id);
        if (!course || !plan || data.course_active === false) {
          setRenewalNotice(`Tu curso ${data.course_title} no tiene inscripciones abiertas por ahora. Ya cargamos tus datos: elige otro curso o escríbenos por WhatsApp.`);
          return;
        }

        setTechnique(course);
        setWeeklyPlan(plan);
        setFrequency(plan.weekly_classes);
        setSelectedSchedules(data.sections.map((section, index) => ({
          dayIndex: index,
          date: section.next_date,
          timeSlot: section.time_slot,
          dayOfWeek: section.day,
          sectionId: section.section_id,
          teacher: section.teacher
        })));
        setRenewal(data);
        setCurrentStep(4);
      } catch (error) {
        if (!cancelled) setRenewalNotice(`${error.message} Puedes inscribirte desde aquí.`);
      } finally {
        if (!cancelled) setRenewalLoading(false);
      }
    };

    loadRenewal();
    return () => { cancelled = true; };
  }, [renewalToken]);

  // Sesión iniciada en Mi cuenta: los datos del alumno vienen puestos (se pueden
  // cambiar). Sin sesión se inscribe igual que siempre; la cuenta se crea al pagar.
  const [accountUser, setAccountUser] = useState(null);
  useEffect(() => {
    if (renewalToken) return;
    let cancelled = false;
    getAccount()
      .then((acc) => {
        if (cancelled || !acc.signed_in) return;
        const u = acc.user;
        setAccountUser(u);
        setStudentData((prev) => ({
          ...prev,
          firstName: prev.firstName || u.first_name || '',
          lastName: prev.lastName || u.last_name || '',
          email: prev.email || u.email || '',
          phone: prev.phone || u.phone || ''
        }));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [renewalToken]);

  const handleAccountLogout = async () => {
    try { await logoutAccount(); } catch { /* igual se limpia */ }
    setAccountUser(null);
    setStudentData((prev) => ({ ...prev, firstName: '', lastName: '', email: '', phone: '' }));
  };

  // Link con ?curso=<id>: parte con ese taller elegido, en el paso de frecuencia.
  useEffect(() => {
    if (!initialCourseId || renewalToken) return;
    let cancelled = false;
    clearDraft();
    getCoursesSchedulesGrid()
      .then((courses) => {
        const course = courses.find(c => c.id === initialCourseId);
        if (cancelled || !course) return;
        setTechnique(course);
        setCurrentStep(2);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [initialCourseId, renewalToken]);

  // Cargar períodos de pago al montar el componente
  useEffect(() => {
    const saturday = selectedSchedules.some(s => s?.dayOfWeek === 'saturday');
    const loadPaymentPeriods = async () => {
      try {
        // Trae el precio ya calculado por el back (por cantidad de clases) para este plan.
        const periods = await getPaymentPeriods(weeklyPlan?.id || null, saturday);
        setPaymentPeriods(periods);
      } catch (error) {
        console.error('Error al cargar períodos de pago:', error);
      }
    };
    loadPaymentPeriods();
  }, [weeklyPlan?.id, selectedSchedules]);

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
    // El descuento (por cantidad de clases) viene calculado desde el back en pricing.
    const period = paymentPeriods.find(p => p.months === months);
    return period?.pricing?.discount_percentage ?? 0;
  };

  const calculateFinalPrice = () => {
    if (!durationMonths || !frequency) return { subtotal: 0, discountPercent: 0, discountAmount: 0, finalPrice: 0, monthlyPrice: 0 };

    const monthlyPrice = calculateMonthlyPrice();
    const period = paymentPeriods.find(p => p.months === durationMonths);
    const pricing = period?.pricing;

    // Fuente de verdad = precio del back (mismo que se cobra). Fallback local si aún no carga.
    const subtotal = pricing?.subtotal ?? monthlyPrice * durationMonths;
    const finalPrice = pricing?.total ?? subtotal;
    const discountPercent = pricing?.discount_percentage ?? getDiscountPercentage(durationMonths);
    const discountAmount = pricing?.discount_amount ?? (subtotal - finalPrice);

    return { subtotal, discountPercent, discountAmount, finalPrice, monthlyPrice };
  };

  // Clase de prueba / evento: planes de 1 sola clase, no siguen la regla de 4 clases por mes.
  const isTrialPlan = () =>
    weeklyPlan?.weekly_classes === 1 && weeklyPlan?.number_of_classes === 1;

  // Cantidad de clases del plan. Es la MISMA cuenta que usa el back para cobrar
  // (plan × meses), así que es la que tiene que cuadrar con las fechas enviadas.
  const calculateTotalClasses = (months = durationMonths) => {
    if (!months) return 0;

    // Si es clase de prueba, usar number_of_classes del plan
    if (weeklyPlan?.number_of_classes && isTrialPlan()) {
      console.log('🎨 Clase de prueba detectada, total: 1 clase');
      return 1;
    }

    // Para planes regulares, usar number_of_classes * meses
    if (weeklyPlan?.number_of_classes) {
      const total = weeklyPlan.number_of_classes * months;
      console.log(`📊 Plan regular: ${weeklyPlan.number_of_classes} clases/mes × ${months} meses = ${total} clases`);
      return total;
    }

    // Fallback
    if (!frequency) return 0;
    return frequency * 4 * months;
  };

  // Pide al BACK las fechas de clase de cada sección elegida.
  //
  // Antes esto se calculaba acá en el front recorriendo el calendario que traía el
  // paso 3, que sólo cubre 3 meses: un plan de 4 meses viajaba con 13 fechas en vez
  // de 16, el back cobraba por 16 y después no podía crear la matrícula. Ahora manda
  // el back (mismo cálculo que usa al matricular: día de la sección y salto de las
  // fechas sin cupo), así que lo que ve la alumna es lo que se crea.
  //
  // Devuelve true sólo si las fechas cuadran con el plan; si no, deja el error a la vista.
  const generateClassDates = async (months = durationMonths) => {
    if (!selectedSchedules || selectedSchedules.length === 0 || !months || !weeklyPlan?.id) {
      console.error('Faltan datos para generar fechas de clases');
      setDatesError('Faltan datos para armar tu calendario. Revisa el curso, el horario y la duración.');
      return false;
    }

    const totalClasses = calculateTotalClasses(months);
    console.log(`📅 Pidiendo al back ${totalClasses} fechas de clase`);

    setGeneratingDates(true);
    setDatesError(null);

    try {
      // Las clases de prueba/eventos son de 1 clase: no llevan months (el back
      // usaría meses × 4 y devolvería 4 fechas para un plan de una sola clase).
      const monthsParam = isTrialPlan() ? undefined : months;

      const perSection = await Promise.all(
        selectedSchedules.map(async schedule => {
          const { assigned, skipped } = await getPreviewClassDates(
            schedule.sectionId,
            schedule.date,
            weeklyPlan.id,
            monthsParam,
            renewal ? renewalToken : null
          );
          return { sectionId: schedule.sectionId, assigned, skipped };
        })
      );

      // Pares (fecha, sección) ordenados por fecha. Los dos arreglos quedan
      // alineados por índice: reprogramar una clase reemplaza sólo su fecha.
      const pairs = perSection
        .flatMap(({ sectionId, assigned }) => assigned.map(date => ({ date, sectionId })))
        .sort((a, b) => a.date.localeCompare(b.date));

      if (pairs.length !== totalClasses) {
        throw new Error(
          `El calendario devolvió ${pairs.length} fechas y tu plan es de ${totalClasses} clases. ` +
          'No podemos continuar hasta que cuadren.'
        );
      }

      const dates = pairs.map(p => p.date);
      console.log(`✅ ${dates.length} fechas de clase:`, dates);

      setClassDates(dates);
      setClassSectionIds(pairs.map(p => p.sectionId));
      setOriginalClassDates(dates);
      setSkippedDates(perSection.flatMap(s => s.skipped));
      return true;
    } catch (error) {
      console.error('❌ Error al obtener las fechas de clase:', error);
      resetGeneratedDates();
      setClassSectionIds([]);
      setOriginalClassDates([]);
      setSkippedDates([]);
      setDatesError(
        `No pudimos armar tu calendario: ${error.message} ` +
        'Escríbenos al WhatsApp +56 9 2371 8373 y lo resolvemos.'
      );
      return false;
    } finally {
      setGeneratingDates(false);
    }
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
          classSectionIds,
          originalClassDates,
          availableDates,
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
  }, [currentStep, technique, frequency, weeklyPlan, selectedSchedules, durationMonths, classDates, classSectionIds, studentData, paymentMethod]);

  // Botar el calendario generado. Va todo junto a propósito: classDates y
  // classSectionIds tienen que ir siempre alineados.
  const resetGeneratedDates = () => {
    setClassDates([]);
    setClassSectionIds([]);
    setOriginalClassDates([]);
    setSkippedDates([]);
    setDatesError(null);
  };

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
      resetGeneratedDates();
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
      resetGeneratedDates();
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
      resetGeneratedDates();

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
      resetGeneratedDates();

      // Si no estamos en el paso 3, volver al paso 4
      if (currentStep > 4) {
        console.log('↩️ Volviendo al paso 4 después de cambiar horarios');
        setCurrentStep(4);
      }
    }
    setSelectedSchedules(newSchedules);
  };

  // Secciones y fechas tal como las espera el back: section_ids (sin repetir, porque
  // el back suma las fechas por cada id de la lista) y section_dates agrupadas según
  // la sección de cada clase (classSectionIds), no según su día de la semana.
  const buildSectionPayload = () => {
    const sectionIds = [
      ...new Set(selectedSchedules.map(s => s.sectionId).filter(id => id != null))
    ];

    const sectionDates = {};
    sectionIds.forEach(id => { sectionDates[id] = []; });

    classDates.forEach((date, index) => {
      const sectionId = classSectionIds[index];
      if (sectionId == null) return;
      if (!sectionDates[sectionId]) sectionDates[sectionId] = [];
      sectionDates[sectionId].push(date);
    });

    return {
      sectionIds,
      sectionDates,
      startDate: classDates.length > 0 ? classDates[0] : null,
      paymentPeriod: paymentPeriods.find(p => p.months === durationMonths)
    };
  };

  // Crear el objeto de enrollment del curso actual
  const buildCurrentEnrollment = () => {
    const { sectionIds, sectionDates, startDate, paymentPeriod } = buildSectionPayload();

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
    const { sectionIds, sectionDates, startDate, paymentPeriod } = buildSectionPayload();

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
      // Para revalidar el carrito completo justo antes de pagar (las claves con _
      // son sólo del front, no viajan en el payload).
      _expectedClasses: calculateTotalClasses(),
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
    resetGeneratedDates();
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

    // CANDADO: el back cobra por plan × meses y después exige esa misma cantidad de
    // fechas para crear la matrícula. Si no cuadran, no se manda nada: preferimos una
    // venta bloqueada a una alumna cobrada y sin curso (lo que pasó el 3-ago-2026).
    const expectedClasses = calculateTotalClasses();
    const sentClasses = Object.values(currentEnrollment.section_dates || {})
      .reduce((total, dates) => total + dates.length, 0);

    const cartMismatch = completedEnrollments.find(enrollment => {
      const sent = Object.values(enrollment.section_dates || {})
        .reduce((total, dates) => total + dates.length, 0);
      return enrollment._expectedClasses && sent !== enrollment._expectedClasses;
    });

    if (sentClasses !== expectedClasses || cartMismatch) {
      console.error('⛔ Las fechas no cuadran con el plan', {
        expectedClasses, sentClasses, cartMismatch
      });
      alert(
        'No podemos continuar: las fechas de tus clases no cuadran con el plan que elegiste. ' +
        'Vuelve al paso del calendario y revísalo, o escríbenos al WhatsApp +56 9 2371 8373 ' +
        'y lo resolvemos contigo. No te vamos a cobrar hasta que esté correcto.'
      );
      return;
    }

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

    // Autorizaciones y apoderado: iguales para todo el carrito (es una sola persona).
    const consentData = {
      accepts_privacy: Boolean(studentData.acceptsPrivacy),
      image_consent: Boolean(studentData.imageConsent),
      is_minor: Boolean(studentData.isMinor),
      guardian_email: studentData.isMinor ? (studentData.guardianEmail || '').trim() : '',
      guardian_phone: studentData.isMinor ? (studentData.guardianPhone || '').trim() : ''
    };

    const payload = {
      enrollments: allEnrollments.map(enrollment => ({ ...enrollment, ...consentData }))
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
      const renewalTip = renewal && /cupo/i.test(error.message)
        ? `\n\nSi estás renovando, usa el mismo correo con que te inscribiste (${renewal.student.email_hint}): así reconocemos tu cupo guardado.`
        : '';
      alert(`Hubo un error al procesar tu inscripción: ${error.message}${renewalTip}`);
    }
  };

  return (
      <div className="enrollment-wrapper">
        <div className="enrollment-body">
        <div className="enrollment-form-col">
          <div className="enrollment-header">
            <img src="/logo-gustarte-letras.png" alt="Gustarte" className="enrollment-logo" />
          </div>
          {renewalLoading && (
            <div className="enrollment-course-indicator">
              <span className="course-indicator-text">Cargando tu renovación…</span>
            </div>
          )}
          {renewal && currentStep <= 5 && (
            <div className="enrollment-course-indicator">
              <span className="course-indicator-badge">Renovación</span>
              <span className="course-indicator-text">
                Hola {studentData.firstName}: dejamos listo tu curso <strong>{renewal.course_title}</strong> en tus mismos horarios,
                partiendo la semana siguiente a tu última clase. Tu cupo está guardado hasta el {formatRenewalDate(renewal.hold_until)}.
                Solo elige la duración.
              </span>
            </div>
          )}
          {renewalNotice && (
            <div className="enrollment-course-indicator">
              <span className="course-indicator-text">{renewalNotice}</span>
            </div>
          )}
          {completedEnrollments.length > 0 && currentStep <= 5 && (
            <div className="enrollment-course-indicator">
              <span className="course-indicator-badge">Curso {completedEnrollments.length + 1}</span>
              <span className="course-indicator-text">
                Ya tienes <strong>{completedEnrollments.map(e => e._displayInfo?.technique).join(', ')}</strong> — ahora elige tu siguiente curso
              </span>
            </div>
          )}
          {/* Paso 1: Selección de técnica */}
          {!renewalLoading && currentStep === 1 && (
            <TechniqueSelector
              selectedTechnique={technique}
              onSelectTechnique={handleTechniqueChange}
              onContinue={() => setCurrentStep(2)}
            />
          )}

          {/* Paso 2: Frecuencia */}
          {currentStep === 2 && (
            <SimplifiedPlanConfigurator
              technique={technique}
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
              onContinue={async () => {
                if (isTrialPlan()) {
                  // Clase de prueba: 1 sola clase, se salta el paso de duración.
                  // Le pasamos los meses explícitos porque el state todavía no se actualizó.
                  setDurationMonths(1);
                  const ok = await generateClassDates(1);
                  if (ok) {
                    setCurrentStep(6);
                  } else {
                    alert('No pudimos armar tu calendario. Escríbenos al WhatsApp +56 9 2371 8373 y lo resolvemos.');
                  }
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
              paymentPeriods={paymentPeriods}
              onContinue={async () => {
                // Sólo avanzamos si el back devolvió las fechas completas.
                const ok = await generateClassDates();
                if (ok) setCurrentStep(5);
              }}
              loadingDates={generatingDates}
              datesError={datesError}
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
              classSectionIds={classSectionIds}
              originalClassDates={originalClassDates}
              skippedDates={skippedDates}
              canContinue={isCalendarValid}
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
              accountUser={accountUser}
              onAccountLogout={handleAccountLogout}
              showGoogleLogin={!renewal}
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
              renewalHints={renewal ? { email: renewal.student.email_hint, phone: renewal.student.phone_hint } : null}
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
