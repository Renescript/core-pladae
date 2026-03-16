import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCoursesSchedulesGrid } from '../../services/api';

const WEEK_DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
];

const Schedule = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('monday');

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

  const timeSlots = useMemo(() => {
    const slots = new Set();
    courses.forEach(c => c.schedules?.forEach(s => slots.add(s.timeSlot)));
    return Array.from(slots).sort((a, b) => a.split('-')[0].localeCompare(b.split('-')[0]));
  }, [courses]);

  const getClassesAt = (day, timeSlot) => {
    const classes = [];
    courses.forEach(course => {
      course.schedules?.forEach(s => {
        if (s.day === day && s.timeSlot === timeSlot) {
          classes.push({ ...s, name: course.name, color: course.color });
        }
      });
    });
    return classes;
  };

  if (loading) {
    return (
      <section className="schedule-section">
        <div className="schedule-container">
          <div className="schedule-header">
            <p className="schedule-label">HORARIOS</p>
            <h2 className="schedule-title">Nuestro Calendario</h2>
          </div>
          <div className="schedule-loading">Cargando horarios...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="schedule-section">
      <div className="schedule-container">
        <div className="schedule-top">
          <div className="schedule-header">
            <p className="schedule-label">HORARIOS</p>
            <h2 className="schedule-title">Nuestro Calendario</h2>
            <p className="schedule-subtitle">
              Encuentra el horario que mejor se adapte a ti
            </p>
          </div>
          <button className="schedule-cta" onClick={() => navigate('/inscripcion')}>
            Inscríbete ahora
          </button>
        </div>

        {/* Desktop grid */}
        <div className="schedule-grid-desktop">
          <div className="schedule-grid">
            <div className="schedule-grid-header">
              <div className="schedule-grid-corner"></div>
              {WEEK_DAYS.map(day => (
                <div key={day.key} className="schedule-grid-day">{day.label}</div>
              ))}
            </div>
            <div className="schedule-grid-body">
              {timeSlots.map(timeSlot => (
                <div key={timeSlot} className="schedule-grid-row">
                  <div className="schedule-grid-time">{timeSlot}</div>
                  {WEEK_DAYS.map(day => {
                    const classes = getClassesAt(day.key, timeSlot);
                    return (
                      <div key={`${day.key}-${timeSlot}`} className="schedule-grid-cell">
                        {classes.map((cls, idx) => (
                          <div
                            key={idx}
                            className="schedule-grid-class"
                            style={{ backgroundColor: cls.color }}
                          >
                            {cls.name}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="schedule-grid-mobile">
          <div className="schedule-tabs">
            {WEEK_DAYS.map(day => (
              <button
                key={day.key}
                className={`schedule-tab ${activeDay === day.key ? 'active' : ''}`}
                onClick={() => setActiveDay(day.key)}
              >
                {day.label.slice(0, 3)}
              </button>
            ))}
          </div>
          <div className="schedule-tab-content">
            {(() => {
              const dayClasses = [];
              timeSlots.forEach(timeSlot => {
                getClassesAt(activeDay, timeSlot).forEach(cls => {
                  dayClasses.push({ ...cls, timeSlot });
                });
              });
              if (dayClasses.length === 0) {
                return <div className="schedule-tab-empty">No hay clases este día</div>;
              }
              return dayClasses.map((cls, idx) => (
                <div key={idx} className="schedule-tab-class" style={{ borderLeftColor: cls.color }}>
                  <span className="schedule-tab-time">{cls.timeSlot}</span>
                  <span className="schedule-tab-name" style={{ color: cls.color }}>{cls.name}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Schedule;
