import { useState, useEffect, useMemo } from 'react';
import { getSectionCalendar } from '../../services/api';
import { singleClassPrice } from './singleClassPrice';

// Clases sueltas: se eligen libremente los días (y horarios) del taller, una por una.
// Cada clase se cobra aparte al precio del plan (el de sábado si está definido).

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LONG = {
  sunday: 'Domingo', monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
  thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado'
};

const toIso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatPrice = (n) => '$' + Number(n || 0).toLocaleString('es-CL');

const formatDay = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });


const SingleClassPicker = ({ technique, weeklyPlan, initialPicks = [], onContinue, onBack }) => {
  const [availability, setAvailability] = useState({}); // { [sectionId]: { [date]: { available, total } } }
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const first = initialPicks[0]?.date;
    return first ? new Date(first + 'T00:00:00') : new Date();
  });
  const [activeDate, setActiveDate] = useState(null);
  const [picks, setPicks] = useState(initialPicks); // [{ date, sectionId, timeSlot, dayOfWeek, teacher }]

  useEffect(() => {
    if (!technique?.schedules?.length) return;
    let cancelled = false;
    setLoading(true);
    Promise.all(
      technique.schedules.map(s =>
        getSectionCalendar(s.section.id)
          .then(dates => ({ id: s.section.id, dates }))
          .catch(() => ({ id: s.section.id, dates: [] }))
      )
    ).then(results => {
      if (cancelled) return;
      const map = {};
      results.forEach(({ id, dates }) => {
        map[id] = {};
        dates.forEach(d => { map[id][d.date] = { available: d.available_places, total: d.total_places }; });
      });
      setAvailability(map);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [technique]);

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  // Horarios del taller que se dictan en una fecha (con sus cupos de ese día).
  const slotsFor = (iso) => {
    const dayName = DAY_KEYS[new Date(iso + 'T00:00:00').getDay()];
    return (technique?.schedules || [])
      .filter(s => s.day === dayName && availability[s.section.id]?.[iso])
      .map(s => ({
        sectionId: s.section.id,
        timeSlot: s.timeSlot,
        teacher: s.teacher,
        dayOfWeek: dayName,
        ...availability[s.section.id][iso]
      }))
      .sort((a, b) => (a.timeSlot || '').localeCompare(b.timeSlot || ''));
  };

  const isPicked = (iso, sectionId) => picks.some(p => p.date === iso && p.sectionId === sectionId);
  const pickedDates = useMemo(() => new Set(picks.map(p => p.date)), [picks]);

  const togglePick = (iso, slot) => {
    if (isPicked(iso, slot.sectionId)) {
      setPicks(picks.filter(p => !(p.date === iso && p.sectionId === slot.sectionId)));
      return;
    }
    if (slot.available === 0) return;
    setPicks([...picks, { date: iso, sectionId: slot.sectionId, timeSlot: slot.timeSlot, dayOfWeek: slot.dayOfWeek, teacher: slot.teacher }]);
  };

  const handleDayClick = (iso) => {
    setActiveDate(iso);
    // Si ese día hay un solo horario, se marca/desmarca de una (un toque = una clase).
    const slots = slotsFor(iso);
    if (slots.length === 1) togglePick(iso, slots[0]);
  };

  const sortedPicks = useMemo(
    () => [...picks].sort((a, b) => a.date.localeCompare(b.date) || (a.timeSlot || '').localeCompare(b.timeSlot || '')),
    [picks]
  );
  const total = picks.reduce((sum, p) => sum + singleClassPrice(weeklyPlan, p.dayOfWeek), 0);

  const days = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const first = new Date(y, m, 1);
    const offset = (first.getDay() + 6) % 7; // lunes primero
    const cells = [];
    for (let i = offset; i > 0; i--) cells.push({ date: new Date(y, m, 1 - i), inMonth: false });
    const last = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= last; d++) cells.push({ date: new Date(y, m, d), inMonth: true });
    while (cells.length % 7) cells.push({ date: new Date(y, m + 1, cells.length - offset - last + 1), inMonth: false });
    return cells;
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const activeSlots = activeDate ? slotsFor(activeDate) : [];
  const unitPrice = weeklyPlan?.price || 0;
  const satPrice = weeklyPlan?.saturday_price;

  return (
    <div className="step-container single-picker">
      <div className="step-header">
        <h2>Elige tus clases sueltas</h2>
        <p className="step-description">
          Toca en el calendario <strong>cada día que quieras venir</strong>. Puedes elegir los que quieras, en cualquier horario del taller.
          Cada clase cuesta <strong>{formatPrice(unitPrice)}</strong>{satPrice && satPrice !== unitPrice ? ` (sábados ${formatPrice(satPrice)})` : ''}.
        </p>
      </div>

      <div className="datetime-grid">
        <div className="calendar-section">
          <h3>Días con clases</h3>
          <div className="calendar-nav">
            <button type="button" aria-label="Mes anterior" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>←</button>
            <span>{monthName}</span>
            <button type="button" aria-label="Mes siguiente" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>→</button>
          </div>
          <div className="calendar-weekdays">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="calendar-days">
            {days.map(({ date, inMonth }) => {
              const iso = toIso(date);
              const hasClass = inMonth && date >= today && slotsFor(iso).length > 0;
              const picked = pickedDates.has(iso);
              return (
                <button
                  key={iso + (inMonth ? '' : '-o')}
                  type="button"
                  className={`calendar-day ${!inMonth ? 'other-month' : ''} ${hasClass ? 'available' : ''} ${picked && inMonth ? 'selected' : ''} ${activeDate === iso && inMonth ? 'single-active' : ''}`}
                  disabled={!hasClass}
                  aria-pressed={picked}
                  onClick={() => handleDayClick(iso)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          {loading && <p className="timeslot-hint">Cargando días…</p>}
        </div>

        <div className={`timeslots-section ${activeDate ? 'active' : 'disabled'}`}>
          <h3>{activeDate ? formatDay(activeDate) : 'Horario'}</h3>
          {!activeDate && <p className="timeslot-hint">Toca un día del calendario para agregarlo.</p>}
          {activeDate && activeSlots.length > 0 && (
            <div className="timeslots-list">
              {activeSlots.map(slot => {
                const picked = isPicked(activeDate, slot.sectionId);
                const full = slot.available === 0 && !picked;
                return (
                  <button
                    key={slot.sectionId}
                    type="button"
                    className={`timeslot-btn ${picked ? 'selected' : ''} ${full ? 'full' : ''}`}
                    disabled={full}
                    aria-pressed={picked}
                    onClick={() => togglePick(activeDate, slot)}
                  >
                    <span className="timeslot-main">{picked ? '✓ ' : '+ '}{slot.timeSlot?.replace('-', ' – ')} · {slot.teacher}</span>
                    <span className="timeslot-cupos">{full ? 'Sin cupos' : picked ? 'Agregada (toca para quitar)' : `${slot.available}/${slot.total} cupos`}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="single-summary" aria-live="polite">
        <div className="single-summary-head">
          <strong>{picks.length === 0 ? 'Aún no eliges clases' : `${picks.length} ${picks.length === 1 ? 'clase' : 'clases'} · ${formatPrice(total)}`}</strong>
        </div>
        {sortedPicks.length > 0 && (
          <ul className="single-list">
            {sortedPicks.map(p => (
              <li key={p.date + p.sectionId}>
                <span>{formatDay(p.date)} · {p.timeSlot?.replace('-', ' – ')}</span>
                <button type="button" className="single-remove" aria-label={`Quitar ${formatDay(p.date)}`}
                  onClick={() => setPicks(picks.filter(x => x !== p))}>Quitar</button>
              </li>
            ))}
          </ul>
        )}
        <p className="single-note">Las clases sueltas no tienen recuperación: si faltas, la clase se pierde.</p>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>Volver</button>
        <button
          type="button"
          className="btn-primary"
          disabled={picks.length === 0}
          onClick={() => onContinue(sortedPicks)}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default SingleClassPicker;
