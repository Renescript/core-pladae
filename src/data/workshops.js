// Datos de los talleres de Gustarte — fuente única para páginas de detalle, chips del hero y navbar dropdown.
// Nombres, descripciones, profesores y horarios reflejan la unificación del back
// (back-academia.onrender.com/api/v1/courses): al 2026-07-02 hay 5 talleres.
// Los campos editoriales (tagline, highlights) son propios del front.

export const workshops = [
  {
    slug: 'oleo-y-acrilico',
    name: 'Óleo y Acrílico',
    tagline: 'Dos técnicas, una sola sala — del óleo clásico al acrílico versátil.',
    description:
      'Clases continuas con metodología paso a paso e incorporación inmediata durante todo el año. El taller se centra en el dominio de mezclas, teoría del color y aplicación por capas, permitiendo que cada alumno avance a su propio ritmo para desarrollar un estilo personal con bases técnicas sólidas.',
    learnings: [
      'Proporción y perspectiva',
      'Volumen, luz y sombra',
      'Fundamentos de la teoría del color',
      'Mezcla en paleta y ritmos de trazos',
      'Aplicación por capas en óleo y acrílico',
    ],
    highlights: [
      { title: 'Metodología personalizada', text: 'Paso a paso, avanzas a tu propio ritmo.' },
      { title: 'No necesitas experiencia', text: 'Desde quienes recién parten hasta avanzados.' },
      { title: 'Múltiples horarios', text: 'Semana y sábado, mañana o tarde.' },
    ],
    duration: '2 horas por sesión',
    modality: 'Presencial',
    materials: 'Incluidos',
    video: null,
    fallbackImage: '/oleo.jpg',
    professor: {
      name: 'Gustavo Salazar',
      bio: 'Artista visual y diseñador industrial de profesión. Director de Gustarte y tutor del taller de Óleo y Acrílico. @gust_artista',
      photo: null,
    },
    schedule: [
      { day: 'Martes', time: '10:00 – 12:00' },
      { day: 'Miércoles', time: '10:00 – 12:00' },
      { day: 'Miércoles', time: '12:30 – 14:30' },
      { day: 'Miércoles', time: '18:00 – 20:00' },
      { day: 'Jueves', time: '10:00 – 12:00' },
      { day: 'Jueves', time: '12:30 – 14:30' },
      { day: 'Viernes', time: '15:30 – 17:30' },
      { day: 'Sábado', time: '10:00 – 12:00' },
      { day: 'Sábado', time: '12:30 – 14:30' },
    ],
    category: 'Pintura',
  },
  {
    slug: 'acuarela-dibujo',
    name: 'Acuarela / Ilustración - Dibujo',
    tagline: 'Del trazo al color — dibujar, ilustrar y pintar en acuarela en un mismo taller.',
    description:
      'Taller fundamental para introducirte en las bases del dibujo, la ilustración y la acuarela: proporción, perspectiva, volumen, teoría del color y control del agua. Está pensado para todo público — desde quienes recién parten hasta quienes ya dibujan y buscan afinar técnica. Al ser taller permanente puedes unirte cuando quieras y avanzar a tu propio ritmo.',
    learnings: [
      'Proporción y perspectiva',
      'Volumen, luz y sombra',
      'Fundamentos de la teoría del color',
      'Manejo del agua y tiempos de papel',
      'Lavados, degradados y húmedo sobre húmedo',
      'Conceptualización aplicada a la ilustración',
    ],
    highlights: [
      { title: 'Bases del dibujo', text: 'Línea, forma, proporción y observación.' },
      { title: 'Acuarela y transparencia', text: 'Manejo del agua, lavados y húmedo sobre húmedo.' },
      { title: 'Para todos los niveles', text: 'Desde principiantes hasta avanzados.' },
    ],
    duration: '2 horas por sesión',
    modality: 'Presencial',
    materials: 'Incluidos',
    video: { mp4: '/videos/dibujo.mp4' },
    fallbackImage: '/ilustracion.jpg',
    professor: {
      name: 'Jota Lara',
      bio: 'Diseñador gráfico, ilustrador y acuarelista con más de 15 años de experiencia en el rubro de la ilustración y las artes gráficas. Su trabajo se basa en la figuración y en técnicas tradicionales. En Gustarte tiene a cargo los talleres de acuarela y dibujo ilustrativo. @jotalara.ilustracion',
      photo: null,
    },
    schedule: [
      { day: 'Lunes', time: '10:00 – 12:00' },
      { day: 'Lunes', time: '12:30 – 14:30' },
      { day: 'Martes', time: '18:00 – 20:00' },
      { day: 'Viernes', time: '10:00 – 12:00' },
      { day: 'Viernes', time: '12:30 – 14:30' },
      { day: 'Sábado', time: '10:00 – 12:00' },
      { day: 'Sábado', time: '12:30 – 14:30' },
    ],
    category: 'Dibujo',
  },
  {
    slug: 'ceramica-escultura',
    name: 'Cerámica - Escultura',
    tagline: 'Pensar la forma con las manos.',
    description:
      'Taller de Escultura y Cerámica Esmaltada para crear piezas de diseño y decorativas mediante técnicas de modelado básico, medio y avanzado. Podrás experimentar con este material desde un enfoque escultórico aplicado a un proyecto personal, con orientación permanente del tutor.',
    learnings: [
      'Proceso de amasado',
      'Corte y pegado de piezas',
      'Acabado de bruñido y pulido',
      'Aplicación de esmaltes',
      'Desarrollo conceptual de obra',
    ],
    highlights: [
      { title: 'Modelado paso a paso', text: 'Del amasado al pulido, con acompañamiento cercano.' },
      { title: 'Cocción y esmaltado', text: 'Aplicación de esmaltes y acabados profesionales.' },
      { title: 'Proyecto personal', text: 'Enfoque escultórico aplicado a tu propia obra.' },
    ],
    duration: '2 horas por sesión',
    modality: 'Presencial',
    materials: 'Incluidos',
    video: { mp4: '/videos/escultura.mp4' },
    fallbackImage: '/escultura.jpg',
    professor: {
      name: 'Joan Soto',
      bio: 'Arquitecto UBB, ceramista, escultor y docente. Ha participado en encuentros de cerámica en Chile, Perú y Uruguay, además de residencias de arte en Santiago y São Paulo. @serdeotrolugar',
      photo: null,
    },
    schedule: [
      { day: 'Miércoles', time: '18:00 – 20:00' },
    ],
    customPricing: [
      { id: 'trial-1', plan: 'Clase de prueba', number_of_classes: 1, weekly_classes: 1, price: 7000, saturday_price: 7000, event_type: 'trial' },
      { id: 4, plan: '4 clases', number_of_classes: 4, weekly_classes: 1, price: 45000, saturday_price: 45000, event_type: null },
    ],
    category: 'Escultura',
  },
  {
    slug: 'arte-infantil',
    name: 'Arte infantil',
    tagline: 'Un espacio para el crecimiento creativo de los más pequeños.',
    description:
      'El Taller de Arte Infantil es un espacio para el crecimiento creativo. Combinamos la enseñanza de diversas técnicas artísticas —como pintura, dibujo y collage, entre otras— con el desarrollo de la expresión personal de cada niño.',
    learnings: [
      'Dinámicas de crecimiento emocional',
      'Práctica de técnicas de artes visuales esenciales',
      'Ejercicios de percepción visual',
      'Conceptos enriquecedores',
      'Confianza para crear sin "hacerlo bien"',
    ],
    highlights: [
      { title: 'Técnicas mixtas', text: 'Pintura, dibujo, collage y más en cada sesión.' },
      { title: 'Crecimiento emocional', text: 'Dinámicas que acompañan la expresión personal.' },
      { title: 'Grupos reducidos', text: 'Materiales incluidos y acompañamiento cercano.' },
    ],
    duration: '2 horas por sesión',
    modality: 'Presencial',
    materials: 'Incluidos',
    video: { mp4: '/videos/arte-infantil.mp4' },
    fallbackImage: '/taller-infantil.jpg',
    professor: {
      name: 'Elena Muñoz',
      bio: 'Estudiante de Diseño Gráfico y tallerista de técnicas artísticas para niños en diversas instituciones y centros culturales.',
      photo: null,
    },
    schedule: [
      { day: 'Miércoles', time: '15:30 – 17:30' },
      { day: 'Viernes', time: '15:30 – 17:30' },
      { day: 'Sábado', time: '15:30 – 17:30' },
    ],
    category: 'Infantil',
  },
  {
    slug: 'comic',
    name: 'Cómic',
    tagline: 'Cuenta una historia con dibujos.',
    description:
      'Taller teórico-práctico para plasmar en papel ese relato que tienes en la cabeza, el personaje que imaginas o tu propia autobiografía. No importa tu nivel de dibujo: lo fundamental es conectar con la historia (y aprenderás a dibujar en el proceso). Puedes trabajar en modalidad análoga (lápiz y hoja) o digital.',
    learnings: [
      'Estudio de referentes',
      'Elementos del cómic e ilustración',
      'Bases del dibujo',
      'Construcción de guion',
      'Narrativa visual',
    ],
    highlights: [
      { title: 'Análoga o digital', text: 'Elige entre lápiz + hoja o modalidad digital.' },
      { title: 'De la idea a la viñeta', text: 'Guion, referentes y narrativa visual.' },
      { title: 'A tu ritmo', text: 'Taller permanente, entras cuando quieras.' },
    ],
    duration: '2 horas por sesión',
    modality: 'Presencial · Análoga o Digital',
    materials: 'Incluidos',
    video: { mp4: '/videos/comic.mp4' },
    fallbackImage: '/comic.jpg',
    professor: {
      name: 'Mistral Torres',
      bio: 'Periodista de la Universidad de Concepción e ilustradora, especializada en cómic, infografía y narrativa. Actualmente trabaja como ilustradora en @biobiochile con la sección "Viernes de Chistes Fomes". @mistraldraws',
      photo: null,
    },
    schedule: [
      { day: 'Lunes', time: '18:00 – 20:00' },
      { day: 'Jueves', time: '15:30 – 17:30' },
    ],
    customPricing: [
      { id: 'trial-1', plan: 'Clase de prueba', number_of_classes: 1, weekly_classes: 1, price: 7000, saturday_price: null, event_type: 'trial' },
      { id: 'single', plan: 'Clase única', number_of_classes: 1, weekly_classes: 1, price: 12000, saturday_price: null, event_type: 'single' },
      { id: 4, plan: '4 clases', number_of_classes: 4, weekly_classes: 1, price: 40000, saturday_price: null, event_type: null },
      { id: 8, plan: '8 clases', number_of_classes: 8, weekly_classes: 2, price: 72000, saturday_price: null, event_type: null },
      { id: 12, plan: '12 clases', number_of_classes: 12, weekly_classes: 3, price: 102000, saturday_price: null, event_type: null },
      { id: 16, plan: '16 clases', number_of_classes: 16, weekly_classes: 4, price: 128000, saturday_price: null, event_type: null },
    ],
    category: 'Dibujo',
  },
];

// Slugs viejos (pre-unificación) que redirigen al taller unificado equivalente.
// Mantener por si aparecen links compartidos apuntando a las URLs anteriores.
export const legacySlugRedirects = {
  oleo: 'oleo-y-acrilico',
  acrilico: 'oleo-y-acrilico',
  acuarela: 'acuarela-dibujo',
  dibujo: 'acuarela-dibujo',
  escultura: 'ceramica-escultura',
  'taller-infantil': 'arte-infantil',
};

export const getWorkshopBySlug = (slug) => workshops.find((w) => w.slug === slug);
