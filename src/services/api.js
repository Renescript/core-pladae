const API_BASE_URL = 'https://decided-east-calling-threatening.trycloudflare.com/api/v1';

/**
 * Headers para datos que pueden cachearse (cursos, planes, métodos de pago)
 * Cache público de 5 minutos
 */
const CACHEABLE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=300',
};

/**
 * Headers para datos sensibles o dinámicos (inscripciones, pagos, calendarios)
 * Sin caché, siempre consultar al servidor
 */
const NO_CACHE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
};

/**
 * Timeout por defecto para las peticiones (10 segundos)
 */
const DEFAULT_TIMEOUT = 10000;

/**
 * Realiza un fetch con timeout y manejo de AbortController
 * @param {string} url - URL a consultar
 * @param {Object} options - Opciones de fetch
 * @param {number} timeout - Timeout en milisegundos (por defecto 10s)
 * @returns {Promise<Response>} Respuesta del fetch
 */
const fetchWithTimeout = async (url, options = {}, timeout = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('La petición tardó demasiado tiempo. Por favor, intenta nuevamente.');
    }
    throw error;
  }
};

/**
 * Obtiene la lista de cursos desde la API
 * @returns {Promise<Array>} Lista de cursos
 */
export const getCourses = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/courses`, {
      method: 'GET',
      headers: CACHEABLE_HEADERS
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    // La API devuelve { success: true, data: [...] }
    if (result.success) {
      return result.data;
    } else {
      throw new Error('La respuesta de la API no fue exitosa');
    }
  } catch (error) {
    console.error('Error al obtener los cursos:', error);
    throw error;
  }
};

/**
 * Datos dummy para planes de pago
 * @returns {Array} Lista de planes
 */
export const getDummyPlans = () => {
  return [
    {
      id: 1,
      plan: 'Plan Base',
      description: '1 curso, 4 sesiones mensuales',
      type: 'base',
      max_courses: 1,
      sessions_per_month: 4,
      price: 50000,
      number_of_classes: 4,
      enrollment_amount: 10000
    },
    {
      id: 2,
      plan: 'Plan Estándar',
      description: '2 cursos, 8 sesiones mensuales',
      type: 'estandar',
      max_courses: 2,
      sessions_per_month: 8,
      price: 85000,
      number_of_classes: 8,
      enrollment_amount: 15000
    },
    {
      id: 3,
      plan: 'Plan Mixto',
      description: 'Hasta 4 cursos diferentes, 16 sesiones mensuales',
      type: 'mixto',
      max_courses: 4,
      sessions_per_month: 16,
      price: 120000,
      number_of_classes: 16,
      enrollment_amount: 20000
    }
  ];
};

/**
 * Obtiene la lista de planes de pago desde la API
 * @returns {Promise<Array>} Lista de planes
 */
export const getPlans = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/payment_plans`, {
      method: 'GET',
      headers: CACHEABLE_HEADERS
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    // La API devuelve { success: true, data: [...] }
    if (result.success) {
      return result.data;
    } else {
      throw new Error('La respuesta de la API no fue exitosa');
    }
  } catch (error) {
    console.error('Error al obtener los planes desde la API:', error);
    console.warn('Usando planes dummy como fallback');
    // Fallback a datos dummy si falla la API
    return getDummyPlans();
  }
};

/**
 * Obtiene la lista de métodos de pago desde la API
 * @returns {Promise<Array>} Lista de métodos de pago
 */
export const getPaymentMethods = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/payment_methods`, {
      method: 'GET',
      headers: CACHEABLE_HEADERS
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    // La API devuelve { success: true, data: [...] }
    if (result.success) {
      return result.data;
    } else {
      throw new Error('La respuesta de la API no fue exitosa');
    }
  } catch (error) {
    console.error('Error al obtener los métodos de pago:', error);
    throw error;
  }
};

/**
 * Crea una nueva inscripción
 * @param {Object} enrollmentData - Datos de la inscripción
 * @param {string} enrollmentData.name - Nombre completo del estudiante
 * @param {string} enrollmentData.email - Email del estudiante
 * @param {Array<number>} enrollmentData.section_ids - IDs de las secciones seleccionadas
 * @param {number} enrollmentData.payment_plan_id - ID del plan de pago
 * @param {number} enrollmentData.payment_method_id - ID del método de pago
 * @param {number} enrollmentData.enrollment_amount - Monto de matrícula
 * @param {number} enrollmentData.total_tuition_fee - Arancel total
 * @param {number} enrollmentData.instalments_number - Número de cuotas
 * @returns {Promise<Object>} Respuesta de la API
 */
export const createEnrollment = async (enrollmentData) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/enrollments`, {
      method: 'POST',
      headers: NO_CACHE_HEADERS,
      body: JSON.stringify({
        enrollment: enrollmentData
      }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    console.log('enrollmentData enviado:', enrollmentData);

    const result = await response.json();

    if (result.success) {
      return result;
    } else {
      throw new Error(result.message || 'Error al crear la inscripción');
    }
  } catch (error) {
    console.error('Error al crear la inscripción:', error);
    throw error;
  }
};

/**
 * Obtiene el calendario de disponibilidad de una sección
 * El backend automáticamente devuelve los próximos 3 meses
 * @param {number} sectionId - ID de la sección
 * @returns {Promise<Array>} Array de fechas disponibles
 */
export const getSectionCalendar = async (sectionId) => {
  try {
    const url = `${API_BASE_URL}/sections/${sectionId}/calendar`;
    console.log('📅 Llamando a URL:', url);

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: NO_CACHE_HEADERS
    });

    console.log('📅 Response status:', response.status, response.ok);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    console.log('📅 ========== RESPUESTA DEL ENDPOINT ==========');
    console.log('📅 Objeto completo recibido:', JSON.stringify(result, null, 2));
    console.log('📅 ============================================');

    // El backend envuelve la respuesta en { success: true, data: { dates: [...] } }
    if (result.success && result.data && result.data.dates && Array.isArray(result.data.dates)) {
      console.log('✅ Retornando array de fechas desde result.data.dates:', result.data.dates);
      return result.data.dates;
    }

    // Fallback por si viene directamente con dates
    if (result.dates && Array.isArray(result.dates)) {
      console.log('✅ Retornando array de fechas desde result.dates:', result.dates);
      return result.dates;
    }

    console.error('❌ Formato de respuesta inesperado. result:', result);
    throw new Error('Formato de respuesta inesperado del calendario');
  } catch (error) {
    console.error('Error al obtener calendario de la sección:', error);
    throw error;
  }
};

/**
 * Obtiene vista previa de fechas de clases según plan seleccionado
 * @param {number} sectionId - ID de la sección
 * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
 * @param {number} paymentPlanId - ID del plan de pago
 * @returns {Promise<Array>} Array de fechas de clases previstas
 */
export const getPreviewClassDates = async (sectionId, startDate, paymentPlanId) => {
  try {
    const url = `${API_BASE_URL}/sections/${sectionId}/preview_class_dates?start_date=${startDate}&payment_plan_id=${paymentPlanId}`;
    console.log('📆 Obteniendo vista previa de fechas:', url);

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: NO_CACHE_HEADERS
    });

    console.log('📆 Response status:', response.status, response.ok);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();
    console.log('📆 Vista previa de fechas recibida:', result);

    // El backend devuelve { success: true, data: { assigned_dates: [...] } }
    if (result.success && result.data && result.data.assigned_dates) {
      console.log('✅ Retornando fechas asignadas:', result.data.assigned_dates);
      return result.data.assigned_dates.map(item => item.date);
    }

    // Fallback si viene directamente como array
    if (Array.isArray(result)) {
      return result;
    }

    console.error('❌ Formato inesperado de vista previa:', result);
    return [];
  } catch (error) {
    console.error('Error al obtener vista previa de fechas:', error);
    throw error;
  }
};

/**
 * Genera fechas de inicio y fin para obtener 3 meses de disponibilidad
 * @returns {Object} { fromDate, toDate } en formato YYYY-MM-DD
 */
export const getThreeMonthsRange = () => {
  const today = new Date();
  const fromDate = today.toISOString().split('T')[0];

  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  const toDate = threeMonthsLater.toISOString().split('T')[0];

  return { fromDate, toDate };
};

/**
 * Confirma un pago de Transbank
 * @param {string} tokenWs - Token de Transbank recibido en el callback
 * @returns {Promise<Object>} Resultado de la confirmación
 */
export const confirmTransbankPayment = async (tokenWs) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/transbank/callback`, {
      method: 'POST',
      headers: NO_CACHE_HEADERS,
      body: JSON.stringify({
        token_ws: tokenWs
      }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    return result;
  } catch (error) {
    console.error('Error al confirmar pago de Transbank:', error);
    throw error;
  }
};

/**
 * Datos dummy para el calendario de inscripciones
 * @returns {Array} Lista de cursos con secciones y horarios
 */
export const getDummyCalendarData = () => {
  return [
    {
      id: 1,
      name: 'Óleo',
      description: 'Curso de pintura al óleo para principiantes y avanzados',
      color: '#c0392b',
      sections: [
        {
          id: 1,
          teacher_name: 'María González',
          available_places: 8,
          places: 15,
          start_date: '2025-11-20',
          end_date: '2026-02-28',
          schedule: [
            { day: 'monday', start_time: '15:30', end_time: '17:30' },
            { day: 'tuesday', start_time: '10:00', end_time: '12:00' },
            { day: 'tuesday', start_time: '15:30', end_time: '17:30' },
            { day: 'wednesday', start_time: '10:00', end_time: '12:00' },
            { day: 'wednesday', start_time: '12:30', end_time: '14:30' },
            { day: 'wednesday', start_time: '18:30', end_time: '20:30' }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Acuarela',
      description: 'Técnicas de acuarela desde nivel básico',
      color: '#e67e22',
      sections: [
        {
          id: 2,
          teacher_name: 'Patricia López',
          available_places: 12,
          places: 15,
          start_date: '2025-11-18',
          end_date: '2026-01-31',
          schedule: [
            { day: 'monday', start_time: '10:00', end_time: '12:00' },
            { day: 'monday', start_time: '12:30', end_time: '14:30' }
          ]
        }
      ]
    },
    {
      id: 3,
      name: 'Acrílico',
      description: 'Pintura acrílica para todos los niveles',
      color: '#8e44ad',
      sections: [
        {
          id: 3,
          teacher_name: 'Fernando Torres',
          available_places: 10,
          places: 20,
          start_date: '2025-11-22',
          end_date: '2026-02-15',
          schedule: [
            { day: 'monday', start_time: '15:30', end_time: '17:30' },
            { day: 'tuesday', start_time: '10:00', end_time: '12:00' },
            { day: 'tuesday', start_time: '15:30', end_time: '17:30' },
            { day: 'wednesday', start_time: '10:00', end_time: '12:00' },
            { day: 'wednesday', start_time: '12:30', end_time: '14:30' },
            { day: 'wednesday', start_time: '18:30', end_time: '20:30' }
          ]
        }
      ]
    },
    {
      id: 4,
      name: 'Ilustración-Dibujo',
      description: 'Técnicas de ilustración y dibujo artístico',
      color: '#f1c40f',
      sections: [
        {
          id: 4,
          teacher_name: 'Laura Vega',
          available_places: 7,
          places: 15,
          start_date: '2025-11-23',
          end_date: '2026-02-22',
          schedule: [
            { day: 'monday', start_time: '10:00', end_time: '12:00' },
            { day: 'monday', start_time: '12:30', end_time: '14:30' }
          ]
        }
      ]
    },
    {
      id: 5,
      name: 'Crochet',
      description: 'Aprende técnicas de crochet y tejido',
      color: '#7f8c8d',
      sections: [
        {
          id: 5,
          teacher_name: 'Carmen Silva',
          available_places: 6,
          places: 10,
          start_date: '2025-12-01',
          end_date: '2026-03-30',
          schedule: [
            { day: 'tuesday', start_time: '18:30', end_time: '20:30' }
          ]
        }
      ]
    },
    {
      id: 6,
      name: 'Cerámica Escultura',
      description: 'Arte en cerámica y escultura',
      color: '#34495e',
      sections: [
        {
          id: 6,
          teacher_name: 'Isabel Ramírez',
          available_places: 2,
          places: 8,
          start_date: '2025-11-19',
          end_date: '2026-02-19',
          schedule: [
            { day: 'wednesday', start_time: '18:30', end_time: '20:30' }
          ]
        }
      ]
    }
  ];
};

/**
 * Mapea días en español a inglés
 */
const mapWeekdayToEnglish = (weekday) => {
  const mapping = {
    'lunes': 'monday',
    'martes': 'tuesday',
    'miércoles': 'wednesday',
    'miercoles': 'wednesday',
    'jueves': 'thursday',
    'viernes': 'friday',
    'sábado': 'saturday',
    'sabado': 'saturday',
    'domingo': 'sunday'
  };
  return mapping[weekday.toLowerCase()] || 'monday';
};

/**
 * Genera un color para un curso basado en su ID
 */
const generateCourseColor = (courseId) => {
  const colors = [
    '#e67e22', // Naranja
    '#c0392b', // Rojo
    '#8e44ad', // Morado
    '#f1c40f', // Amarillo
    '#16a085', // Verde azulado
    '#34495e', // Gris azulado
    '#7f8c8d', // Gris
    '#2980b9', // Azul
    '#27ae60', // Verde
    '#d35400'  // Naranja oscuro
  ];
  return colors[courseId % colors.length];
};

/**
 * Obtiene los horarios de cursos en formato grilla desde la API
 * @returns {Promise<Array>} Lista de cursos con horarios
 */
export const getCoursesSchedulesGrid = async () => {
  try {
    // Intentar primero con el endpoint específico de grilla
    let response = await fetchWithTimeout(`${API_BASE_URL}/courses/schedules-grid`, {
      method: 'GET',
      headers: CACHEABLE_HEADERS
    });

    // Si no existe, usar el endpoint general de cursos
    if (!response.ok) {
      console.log('Endpoint /schedules-grid no disponible, usando /courses');
      response = await fetchWithTimeout(`${API_BASE_URL}/courses`, {
        method: 'GET',
        headers: CACHEABLE_HEADERS
      });
    }

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Transformar los datos del backend al formato esperado por el componente
      const transformedData = result.data
        .filter(course => course.sections && course.sections.length > 0) // Solo cursos con secciones
        .map(course => {
          const courseColor = generateCourseColor(course.id);

          return {
            id: course.id,
            name: course.title,
            color: courseColor,
            category: course.category || 'General',
            schedules: course.sections.flatMap(section => {
              // Cada sección puede tener múltiples horarios en su schedule array
              return section.schedule.map(scheduleItem => {
                const timeSlot = `${scheduleItem.start_time}-${scheduleItem.end_time}`;
                const day = mapWeekdayToEnglish(section.weekday);

                return {
                  day: day,
                  timeSlot: timeSlot,
                  teacher: section.teacher_name,
                  teacherId: section.teacher_id,
                  places: section.places,
                  available: section.available_places !== null ? section.available_places : section.places,
                  section: {
                    id: section.id,
                    startDate: section.start_date || new Date().toISOString().split('T')[0],
                    endDate: section.end_date || new Date().toISOString().split('T')[0]
                  },
                  course: {
                    id: course.id,
                    name: course.title,
                    color: courseColor
                  },
                  date: section.start_date || new Date().toISOString().split('T')[0],
                  sessionsCount: section.sessions_count || 12,
                  pricePerSession: section.price_per_session || 0
                };
              });
            })
          };
        });

      console.log('✅ Datos transformados del backend:', transformedData);
      return transformedData;
    } else {
      throw new Error('La respuesta de la API no fue exitosa');
    }
  } catch (error) {
    console.error('Error al obtener horarios desde la API:', error);
    console.warn('Usando datos dummy como fallback');
    // Fallback a datos dummy si falla la API
    return getDummyGridCalendarData();
  }
};

/**
 * Datos dummy para el calendario estilo grilla (copy-enrollment)
 * @returns {Array} Lista de cursos con horarios en formato grilla
 */
export const getDummyGridCalendarData = () => {
  return [
    {
      id: 1,
      name: 'Acuarela',
      color: '#e67e22',
      schedules: [
        { day: 'monday', timeSlot: '10:00-12:00', teacher: 'Patricia López', places: 15, available: 12, section: { id: 101 }, course: { id: 1, name: 'Acuarela', color: '#e67e22' } },
        { day: 'monday', timeSlot: '12:30-14:30', teacher: 'Patricia López', places: 15, available: 8, section: { id: 102 }, course: { id: 1, name: 'Acuarela', color: '#e67e22' } },
        { day: 'thursday', timeSlot: '18:30-20:30', teacher: 'Patricia López', places: 15, available: 10, section: { id: 103 }, course: { id: 1, name: 'Acuarela', color: '#e67e22' } },
        { day: 'friday', timeSlot: '10:00-12:00', teacher: 'Patricia López', places: 15, available: 9, section: { id: 104 }, course: { id: 1, name: 'Acuarela', color: '#e67e22' } },
        { day: 'friday', timeSlot: '12:30-14:30', teacher: 'Patricia López', places: 15, available: 6, section: { id: 105 }, course: { id: 1, name: 'Acuarela', color: '#e67e22' } },
        { day: 'saturday', timeSlot: '10:00-12:00', teacher: 'Patricia López', places: 15, available: 11, section: { id: 106 }, course: { id: 1, name: 'Acuarela', color: '#e67e22' } },
        { day: 'saturday', timeSlot: '12:30-14:30', teacher: 'Patricia López', places: 15, available: 7, section: { id: 107 }, course: { id: 1, name: 'Acuarela', color: '#e67e22' } }
      ]
    },
    {
      id: 2,
      name: 'Ilustración-Dibujo',
      color: '#f1c40f',
      schedules: [
        { day: 'monday', timeSlot: '10:00-12:00', teacher: 'Laura Vega', places: 15, available: 7, section: { id: 201 }, course: { id: 2, name: 'Ilustración-Dibujo', color: '#f1c40f' } },
        { day: 'monday', timeSlot: '12:30-14:30', teacher: 'Laura Vega', places: 15, available: 5, section: { id: 202 }, course: { id: 2, name: 'Ilustración-Dibujo', color: '#f1c40f' } },
        { day: 'thursday', timeSlot: '18:30-20:30', teacher: 'Laura Vega', places: 15, available: 8, section: { id: 203 }, course: { id: 2, name: 'Ilustración-Dibujo', color: '#f1c40f' } },
        { day: 'friday', timeSlot: '10:00-12:00', teacher: 'Laura Vega', places: 15, available: 6, section: { id: 204 }, course: { id: 2, name: 'Ilustración-Dibujo', color: '#f1c40f' } },
        { day: 'friday', timeSlot: '12:30-14:30', teacher: 'Laura Vega', places: 15, available: 4, section: { id: 205 }, course: { id: 2, name: 'Ilustración-Dibujo', color: '#f1c40f' } },
        { day: 'saturday', timeSlot: '10:00-12:00', teacher: 'Laura Vega', places: 15, available: 9, section: { id: 206 }, course: { id: 2, name: 'Ilustración-Dibujo', color: '#f1c40f' } },
        { day: 'saturday', timeSlot: '12:30-14:30', teacher: 'Laura Vega', places: 15, available: 5, section: { id: 207 }, course: { id: 2, name: 'Ilustración-Dibujo', color: '#f1c40f' } }
      ]
    },
    {
      id: 3,
      name: 'Óleo',
      color: '#c0392b',
      schedules: [
        { day: 'monday', timeSlot: '15:30-17:30', teacher: 'María González', places: 15, available: 8, section: { id: 301 }, course: { id: 3, name: 'Óleo', color: '#c0392b' } },
        { day: 'tuesday', timeSlot: '10:00-12:00', teacher: 'María González', places: 15, available: 6, section: { id: 302 }, course: { id: 3, name: 'Óleo', color: '#c0392b' } },
        { day: 'tuesday', timeSlot: '15:30-17:30', teacher: 'María González', places: 15, available: 4, section: { id: 303 }, course: { id: 3, name: 'Óleo', color: '#c0392b' } },
        { day: 'wednesday', timeSlot: '10:00-12:00', teacher: 'María González', places: 15, available: 10, section: { id: 304 }, course: { id: 3, name: 'Óleo', color: '#c0392b' } },
        { day: 'wednesday', timeSlot: '12:30-14:30', teacher: 'María González', places: 15, available: 3, section: { id: 305 }, course: { id: 3, name: 'Óleo', color: '#c0392b' } },
        { day: 'wednesday', timeSlot: '18:30-20:30', teacher: 'María González', places: 15, available: 7, section: { id: 306 }, course: { id: 3, name: 'Óleo', color: '#c0392b' } },
        { day: 'thursday', timeSlot: '10:00-12:00', teacher: 'María González', places: 15, available: 5, section: { id: 307 }, course: { id: 3, name: 'Óleo', color: '#c0392b' } },
        { day: 'thursday', timeSlot: '12:30-14:30', teacher: 'María González', places: 15, available: 9, section: { id: 308 }, course: { id: 3, name: 'Óleo', color: '#c0392b' } },
        { day: 'friday', timeSlot: '15:30-17:30', teacher: 'María González', places: 15, available: 6, section: { id: 309 }, course: { id: 3, name: 'Óleo', color: '#c0392b' } },
        { day: 'saturday', timeSlot: '10:00-12:00', teacher: 'María González', places: 15, available: 8, section: { id: 310 }, course: { id: 3, name: 'Óleo', color: '#c0392b' } },
        { day: 'saturday', timeSlot: '12:30-14:30', teacher: 'María González', places: 15, available: 4, section: { id: 311 }, course: { id: 3, name: 'Óleo', color: '#c0392b' } }
      ]
    },
    {
      id: 4,
      name: 'Acrílico',
      color: '#8e44ad',
      schedules: [
        { day: 'monday', timeSlot: '15:30-17:30', teacher: 'Fernando Torres', places: 20, available: 10, section: { id: 401 }, course: { id: 4, name: 'Acrílico', color: '#8e44ad' } },
        { day: 'tuesday', timeSlot: '10:00-12:00', teacher: 'Fernando Torres', places: 20, available: 15, section: { id: 402 }, course: { id: 4, name: 'Acrílico', color: '#8e44ad' } },
        { day: 'tuesday', timeSlot: '15:30-17:30', teacher: 'Fernando Torres', places: 20, available: 12, section: { id: 403 }, course: { id: 4, name: 'Acrílico', color: '#8e44ad' } },
        { day: 'wednesday', timeSlot: '10:00-12:00', teacher: 'Fernando Torres', places: 20, available: 8, section: { id: 404 }, course: { id: 4, name: 'Acrílico', color: '#8e44ad' } },
        { day: 'wednesday', timeSlot: '12:30-14:30', teacher: 'Fernando Torres', places: 20, available: 5, section: { id: 405 }, course: { id: 4, name: 'Acrílico', color: '#8e44ad' } },
        { day: 'wednesday', timeSlot: '18:30-20:30', teacher: 'Fernando Torres', places: 20, available: 11, section: { id: 406 }, course: { id: 4, name: 'Acrílico', color: '#8e44ad' } },
        { day: 'thursday', timeSlot: '10:00-12:00', teacher: 'Fernando Torres', places: 20, available: 7, section: { id: 407 }, course: { id: 4, name: 'Acrílico', color: '#8e44ad' } },
        { day: 'thursday', timeSlot: '12:30-14:30', teacher: 'Fernando Torres', places: 20, available: 13, section: { id: 408 }, course: { id: 4, name: 'Acrílico', color: '#8e44ad' } },
        { day: 'friday', timeSlot: '15:30-17:30', teacher: 'Fernando Torres', places: 20, available: 9, section: { id: 409 }, course: { id: 4, name: 'Acrílico', color: '#8e44ad' } },
        { day: 'saturday', timeSlot: '10:00-12:00', teacher: 'Fernando Torres', places: 20, available: 14, section: { id: 410 }, course: { id: 4, name: 'Acrílico', color: '#8e44ad' } },
        { day: 'saturday', timeSlot: '12:30-14:30', teacher: 'Fernando Torres', places: 20, available: 10, section: { id: 411 }, course: { id: 4, name: 'Acrílico', color: '#8e44ad' } }
      ]
    },
    {
      id: 5,
      name: 'Crochet',
      color: '#7f8c8d',
      schedules: [
        { day: 'tuesday', timeSlot: '18:30-20:30', teacher: 'Carmen Silva', places: 10, available: 6, section: { id: 501 }, course: { id: 5, name: 'Crochet', color: '#7f8c8d' } }
      ]
    },
    {
      id: 6,
      name: 'Cerámica Escultura',
      color: '#34495e',
      schedules: [
        { day: 'wednesday', timeSlot: '18:30-20:30', teacher: 'Isabel Ramírez', places: 8, available: 2, section: { id: 601 }, course: { id: 6, name: 'Cerámica Escultura', color: '#34495e' } }
      ]
    },
    {
      id: 7,
      name: 'Arte Infantil',
      color: '#16a085',
      schedules: [
        { day: 'saturday', timeSlot: '15:30-17:30', teacher: 'Ana Martínez', places: 12, available: 8, section: { id: 701 }, course: { id: 7, name: 'Arte Infantil', color: '#16a085' } }
      ]
    }
  ];
};
