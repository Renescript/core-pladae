# Guía de Integración - Vista de Todos los Calendarios

## 🎯 ¿Qué se ha creado?

Se ha creado **AllCalendarsView.jsx**, un componente que muestra TODOS los calendarios uno debajo del otro, consumiendo los datos reales de tu API.

## 📦 Archivos creados:

1. **AllCalendarsView.jsx** - Componente principal que muestra todos los calendarios
2. **AllCalendarsView.css** - Estilos para el componente
3. Todos los ejemplos de calendarios actualizados para consumir datos reales

## 🚀 Cómo Integrar en tu Formulario

### Opción 1: Reemplazar ScheduleSelector completamente (RECOMENDADO)

En tu archivo `src/components/Enrollment/EnrollmentForm.jsx`, cambia el import:

```jsx
// ANTES:
import ScheduleSelector from './ScheduleSelector';

// DESPUÉS:
import ScheduleSelector from './AllCalendarsView';
```

¡Eso es todo! El componente ya está listo para usar los mismos props que ScheduleSelector.

### Opción 2: Usar como componente separado

Si quieres mantener ambos, puedes importarlo con un alias:

```jsx
import ScheduleSelector from './ScheduleSelector';
import AllCalendarsView from './AllCalendarsView';

// Luego usa el que prefieras en el render:
{currentStep === 2 && (
  <AllCalendarsView
    selectedCourse={selectedCourse}
    selectedSection={selectedSection}
    onSelectSection={setSelectedSection}
  />
)}
```

## 📊 ¿Qué datos consume?

El componente consume automáticamente los datos que ya tienes de la API:

```javascript
selectedCourse = {
  id: 1,
  name: "Óleo",  // Adaptado de 'title' en la API
  description: "...",
  sections: [
    {
      id: 1,
      teacher_name: "Profesor 1",
      available_places: 10,
      places: 10,
      start_date: "2025-11-10",
      end_date: "2025-12-31",
      schedule: [
        {
          id: 1,
          day: "Lunes",
          time: "10:00 - 12:00"
        },
        {
          id: 2,
          day: "Miércoles",
          time: "14:00 - 16:00"
        }
      ]
    }
  ]
}
```

**No necesitas hacer ninguna adaptación adicional**, el componente ya está preparado para estos datos.

## 🎨 Características del Componente

### 1. Vista Colapsable
- Cada calendario se muestra en una sección colapsable
- Haz clic en el header para expandir/colapsar
- Solo se muestra un calendario a la vez para mejor rendimiento

### 2. Banner de Selección Global
- Cuando seleccionas una sección, aparece un banner verde en la parte superior
- La selección se comparte entre todos los calendarios

### 3. Estado de Instalación
- **CSS Grid Custom**: ✅ Disponible sin instalación
- **Otros calendarios**: ⚠️ Requieren instalación

### 4. Instrucciones Integradas
- Cada calendario no disponible muestra instrucciones de instalación
- Código de instalación copiable directamente

## 📱 Calendario CSS Grid Custom

Este es el único calendario que funciona **inmediatamente sin instalar nada**:

- Sin dependencias externas
- Peso mínimo
- Control total del diseño
- Totalmente responsivo
- Consume datos reales de la API

### Características visuales:

- Vista semanal (Lunes a Sábado)
- Horario de 8:00 a 21:00
- Eventos con colores según disponibilidad:
  - 🟣 Morado: Horarios normales
  - 🟢 Verde: Sección seleccionada
  - ⚫ Gris: Sin cupos disponibles
- Información de cada evento:
  - Nombre del profesor
  - Horario
  - Cupos disponibles

## 🔧 Activar Otros Calendarios

Para activar los otros 3 calendarios, sigue estos pasos:

### 1. Instalar dependencias

#### Para @aldabil/react-scheduler:
```bash
npm install @aldabil/react-scheduler
```

#### Para react-big-calendar:
```bash
npm install react-big-calendar moment
```

En tu `App.jsx` o `main.jsx`:
```jsx
import 'react-big-calendar/lib/css/react-big-calendar.css';
```

#### Para @schedule-x/calendar:
```bash
npm install @schedule-x/react @schedule-x/calendar @schedule-x/theme-default @schedule-x/events-service temporal-polyfill
```

En tu `App.jsx` o `main.jsx`:
```jsx
import '@schedule-x/theme-default/dist/index.css';
```

### 2. Descomentar imports en AllCalendarsView.jsx

Abre `src/components/Enrollment/AllCalendarsView.jsx` y descomenta las líneas 7-9:

```jsx
// ANTES:
// import ScheduleSelectorBigCalendar from './examples/ScheduleSelector_BigCalendar';
// import ScheduleSelectorReactScheduler from './examples/ScheduleSelector_ReactScheduler';
// import ScheduleSelectorScheduleX from './examples/ScheduleSelector_ScheduleX';

// DESPUÉS:
import ScheduleSelectorBigCalendar from './examples/ScheduleSelector_BigCalendar';
import ScheduleSelectorReactScheduler from './examples/ScheduleSelector_ReactScheduler';
import ScheduleSelectorScheduleX from './examples/ScheduleSelector_ScheduleX';
```

### 3. Actualizar el array de calendars

En el mismo archivo, actualiza el array `calendars` (líneas ~40-80):

```jsx
{
  id: 'react-scheduler',
  name: '@aldabil/react-scheduler',
  description: 'Moderno y fácil de usar',
  component: ScheduleSelectorReactScheduler,  // ← Cambiar de null a esto
  available: true,  // ← Cambiar a true
  installCmd: 'npm install @aldabil/react-scheduler',
  color: '#f59e0b'
},
// Repite para los otros dos calendarios
```

### 4. Reinicia el servidor

```bash
npm run dev
```

## 🎯 Flujo de Usuario

1. El estudiante ve el paso 2 del formulario (Horario)
2. Ve el calendario CSS Grid Custom expandido por defecto
3. Puede hacer clic en los eventos del calendario para seleccionar una sección
4. Al seleccionar, aparece un banner verde con la información
5. Puede expandir otros calendarios (si están instalados) para comparar
6. La selección se mantiene al cambiar entre calendarios
7. Hace clic en "Continuar" para ir al siguiente paso

## 🐛 Solución de Problemas

### El calendario no muestra eventos

**Causa**: `selectedCourse` no tiene secciones o las secciones no tienen schedule

**Solución**: Verifica en la consola del navegador:
```javascript
console.log('Curso seleccionado:', selectedCourse);
console.log('Secciones:', selectedCourse.sections);
console.log('Horarios:', selectedCourse.sections[0].schedule);
```

### Los estilos se ven mal

**Causa**: El CSS no se está importando correctamente

**Solución**: Asegúrate de que `AllCalendarsView.css` se importa en `AllCalendarsView.jsx`

### Error "Cannot read property 'map' of undefined"

**Causa**: `selectedCourse.sections` es undefined

**Solución**: El componente ya valida esto, pero verifica que la API esté retornando los datos correctamente

## 📚 Recursos Adicionales

- **README.md** en `examples/` - Comparación detallada de cada calendario
- **QUICKSTART.md** en `examples/` - Guía rápida de inicio
- **Componentes de ejemplo** en `examples/` - Código fuente de cada calendario

## 🎨 Personalización

Para personalizar los colores y estilos, edita:

- **AllCalendarsView.css** - Estilos del contenedor principal
- **ScheduleSelector_CustomGrid.css** - Estilos del calendario CSS Grid

### Ejemplo: Cambiar colores del calendario

En `ScheduleSelector_CustomGrid.css`:

```css
.schedule-event {
  /* Cambiar el gradiente de los eventos */
  background: linear-gradient(135deg, #tu-color-1 0%, #tu-color-2 100%);
}

.schedule-event.selected {
  /* Cambiar el color de selección */
  background: linear-gradient(135deg, #tu-color-verde-1 0%, #tu-color-verde-2 100%);
}
```

## ✅ Checklist de Integración

- [ ] Cambié el import en EnrollmentForm.jsx
- [ ] Probé que el calendario se vea correctamente
- [ ] Probé que puedo seleccionar una sección
- [ ] Probé que el banner de selección aparece
- [ ] Probé que puedo continuar al siguiente paso
- [ ] (Opcional) Instalé calendarios adicionales
- [ ] (Opcional) Personalicé los colores y estilos

## 🚀 ¡Listo!

Tu formulario ahora muestra todos los calendarios consumiendo datos reales de la API. El estudiante puede visualizar y seleccionar horarios de manera intuitiva.

Si tienes algún problema, revisa la consola del navegador para ver logs detallados de los datos que se están consumiendo.
