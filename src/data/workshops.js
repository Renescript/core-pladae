// Datos de los talleres de Gustarte — fuente única para páginas de detalle, chips del hero y navbar dropdown.
// Para agregar un taller nuevo: copiar un objeto, ajustar slug + datos, registrar también en hero chips si se quiere.

export const workshops = [
  {
    slug: 'oleo',
    name: 'Óleo',
    tagline: 'La técnica clásica que enseñó a los grandes maestros.',
    description:
      'Aprende los fundamentos del óleo: preparación de soportes, mezcla de colores, capas y veladuras. Trabajaremos sobre lienzo y madera, explorando desde retrato hasta paisaje en un proceso paciente que el medio recompensa.',
    learnings: [
      'Preparación de soportes (lienzo, madera, papel especial)',
      'Teoría del color aplicada al óleo',
      'Técnica gruesa (impasto) y veladuras finas',
      'Composición y luz en bodegón y paisaje',
      'Tiempos de secado, médiums y resinas',
    ],
    video: null,
    fallbackImage: '/oleo.jpg',
    professor: {
      name: 'María González',
      bio: '15 años pintando al óleo. Egresada de la U. de Concepción, ha expuesto en Chile y Argentina. Cree que el óleo se aprende observando.',
      photo: null,
    },
    schedule: [
      { day: 'Martes', time: '18:30 – 20:30' },
      { day: 'Jueves', time: '10:00 – 12:00' },
      { day: 'Sábado', time: '10:00 – 12:00' },
    ],
    priceMonthly: 65000,
    category: 'Pintura',
  },
  {
    slug: 'acuarela',
    name: 'Acuarela',
    tagline: 'Transparencias, agua y un pulso que se afina con la práctica.',
    description:
      'La acuarela exige decisión: el agua y el papel mandan. En este taller aprenderás a leer la humedad, controlar el flujo del pigmento y construir transparencias luminosas. Desde apuntes botánicos a paisajes urbanos.',
    learnings: [
      'Manejo del agua y tiempos de papel',
      'Lavados planos, degradados y húmedo sobre húmedo',
      'Paleta limitada y mezclas en el papel',
      'Composición ligera para captar la luz',
      'Apuntes rápidos al natural',
    ],
    video: null,
    fallbackImage: '/acuarela.jpg',
    professor: {
      name: 'Laura Fernández',
      bio: 'Acuarelista urbana, miembro de Urban Sketchers Chile. Sus libretas de viaje son su escuela diaria.',
      photo: null,
    },
    schedule: [
      { day: 'Lunes', time: '18:30 – 20:30' },
      { day: 'Miércoles', time: '10:00 – 12:00' },
    ],
    priceMonthly: 55000,
    category: 'Pintura',
  },
  {
    slug: 'dibujo',
    name: 'Dibujo',
    tagline: 'El oficio que sostiene todas las demás disciplinas.',
    description:
      'Antes que cualquier color, está el dibujo. Trabajaremos observación, línea, proporción, perspectiva y construcción de la forma. Lápiz, carboncillo, tinta y sanguina. La base que el resto de tu obra va a agradecer.',
    learnings: [
      'Observación, encaje y proporción',
      'Línea expresiva y sombreado',
      'Perspectiva cónica y axonométrica',
      'Anatomía aplicada al retrato',
      'Distintos medios: grafito, carbón, tinta',
    ],
    video: { mp4: '/videos/dibujo.mp4', webm: '/videos/dibujo.webm' },
    fallbackImage: '/ilustracion.jpg',
    professor: {
      name: 'Carlos Ramírez',
      bio: 'Dibujante e ilustrador. Enseña dibujo desde 2010. Para él la goma es tan importante como el lápiz.',
      photo: null,
    },
    schedule: [
      { day: 'Martes', time: '10:00 – 12:00' },
      { day: 'Jueves', time: '18:30 – 20:30' },
      { day: 'Sábado', time: '12:00 – 14:00' },
    ],
    priceMonthly: 50000,
    category: 'Dibujo',
  },
  {
    slug: 'acrilico',
    name: 'Acrílico',
    tagline: 'Versátil, rápido y perdona — el medio para experimentar.',
    description:
      'El acrílico permite trabajar capas en minutos, mezclar con texturas y combinar con collage o medios mixtos. Ideal para quien quiere ver resultado pronto sin perder profundidad técnica.',
    learnings: [
      'Acrílico líquido vs heavy body',
      'Médiums, gels y texturas',
      'Capas opacas y veladuras acrílicas',
      'Trabajo sobre lienzo, papel y madera',
      'Acrílico + medios mixtos',
    ],
    video: null,
    fallbackImage: '/acrilico.jpg',
    professor: {
      name: 'María González',
      bio: '15 años pintando, también enseña óleo. Cree que el acrílico es el mejor lugar para perder el miedo al lienzo blanco.',
      photo: null,
    },
    schedule: [
      { day: 'Lunes', time: '10:00 – 12:00' },
      { day: 'Miércoles', time: '18:30 – 20:30' },
    ],
    priceMonthly: 55000,
    category: 'Pintura',
  },
  {
    slug: 'escultura',
    name: 'Escultura',
    tagline: 'Pensar la forma con las manos.',
    description:
      'Modelado en arcilla, cerámica al alta y baja temperatura, vaciados y acabados. Trabajaremos figura humana, formas abstractas y piezas funcionales. Un taller físico, lento y profundamente satisfactorio.',
    learnings: [
      'Modelado en arcilla húmeda',
      'Construcción por placas y rollos',
      'Vaciado en yeso (técnica básica)',
      'Cocción y esmaltado',
      'Acabados y patinados',
    ],
    video: { mp4: '/videos/escultura.mp4', webm: '/videos/escultura.webm' },
    fallbackImage: '/escultura.jpg',
    professor: {
      name: 'Ana Martínez',
      bio: 'Escultora con foco en cerámica contemporánea. Su taller propio funciona desde 2014.',
      photo: null,
    },
    schedule: [
      { day: 'Martes', time: '18:30 – 21:00' },
      { day: 'Sábado', time: '10:00 – 12:30' },
    ],
    priceMonthly: 75000,
    category: 'Escultura',
  },
  {
    slug: 'taller-infantil',
    name: 'Taller Infantil',
    tagline: 'Para que descubran el arte sin instrucciones rígidas.',
    description:
      'Diseñado para niños y niñas de 6 a 12 años. Mezclamos técnicas (pintura, modelado, collage, dibujo) en proyectos lúdicos que apuntan a la expresión, no a la copia. Grupos reducidos y materiales incluidos.',
    learnings: [
      'Exploración libre de materiales',
      'Color, forma y composición a su nivel',
      'Modelado básico en arcilla',
      'Collage y técnicas mixtas',
      'Confianza para crear sin "hacerlo bien"',
    ],
    video: { mp4: '/videos/arte-infantil.mp4', webm: '/videos/arte-infantil.webm' },
    fallbackImage: '/taller-infantil.jpg',
    professor: {
      name: 'Sofía Torres',
      bio: 'Educadora de artes con 8 años en talleres infantiles. Mamá de dos. Sabe cuándo retirar la consigna.',
      photo: null,
    },
    schedule: [
      { day: 'Sábado', time: '10:00 – 11:30' },
      { day: 'Sábado', time: '12:00 – 13:30' },
    ],
    priceMonthly: 45000,
    category: 'Infantil',
  },
  {
    slug: 'comic',
    name: 'Comic',
    tagline: 'Del guion a la viñeta — narrar con dibujos.',
    description:
      'Cómo construir una historia en imágenes secuenciadas. Storyboard, viñeta, encuadre, expresión de personajes, ritmo narrativo, entintado y rotulación. Para quienes ya dibujan algo y quieren contar.',
    learnings: [
      'Guion y storyboard',
      'Composición de viñeta y encuadre',
      'Personajes: model sheet y expresiones',
      'Entintado tradicional y digital básico',
      'Rotulación y maquetación de página',
    ],
    video: { mp4: '/videos/comic.mp4', webm: '/videos/comic.webm' },
    fallbackImage: '/ilustracion.jpg',
    professor: {
      name: 'Pedro Sánchez',
      bio: 'Historietista y profesor de cómic. Publicó dos novelas gráficas independientes. Defensor del lápiz azul.',
      photo: null,
    },
    schedule: [
      { day: 'Miércoles', time: '18:30 – 20:30' },
      { day: 'Sábado', time: '15:00 – 17:00' },
    ],
    priceMonthly: 55000,
    category: 'Dibujo',
  },
];

export const getWorkshopBySlug = (slug) => workshops.find((w) => w.slug === slug);
