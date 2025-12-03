// Mock data para cursos, planes y horarios de la academia de artes

export const courses = [
  {
    id: 1,
    name: 'Pintura al Óleo',
    description: 'Aprende las técnicas tradicionales de pintura al óleo, desde lo básico hasta técnicas avanzadas.',
    category: 'Pintura',
    duration: '3 meses',
    maxStudents: 15,
    currentStudents: 8,
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400',
    instructor: 'María González',
  },
  {
    id: 2,
    name: 'Dibujo Artístico',
    description: 'Fundamentos del dibujo: perspectiva, proporción, sombreado y composición.',
    category: 'Dibujo',
    duration: '2 meses',
    maxStudents: 20,
    currentStudents: 15,
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
    instructor: 'Carlos Ramírez',
  },
  {
    id: 3,
    name: 'Escultura en Arcilla',
    description: 'Modelado y escultura en arcilla, técnicas de vaciado y acabados.',
    category: 'Escultura',
    duration: '4 meses',
    maxStudents: 12,
    currentStudents: 10,
    image: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=400',
    instructor: 'Ana Martínez',
  },
  {
    id: 4,
    name: 'Acuarela',
    description: 'Técnicas de acuarela: transparencias, mezclas y efectos especiales.',
    category: 'Pintura',
    duration: '2 meses',
    maxStudents: 18,
    currentStudents: 12,
    image: 'https://images.unsplash.com/photo-1545486332-9e0999c535b2?w=400',
    instructor: 'Laura Fernández',
  },
  {
    id: 5,
    name: 'Arte Digital',
    description: 'Ilustración digital, herramientas profesionales y portfolio digital.',
    category: 'Digital',
    duration: '3 meses',
    maxStudents: 16,
    currentStudents: 14,
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400',
    instructor: 'Pedro Sánchez',
  },
  {
    id: 6,
    name: 'Fotografía Artística',
    description: 'Composición, iluminación y edición fotográfica con enfoque artístico.',
    category: 'Fotografía',
    duration: '3 meses',
    maxStudents: 14,
    currentStudents: 6,
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400',
    instructor: 'Sofía Torres',
  }
];

export const plans = [
  {
    id: 1,
    name: 'Plan Básico',
    description: '1 clase por semana',
    sessionsPerWeek: 1,
    price: 50000,
    features: [
      'Acceso a materiales básicos',
      'Certificado de participación',
      'Grupo reducido'
    ]
  },
  {
    id: 2,
    name: 'Plan Estándar',
    description: '2 clases por semana',
    sessionsPerWeek: 2,
    price: 90000,
    features: [
      'Acceso a materiales básicos',
      'Certificado de participación',
      'Grupo reducido',
      'Asesoría personalizada',
      '10% descuento en materiales'
    ],
    popular: true
  },
  {
    id: 3,
    name: 'Plan Intensivo',
    description: '3 clases por semana',
    sessionsPerWeek: 3,
    price: 120000,
    features: [
      'Acceso a materiales premium',
      'Certificado de participación',
      'Grupo reducido',
      'Asesoría personalizada',
      '20% descuento en materiales',
      'Acceso a talleres especiales'
    ]
  }
];

// Horarios disponibles para cada curso
export const schedules = {
  1: [ // Pintura al Óleo
    { id: 1, day: 'Lunes', time: '10:00 - 12:00', availableSlots: 7 },
    { id: 2, day: 'Lunes', time: '16:00 - 18:00', availableSlots: 3 },
    { id: 3, day: 'Miércoles', time: '10:00 - 12:00', availableSlots: 5 },
    { id: 4, day: 'Miércoles', time: '18:00 - 20:00', availableSlots: 2 },
    { id: 5, day: 'Viernes', time: '14:00 - 16:00', availableSlots: 0 },
  ],
  2: [ // Dibujo Artístico
    { id: 6, day: 'Martes', time: '09:00 - 11:00', availableSlots: 8 },
    { id: 7, day: 'Martes', time: '15:00 - 17:00', availableSlots: 4 },
    { id: 8, day: 'Jueves', time: '10:00 - 12:00', availableSlots: 6 },
    { id: 9, day: 'Sábado', time: '10:00 - 12:00', availableSlots: 2 },
  ],
  3: [ // Escultura en Arcilla
    { id: 10, day: 'Lunes', time: '14:00 - 17:00', availableSlots: 4 },
    { id: 11, day: 'Miércoles', time: '14:00 - 17:00', availableSlots: 3 },
    { id: 12, day: 'Viernes', time: '10:00 - 13:00', availableSlots: 1 },
  ],
  4: [ // Acuarela
    { id: 13, day: 'Martes', time: '10:00 - 12:00', availableSlots: 9 },
    { id: 14, day: 'Jueves', time: '16:00 - 18:00', availableSlots: 7 },
    { id: 15, day: 'Sábado', time: '14:00 - 16:00', availableSlots: 5 },
  ],
  5: [ // Arte Digital
    { id: 16, day: 'Lunes', time: '18:00 - 20:00', availableSlots: 3 },
    { id: 17, day: 'Miércoles', time: '18:00 - 20:00', availableSlots: 2 },
    { id: 18, day: 'Viernes', time: '16:00 - 18:00', availableSlots: 0 },
    { id: 19, day: 'Sábado', time: '10:00 - 12:00', availableSlots: 4 },
  ],
  6: [ // Fotografía Artística
    { id: 20, day: 'Martes', time: '18:00 - 20:00', availableSlots: 10 },
    { id: 21, day: 'Jueves', time: '18:00 - 20:00', availableSlots: 8 },
    { id: 22, day: 'Sábado', time: '09:00 - 11:00', availableSlots: 6 },
  ],
};
