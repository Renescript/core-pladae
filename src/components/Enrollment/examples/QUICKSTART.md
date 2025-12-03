# Guía Rápida de Inicio

## Ver el Demo AHORA (sin instalaciones)

Para ver el ejemplo de calendario CSS Grid Custom inmediatamente:

### Paso 1: Agrega la ruta del demo

Abre tu archivo `src/App.jsx` y agrega:

```jsx
import CalendarDemo from './components/Enrollment/examples/CalendarDemo';

// En tu componente App o router, agrega:
<CalendarDemo />
```

### Paso 2: Accede al demo

Ve a la ruta donde añadiste el componente y verás el calendario funcionando con datos de ejemplo.

---

## Integrar en tu Formulario de Inscripción

### Opción 1: CSS Grid Custom (Sin instalaciones)

1. En tu archivo donde usas `ScheduleSelector`, cambia el import:

```jsx
// Antes:
import ScheduleSelector from './components/Enrollment/ScheduleSelector';

// Después:
import ScheduleSelector from './components/Enrollment/examples/ScheduleSelector_CustomGrid';
```

2. Asegúrate de que el CSS se importe correctamente. El componente ya lo importa automáticamente.

3. ¡Listo! Ya tienes un calendario funcional.

---

## Probar Otros Calendarios

### Para @aldabil/react-scheduler:

```bash
npm install @aldabil/react-scheduler
```

Luego cambia el import:
```jsx
import ScheduleSelector from './components/Enrollment/examples/ScheduleSelector_ReactScheduler';
```

### Para react-big-calendar:

```bash
npm install react-big-calendar moment
```

En tu `App.jsx` o `index.jsx`:
```jsx
import 'react-big-calendar/lib/css/react-big-calendar.css';
```

Luego cambia el import:
```jsx
import ScheduleSelector from './components/Enrollment/examples/ScheduleSelector_BigCalendar';
```

### Para @schedule-x/calendar:

```bash
npm install @schedule-x/react @schedule-x/calendar @schedule-x/theme-default @schedule-x/events-service temporal-polyfill
```

En tu `App.jsx` o `index.jsx`:
```jsx
import '@schedule-x/theme-default/dist/index.css';
```

Luego cambia el import:
```jsx
import ScheduleSelector from './components/Enrollment/examples/ScheduleSelector_ScheduleX';
```

---

## Verificar que tus datos son compatibles

Todos los ejemplos esperan que `selectedCourse` tenga esta estructura:

```javascript
{
  id: 1,
  title: "Nombre del Curso",
  sections: [
    {
      id: 1,
      teacher_name: "Nombre del Profesor",
      available_places: 10,
      places: 15,
      start_date: "2025-11-10",
      end_date: "2025-12-31",
      schedule: [
        {
          id: 1,
          day: "Lunes",  // O "Martes", "Miércoles", etc.
          time: "10:00 - 12:00"  // Formato HH:MM - HH:MM
        }
      ]
    }
  ]
}
```

Según los datos que me compartiste, tu estructura ya es compatible. Solo asegúrate de que:
- `sections` es un array
- Cada sección tiene un `schedule` array
- Cada item en `schedule` tiene `day` y `time`

---

## Solución de Problemas

### El calendario no muestra eventos:
- Verifica que `selectedCourse.sections` no esté vacío
- Verifica que cada sección tenga un `schedule` array
- Abre la consola del navegador para ver errores

### Los estilos se ven mal:
- Asegúrate de importar los CSS necesarios
- Para Custom Grid, el CSS ya está importado en el componente
- Para otras librerías, verifica que importaste sus CSS globalmente

### Error de dependencias:
- Ejecuta `npm install` de las librerías que quieras probar
- Reinicia el servidor de desarrollo: `npm run dev`

---

## Próximos Pasos

1. Prueba el demo con `CalendarDemo`
2. Elige el calendario que más te guste
3. Reemplaza tu `ScheduleSelector` actual
4. Personaliza los estilos según tu diseño
5. ¡Disfruta tu nuevo calendario!

---

## Necesitas Ayuda?

Lee el archivo completo `README.md` en este mismo directorio para más detalles sobre cada opción.
