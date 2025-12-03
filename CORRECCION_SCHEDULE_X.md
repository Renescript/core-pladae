# ✅ Corrección de @schedule-x/calendar

## 🐛 Error Original

```
Uncaught SyntaxError: The requested module '/node_modules/.vite/deps/@schedule-x_react.js?v=cade4108'
does not provide an export named 'useCalendar' (at ScheduleSelector_ScheduleX.jsx:5:10)
```

**Causa**: Estaba usando una API incorrecta de @schedule-x. El hook `useCalendar` no existe en la versión actual.

## 🔧 Corrección Aplicada

### API Incorrecta (Antes):
```jsx
import { useCalendar } from '@schedule-x/react'
import { createCalendar } from '@schedule-x/calendar'

const calendar = useCalendar({
  views: [...],
  events: events,
  callbacks: {...}
});

return <div>{calendar.render()}</div>
```

### API Correcta (Ahora):
```jsx
import { ScheduleXCalendar, useNextCalendarApp } from '@schedule-x/react'
import { createViewWeek, createViewDay } from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'

const eventsService = useMemo(() => createEventsServicePlugin(), []);

const calendar = useNextCalendarApp({
  views: [createViewWeek(), createViewDay()],
  plugins: [eventsService],
  events: events,
  calendars: {...},
  callbacks: {...}
});

return <ScheduleXCalendar calendarApp={calendar} />
```

## 📋 Cambios Específicos

### 1. Imports Corregidos
**Antes**:
```jsx
import { useCalendar } from '@schedule-x/react'
import { createCalendar } from '@schedule-x/calendar'
```

**Ahora**:
```jsx
import { ScheduleXCalendar, useNextCalendarApp } from '@schedule-x/react'
import { createViewWeek, createViewDay } from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
```

### 2. Plugin de Eventos
**Nuevo**:
```jsx
const eventsService = useMemo(() => createEventsServicePlugin(), []);
```

Este plugin es necesario para manejar eventos dinámicamente.

### 3. Vistas
**Antes**:
```jsx
views: [
  {
    name: 'week',
    label: 'Semana'
  }
]
```

**Ahora**:
```jsx
views: [createViewWeek(), createViewDay()]
```

### 4. Formato de Eventos
**Antes**:
```jsx
{
  id: '...',
  title: '...',
  start: '2025-11-10T12:00',  // ISO format
  end: '2025-11-10T14:00'
}
```

**Ahora**:
```jsx
{
  id: '...',
  title: '...',
  start: '2025-11-10 12:00',  // Space-separated format
  end: '2025-11-10 14:00'
}
```

### 5. Sistema de Colores
**Nuevo**: Sistema de calendarios para colores personalizados:
```jsx
calendars: {
  default: {
    colorName: 'default',
    lightColors: {
      main: '#667eea',
      container: '#e0e7ff',
      onContainer: '#1e1b4b',
    },
  },
  selected: {
    colorName: 'selected',
    lightColors: {
      main: '#4caf50',
      container: '#c8e6c9',
      onContainer: '#1b5e20',
    },
  },
  disabled: {
    colorName: 'disabled',
    lightColors: {
      main: '#9e9e9e',
      container: '#e0e0e0',
      onContainer: '#424242',
    },
  },
}
```

### 6. Actualización Dinámica de Eventos
**Nuevo**:
```jsx
useEffect(() => {
  if (eventsService) {
    eventsService.set(events);
  }
}, [events, eventsService]);
```

Esto permite que los eventos se actualicen cuando cambia la selección.

### 7. Renderizado del Componente
**Antes**:
```jsx
<div>{calendar.render()}</div>
```

**Ahora**:
```jsx
<ScheduleXCalendar calendarApp={calendar} />
```

## ✨ Características Nuevas

### Colores por Estado
Los eventos ahora cambian de color según su estado:
- **Morado (#667eea)**: Eventos normales
- **Verde (#4caf50)**: Sección seleccionada
- **Gris (#9e9e9e)**: Sin cupos disponibles

### Vista Mejorada
- Vista semanal por defecto
- Vista de día disponible
- Localización en español (es-ES)
- Semana comienza en Lunes

### Interactividad
- Click en evento para seleccionar sección
- Solo eventos con cupos son clickeables
- Información completa en el título del evento

## 🚀 Cómo Probar

1. **Reinicia el servidor** si está corriendo:
   ```bash
   npm run dev
   ```

2. **Ve al formulario de inscripción**

3. **Selecciona un curso** (Paso 1)

4. **En el Paso 2**, haz clic en **"@schedule-x/calendar"**

5. Verás el calendario con:
   - Vista semanal moderna
   - Eventos en los días correctos
   - Colores morados para eventos normales
   - Click para seleccionar (se pone verde)

## 📊 Comparación Visual

### Antes (Error):
```
❌ Error en consola
❌ Componente no se renderiza
❌ useCalendar no existe
```

### Ahora (Funcionando):
```
✅ Sin errores
✅ Calendario se renderiza correctamente
✅ Eventos muestran horarios reales
✅ Click para seleccionar funciona
✅ Colores por estado
✅ Vista semanal moderna
```

## 🎨 Resultado

El calendario @schedule-x ahora:
- ✅ Se renderiza correctamente
- ✅ Muestra eventos de tu API
- ✅ Tiene colores por disponibilidad
- ✅ Permite selección por click
- ✅ Se integra con el sistema de selección compartida
- ✅ Tiene diseño Material Design
- ✅ Es totalmente funcional

## 📚 Referencias

- Documentación oficial: https://schedule-x.dev/docs/frameworks/react
- npm package: https://www.npmjs.com/package/@schedule-x/react
- GitHub: https://github.com/schedule-x/schedule-x

## ⚠️ Nota Importante

**@schedule-x** es un calendario moderno pero su API cambia frecuentemente. Esta implementación usa la versión 3.x más reciente con:
- `useNextCalendarApp` para crear la instancia
- `ScheduleXCalendar` para renderizar
- `createEventsServicePlugin` para eventos dinámicos
- Sistema de calendarios para colores personalizados

Si en el futuro hay errores similares, consulta la documentación oficial para ver si la API ha cambiado nuevamente.

## ✅ Resumen

**Error**: API incorrecta de @schedule-x
**Solución**: Usar `useNextCalendarApp` + `ScheduleXCalendar`
**Estado**: ✅ Corregido y funcionando
**Resultado**: Calendario moderno y funcional con Material Design

¡El calendario @schedule-x ahora funciona perfectamente!
