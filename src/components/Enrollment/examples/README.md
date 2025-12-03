# Ejemplos de Calendarios para ScheduleSelector

Este directorio contiene 4 ejemplos diferentes de calendarios para mostrar los horarios de las secciones de cursos.

## 📋 Tabla de Comparación

| Librería | Tamaño | Dificultad | Personalización | Características |
|----------|--------|------------|-----------------|-----------------|
| **CSS Grid Custom** | Muy liviano | Fácil | Alta | Control total, sin dependencias |
| **@aldabil/react-scheduler** | Ligero | Fácil | Media | Moderno, fácil de usar |
| **react-big-calendar** | Medio | Media | Alta | Muy popular, probado |
| **@schedule-x/calendar** | Medio | Media | Alta | Moderno, Material Design |

---

## 1️⃣ CSS Grid Custom (RECOMENDADO para tu caso)

### Ventajas:
- Sin dependencias adicionales
- Máximo control del diseño
- Más liviano
- Diseño optimizado para tu caso de uso específico

### Instalación:
```bash
# No requiere instalación adicional
```

### Uso:
```jsx
import ScheduleSelectorCustomGrid from './examples/ScheduleSelector_CustomGrid';

// Usar en lugar del componente actual
<ScheduleSelectorCustomGrid
  selectedCourse={selectedCourse}
  selectedSection={selectedSection}
  onSelectSection={onSelectSection}
/>
```

### Archivos:
- `ScheduleSelector_CustomGrid.jsx`
- `ScheduleSelector_CustomGrid.css`

---

## 2️⃣ @aldabil/react-scheduler

### Ventajas:
- Interfaz moderna y limpia
- Fácil de implementar
- Buena documentación

### Instalación:
```bash
npm install @aldabil/react-scheduler
```

### Uso:
```jsx
import ScheduleSelectorReactScheduler from './examples/ScheduleSelector_ReactScheduler';

<ScheduleSelectorReactScheduler
  selectedCourse={selectedCourse}
  selectedSection={selectedSection}
  onSelectSection={onSelectSection}
/>
```

### Archivos:
- `ScheduleSelector_ReactScheduler.jsx`

---

## 3️⃣ react-big-calendar

### Ventajas:
- Muy popular y bien mantenida
- Gran comunidad
- Muchos ejemplos disponibles
- Inspirada en Google Calendar

### Instalación:
```bash
npm install react-big-calendar moment
npm install moment # o date-fns, dayjs
```

### Configuración adicional:
En tu archivo principal (App.jsx o index.jsx):
```jsx
import 'react-big-calendar/lib/css/react-big-calendar.css';
```

### Uso:
```jsx
import ScheduleSelectorBigCalendar from './examples/ScheduleSelector_BigCalendar';

<ScheduleSelectorBigCalendar
  selectedCourse={selectedCourse}
  selectedSection={selectedSection}
  onSelectSection={onSelectSection}
/>
```

### Archivos:
- `ScheduleSelector_BigCalendar.jsx`

---

## 4️⃣ @schedule-x/calendar

### Ventajas:
- Moderna y actualizada (última actualización reciente)
- Material Design
- Soporte para dark mode
- Alternativa moderna a FullCalendar

### Instalación:
```bash
npm install @schedule-x/react @schedule-x/calendar @schedule-x/theme-default @schedule-x/events-service temporal-polyfill
```

### Configuración adicional:
```jsx
import '@schedule-x/theme-default/dist/index.css';
```

### Uso:
```jsx
import ScheduleSelectorScheduleX from './examples/ScheduleSelector_ScheduleX';

<ScheduleSelectorScheduleX
  selectedCourse={selectedCourse}
  selectedSection={selectedSection}
  onSelectSection={onSelectSection}
/>
```

### Archivos:
- `ScheduleSelector_ScheduleX.jsx`

---

## 🎯 Recomendación Final

Para tu caso específico de mostrar horarios de cursos con secciones, te recomiendo:

### **Opción 1: CSS Grid Custom** (MEJOR PARA TI)
- Es la más liviana
- Tienes control total del diseño
- Se ajusta perfectamente a tus datos
- No añade dependencias innecesarias

### **Opción 2: @aldabil/react-scheduler** (ALTERNATIVA RÁPIDA)
- Si quieres algo rápido y funcional
- Interfaz moderna out-of-the-box
- Fácil de implementar

### **Opción 3: react-big-calendar** (SI NECESITAS MÁS FEATURES)
- Si planeas añadir más funcionalidades de calendario en el futuro
- Gran comunidad y soporte

---

## 🧪 Cómo Probar los Ejemplos

1. Copia el ejemplo que quieras probar
2. Instala las dependencias necesarias (ver sección de instalación de cada uno)
3. Reemplaza el import en tu componente padre:

```jsx
// Antes
import ScheduleSelector from './components/Enrollment/ScheduleSelector';

// Después (ejemplo con Custom Grid)
import ScheduleSelector from './components/Enrollment/examples/ScheduleSelector_CustomGrid';
```

4. Verifica que el componente recibe los props correctos:
   - `selectedCourse`: Objeto del curso seleccionado con `sections` array
   - `selectedSection`: Sección actualmente seleccionada
   - `onSelectSection`: Función callback para seleccionar una sección

---

## 📊 Estructura de Datos Esperada

Todos los ejemplos esperan que `selectedCourse.sections` tenga esta estructura:

```javascript
{
  id: 1,
  title: "Nombre del Curso",
  sections: [
    {
      id: 1,
      teacher_name: "Profesor 1",
      available_places: 10,
      places: 15,
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

---

## 🎨 Personalización

Cada ejemplo incluye estilos básicos que puedes personalizar:

- **Custom Grid**: Modifica `ScheduleSelector_CustomGrid.css`
- **react-big-calendar**: Sobrescribe los estilos CSS de la librería
- **@aldabil/react-scheduler**: Usa las props de configuración
- **@schedule-x**: Personaliza con los temas disponibles

---

## 📝 Notas

- Todos los ejemplos son compatibles con React 19
- Los ejemplos usan los datos reales de tu API
- Puedes combinar características de diferentes ejemplos
- El código está comentado para facilitar la comprensión
