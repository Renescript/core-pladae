import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCoursesSchedulesGrid } from '../../services/api';
import './HorariosGrid.css';

const WEEK_DAYS = [
  { key: 'monday', short: 'Lunes' },
  { key: 'tuesday', short: 'Martes' },
  { key: 'wednesday', short: 'Miércoles' },
  { key: 'thursday', short: 'Jueves' },
  { key: 'friday', short: 'Viernes' },
  { key: 'saturday', short: 'Sábado' },
];

// Colores coherentes con el mockup — mapeo por título del curso.
const COLOR_BY_TITLE = {
  'Óleo y Acrílico': '#d97a3c',
  'Acuarela / Ilustración - Dibujo': '#3fa9a1',
  'Cerámica - Escultura': '#c25b3f',
  'Arte infantil': '#7a5cc9',
  'Cómic': '#2f4f8a',
};

const getCourseColor = (title) => COLOR_BY_TITLE[title] || '#4a5568';

// Todas las franjas horarias que aparecen en los cursos, ordenadas.
const collectTimeSlots = (courses) => {
  const slots = new Set();
  courses.forEach((c) => c.schedules.forEach((s) => slots.add(s.timeSlot)));
  return Array.from(slots).sort((a, b) => {
    const ah = parseInt(a.split(':')[0], 10);
    const bh = parseInt(b.split(':')[0], 10);
    return ah - bh;
  });
};

const findClassIn = (course, day, timeSlot) =>
  course.schedules.find((s) => s.day === day && s.timeSlot === timeSlot);

const SalonGrid = ({ title, subtitle, courses }) => {
  const timeSlots = useMemo(() => collectTimeSlots(courses), [courses]);

  return (
    <div className="salon-block">
      <div className="salon-heading">
        <h3 className="salon-title">{title}</h3>
        <p className="salon-subtitle">{subtitle}</p>
      </div>

      <div className="salon-grid-wrap">
        <table className="salon-grid">
          <thead>
            <tr>
              <th className="salon-corner" aria-label="Horario" />
              {WEEK_DAYS.map((d) => (
                <th key={d.key} className="salon-day-header">
                  {d.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot) => (
              <tr key={slot}>
                <th className="salon-time">{slot.replace('-', ' - ')}</th>
                {WEEK_DAYS.map((d) => {
                  const matches = courses
                    .map((c) => ({ course: c, cls: findClassIn(c, d.key, slot) }))
                    .filter((m) => m.cls);
                  return (
                    <td key={d.key} className="salon-cell">
                      {matches.length === 0 ? (
                        <span className="salon-empty">—</span>
                      ) : (
                        matches.map(({ course }) => (
                          <span
                            key={course.id}
                            className="salon-class"
                            style={{ backgroundColor: getCourseColor(course.name) }}
                          >
                            {course.name.toUpperCase()}
                          </span>
                        ))
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const HorariosGrid = ({ onVerTarifas, onInscribirse, showActions = true }) => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCoursesSchedulesGrid();
        setCourses(data);
      } catch (err) {
        console.error('Error al cargar horarios:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const { salonA, salonB } = useMemo(() => {
    const isSalonA = (c) => c.name.toLowerCase().includes('óleo');
    return {
      salonA: courses.filter(isSalonA),
      salonB: courses.filter((c) => !isSalonA(c)),
    };
  }, [courses]);

  const handleVerTarifas = () => {
    if (onVerTarifas) return onVerTarifas();
    navigate('/precios');
  };

  const handleInscribirse = () => {
    if (onInscribirse) return onInscribirse();
    navigate('/inscripcion');
  };

  return (
    <section className="horarios-section">
      <div className="horarios-container">
        <header className="horarios-header">
          <h2 className="horarios-title">HORARIOS</h2>
          <p className="horarios-subtitle">— ACADEMIA DE ARTES GUSTARTE —</p>
        </header>

        {loading ? (
          <p className="horarios-loading">Cargando horarios…</p>
        ) : (
          <>
            {salonA.length > 0 && (
              <SalonGrid title="SALÓN A" subtitle="ÓLEO Y ACRÍLICO" courses={salonA} />
            )}
            {salonB.length > 0 && (
              <SalonGrid title="SALÓN B" subtitle="TÉCNICAS DE MESA" courses={salonB} />
            )}
          </>
        )}

        {showActions && (
          <div className="horarios-actions">
            <button type="button" className="horarios-cta" onClick={handleVerTarifas}>
              VER TARIFAS
            </button>
            <button
              type="button"
              className="horarios-cta horarios-cta--primary"
              onClick={handleInscribirse}
            >
              INSCRIBIRSE
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default HorariosGrid;
