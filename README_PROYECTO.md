# PLADAE - Academia de Artes

Plataforma de inscripción para una academia de artes con landing page y formulario de matrícula integrado con Webpay.

## Descripción del Proyecto

Este proyecto es un frontend desarrollado con React y Vite que incluye:

- **Landing Page** con información de la academia
- **Catálogo de Cursos** con disponibilidad en tiempo real
- **Formulario de Inscripción Multi-paso** que incluye:
  - Selección de curso
  - Selección de plan (Básico, Estándar, Intensivo)
  - Selección de horarios con calendario
  - Formulario de datos del estudiante
  - Simulación de pago con Webpay
- **Sistema de gestión de cupos** basado en disponibilidad
- **Diseño responsive** adaptado a móviles y tablets

## Requisitos Previos

- **Node.js**: versión 20.19+ o 22.12+
- **npm** o **yarn**

### Actualizar Node.js

Si necesitas actualizar Node.js, puedes usar nvm (Node Version Manager):

```bash
# Instalar nvm (si no lo tienes)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Instalar Node.js versión LTS
nvm install --lts

# Usar la versión instalada
nvm use --lts

# Verificar la versión
node --version
```

## Instalación

```bash
# Clonar el repositorio o navegar al directorio
cd PLADAE

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Estructura del Proyecto

```
PLADAE/
├── src/
│   ├── components/
│   │   ├── Landing/              # Componentes del landing
│   │   │   ├── Hero.jsx
│   │   │   ├── CoursesShowcase.jsx
│   │   │   └── About.jsx
│   │   ├── Enrollment/           # Componentes del formulario
│   │   │   ├── EnrollmentForm.jsx       # Contenedor principal
│   │   │   ├── CourseSelector.jsx       # Paso 1: Selección de curso
│   │   │   ├── PlanSelector.jsx         # Paso 2: Selección de plan
│   │   │   ├── ScheduleSelector.jsx     # Paso 3: Selección de horarios
│   │   │   ├── StudentForm.jsx          # Paso 4: Datos del estudiante
│   │   │   ├── PaymentWebpay.jsx        # Paso 5: Pago
│   │   │   └── SuccessMessage.jsx       # Mensaje de éxito
│   │   └── Common/               # Componentes compartidos
│   ├── data/
│   │   └── mockData.js           # Datos mock de cursos, planes y horarios
│   ├── App.jsx                   # Componente principal
│   ├── App.css                   # Estilos principales
│   └── main.jsx                  # Punto de entrada
├── package.json
└── vite.config.js
```

## Funcionalidades Principales

### 1. Landing Page

- Hero section con llamado a la acción
- Showcase de cursos con información visual
- Sección "Sobre Nosotros" con estadísticas
- Footer con información de contacto

### 2. Formulario de Inscripción (5 Pasos)

#### Paso 1: Selección de Curso
- Visualización de todos los cursos disponibles
- Indicador de cupos disponibles
- Filtrado de cursos sin disponibilidad
- Información detallada: instructor, duración, categoría

#### Paso 2: Selección de Plan
- 3 planes disponibles: Básico, Estándar, Intensivo
- Diferentes precios y beneficios
- Indicador del plan más popular

#### Paso 3: Selección de Horarios
- Calendario de horarios disponibles por curso
- Selección múltiple según el plan elegido
- Indicador de cupos por horario
- Validación de horarios llenos

#### Paso 4: Datos del Estudiante
- Formulario con validación:
  - Nombre y apellido
  - RUT
  - Email
  - Teléfono
  - Dirección (opcional)

#### Paso 5: Pago con Webpay (Simulado)
- Resumen completo de la inscripción
- Simulación del proceso de pago Webpay
- Pantalla de confirmación
- Generación de ID de transacción

### 3. Mock Data

El archivo `src/data/mockData.js` contiene:

- **6 cursos** de diferentes categorías:
  - Pintura al Óleo
  - Dibujo Artístico
  - Escultura en Arcilla
  - Acuarela
  - Arte Digital
  - Fotografía Artística

- **3 planes de pago**:
  - Básico ($50.000/mes)
  - Estándar ($90.000/mes)
  - Intensivo ($120.000/mes)

- **Horarios** específicos para cada curso con cupos disponibles

## Integración con Backend

El formulario está preparado para enviar los datos al backend. En `EnrollmentForm.jsx`, línea 45, se registra en consola la data completa:

```javascript
const handleEnrollmentComplete = (paymentData) => {
  const enrollmentData = {
    course: selectedCourse,
    plan: selectedPlan,
    schedules: selectedSchedules,
    student: studentData,
    ...paymentData
  };

  console.log('Inscripción completa:', enrollmentData);

  // Aquí se enviaría al backend
  // await fetch('/api/enrollments', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(enrollmentData)
  // });
};
```

### Estructura de Datos Enviados

```json
{
  "course": {
    "id": 1,
    "name": "Pintura al Óleo",
    "instructor": "María González",
    "duration": "3 meses"
  },
  "plan": {
    "id": 2,
    "name": "Plan Estándar",
    "price": 90000,
    "sessionsPerWeek": 2
  },
  "schedules": [
    {
      "id": 1,
      "day": "Lunes",
      "time": "10:00 - 12:00"
    }
  ],
  "student": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@email.com",
    "phone": "+56912345678",
    "rut": "12.345.678-9",
    "address": "Dirección opcional"
  },
  "paymentStatus": "approved",
  "transactionId": "WP-1699123456789",
  "paymentDate": "2024-11-03T20:00:00.000Z"
}
```

## Integración Real con Webpay

Para integrar con Webpay real, necesitarás:

1. **Backend**: Implementar endpoint para crear transacción Webpay
2. **Credenciales**: Obtener código de comercio y API Key de Transbank
3. **SDK**: Usar el SDK oficial de Transbank para Node.js

Ejemplo de integración en el backend:

```javascript
// Backend (Node.js/Express)
const WebpayPlus = require('transbank-sdk').WebpayPlus;

app.post('/api/create-payment', async (req, res) => {
  const { amount, orderId, studentEmail } = req.body;

  const createResponse = await WebpayPlus.Transaction.create(
    orderId,
    sessionId,
    amount,
    'http://tu-dominio.com/api/payment-return'
  );

  res.json({
    token: createResponse.token,
    url: createResponse.url
  });
});
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## Personalización

### Modificar Cursos y Planes

Edita el archivo `src/data/mockData.js` para actualizar:
- Cursos disponibles
- Planes de pago
- Horarios por curso
- Cupos disponibles

### Cambiar Colores y Estilos

Los colores principales están definidos como variables CSS en `src/App.css`:

```css
:root {
  --primary-color: #6366f1;
  --secondary-color: #8b5cf6;
  --accent-color: #ec4899;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
}
```

## Responsive Design

La aplicación está optimizada para:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## Próximos Pasos para Producción

1. **Conectar con Backend**:
   - Implementar API endpoints
   - Gestión de autenticación
   - Manejo de sesiones

2. **Webpay Real**:
   - Configurar credenciales de Transbank
   - Implementar flujo de retorno
   - Manejo de errores de pago

3. **Gestión de Cupos**:
   - Sistema de actualización en tiempo real
   - Reserva temporal durante el proceso
   - Notificaciones de cupos llenos

4. **Características Adicionales**:
   - Sistema de notificaciones por email
   - Panel de administración
   - Reportes de inscripciones
   - Gestión de estudiantes

## Soporte

Para cualquier duda o problema, contacta al equipo de desarrollo.

## Licencia

Este proyecto es privado y está desarrollado para PLADAE Academia de Artes.
