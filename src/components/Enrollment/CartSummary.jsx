import { useState, useMemo, useEffect } from 'react';

const formatPrice = (price) => {
  if (!price) return '';
  return '$' + price.toLocaleString('es-CL');
};

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAY_NAMES = { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado' };

const MiniCalendar = ({ classDates, selectedSchedules, durationMonths, weeklyPlan }) => {
  const previewDates = useMemo(() => {
    if (classDates.length > 0) return [];
    if (!durationMonths) return [];
    const schedules = (selectedSchedules || []).filter(s => s.date && s.dayOfWeek);
    if (schedules.length === 0) return [];

    const totalClasses = weeklyPlan?.number_of_classes
      ? weeklyPlan.number_of_classes * durationMonths
      : schedules.length * 4 * durationMonths;
    const classesPerDay = Math.ceil(totalClasses / schedules.length);

    const preview = [];
    const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };

    schedules.forEach(s => {
      const start = new Date(s.date + 'T00:00:00');
      const targetDay = dayMap[s.dayOfWeek];
      let count = 0;
      let current = new Date(start);
      while (count < classesPerDay) {
        if (current.getDay() === targetDay) {
          preview.push(current.toISOString().split('T')[0]);
          count++;
        }
        current.setDate(current.getDate() + 1);
      }
    });

    return preview;
  }, [classDates, selectedSchedules, durationMonths, weeklyPlan]);

  const displayDates = classDates.length > 0 ? classDates : previewDates;
  const startDatesSet = useMemo(() => new Set((selectedSchedules || []).map(s => s.date).filter(Boolean)), [selectedSchedules]);

  const [viewMonth, setViewMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  useEffect(() => {
    const firstDate = displayDates[0] || [...startDatesSet][0];
    if (firstDate) {
      const d = new Date(firstDate + 'T00:00:00');
      setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }, [displayDates, startDatesSet]);

  const displayDatesSet = useMemo(() => new Set(displayDates), [displayDates]);

  const days = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const result = [];
    for (let i = startDay - 1; i >= 0; i--) {
      result.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      result.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remaining = 7 - (result.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        result.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
      }
    }
    return result;
  }, [viewMonth]);

  return (
    <div className="cart-calendar">
      <div className="cart-calendar-nav">
        <button type="button" onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}>‹</button>
        <span>{MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}</span>
        <button type="button" onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}>›</button>
      </div>
      <div className="cart-calendar-weekdays">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="cart-calendar-days">
        {days.map((dayObj, i) => {
          const dateStr = dayObj.date.toISOString().split('T')[0];
          const isClass = dayObj.isCurrentMonth && displayDatesSet.has(dateStr);
          const isStart = dayObj.isCurrentMonth && startDatesSet.has(dateStr);
          return (
            <div
              key={i}
              className={`cart-cal-day ${!dayObj.isCurrentMonth ? 'other' : ''} ${isClass ? 'has-class' : ''} ${isStart && !isClass ? 'is-start' : ''}`}
            >
              {dayObj.date.getDate()}
            </div>
          );
        })}
      </div>
      {displayDates.length === 0 && !startDatesSet.size && (
        <p className="cart-calendar-empty">Las fechas de tus clases aparecerán aquí</p>
      )}
    </div>
  );
};

// Resumen compacto de un curso completado — mismo estilo que cart-items
const CompletedCourseCard = ({ enrollment }) => {
  const info = enrollment._displayInfo;
  if (!info) return null;

  return (
    <div className="cart-items">
      <div className="cart-item filled">
        <span className="cart-item-label">Curso</span>
        <span className="cart-item-value">{info.technique}</span>
      </div>
      <div className="cart-item filled">
        <span className="cart-item-label">Frecuencia</span>
        <span className="cart-item-value">{info.frequency}x por semana</span>
      </div>
      {info.schedules?.length > 0 && (
        <div className="cart-item filled">
          <span className="cart-item-label">Horarios</span>
          <div className="cart-schedules">
            {info.schedules.map((s, i) => (
              <span key={i} className="cart-schedule-chip">
                {DAY_NAMES[s.dayOfWeek] || s.dayOfWeek} {s.timeSlot}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="cart-item filled">
        <span className="cart-item-label">Duración</span>
        <span className="cart-item-value">
          {info.durationMonths} mes{info.durationMonths > 1 ? 'es' : ''}
          {info.totalClasses > 0 && ` · ${info.totalClasses} clases`}
        </span>
      </div>
      {info.priceInfo?.finalPrice > 0 && (
        <div className="cart-item filled">
          <span className="cart-item-label">Total</span>
          <span className="cart-item-value">{formatPrice(info.priceInfo.finalPrice)}</span>
        </div>
      )}
    </div>
  );
};

// Items del curso actual (sin calendario ni precio — se renderizan aparte)
const CurrentItems = ({ technique, frequency, selectedSchedules, durationMonths, classDates }) => (
  <div className="cart-items">
    <div className={`cart-item ${technique ? 'filled' : ''}`}>
      <span className="cart-item-label">Curso</span>
      <span className="cart-item-value">{technique?.name || 'Por seleccionar'}</span>
    </div>

    <div className={`cart-item ${frequency ? 'filled' : ''}`}>
      <span className="cart-item-label">Frecuencia</span>
      <span className="cart-item-value">{frequency ? `${frequency}x por semana` : 'Por seleccionar'}</span>
    </div>

    <div className={`cart-item ${selectedSchedules?.length ? 'filled' : ''}`}>
      <span className="cart-item-label">Horarios</span>
      {selectedSchedules?.length > 0 ? (
        <div className="cart-schedules">
          {selectedSchedules.map((s, i) => (
            <span key={i} className="cart-schedule-chip">
              {DAY_NAMES[s.dayOfWeek] || s.dayOfWeek} {s.timeSlot}
            </span>
          ))}
        </div>
      ) : (
        <span className="cart-item-value">Por seleccionar</span>
      )}
    </div>

    <div className={`cart-item ${durationMonths ? 'filled' : ''}`}>
      <span className="cart-item-label">Duración</span>
      <span className="cart-item-value">
        {durationMonths ? `${durationMonths} mes${durationMonths > 1 ? 'es' : ''}` : 'Por seleccionar'}
      </span>
    </div>

    {classDates?.length > 0 && (
      <div className="cart-item filled">
        <span className="cart-item-label">Total clases</span>
        <span className="cart-item-value">{classDates.length} clases</span>
      </div>
    )}
  </div>
);

const PriceSection = ({ priceInfo }) => {
  if (!priceInfo?.finalPrice) return null;
  return (
    <div className="cart-total">
      {priceInfo.discountPercent > 0 && (
        <div className="cart-discount">
          <span>Subtotal</span>
          <span>{formatPrice(priceInfo.subtotal)}</span>
        </div>
      )}
      {priceInfo.discountPercent > 0 && (
        <div className="cart-discount">
          <span>Descuento ({priceInfo.discountPercent}%)</span>
          <span>-{formatPrice(priceInfo.discountAmount)}</span>
        </div>
      )}
      <div className="cart-final-price">
        <span>Total</span>
        <span>{formatPrice(priceInfo.finalPrice)}</span>
      </div>
    </div>
  );
};

const CartSummary = ({ technique, weeklyPlan, frequency, selectedSchedules, durationMonths, classDates, priceInfo, completedEnrollments = [], embedded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const itemCount = [technique, frequency, selectedSchedules?.length, durationMonths].filter(Boolean).length + completedEnrollments.length;

  const hasCompleted = completedEnrollments.length > 0;

  // Orden: cursos completados → curso actual (items) → precio → calendario
  const content = (
    <>
      {hasCompleted && completedEnrollments.map((enrollment, i) => (
        <div key={i}>
          <span className="cart-section-label">
            {completedEnrollments.length > 1 ? `Curso ${i + 1}` : 'Curso anterior'}
          </span>
          <CompletedCourseCard enrollment={enrollment} />
        </div>
      ))}

      {hasCompleted && <span className="cart-section-label cart-section-label--active">Curso actual</span>}

      <CurrentItems
        technique={technique}
        frequency={frequency}
        selectedSchedules={selectedSchedules}
        durationMonths={durationMonths}
        classDates={classDates}
      />

      <PriceSection priceInfo={priceInfo} />

      <MiniCalendar
        classDates={classDates || []}
        selectedSchedules={selectedSchedules}
        durationMonths={durationMonths}
        weeklyPlan={weeklyPlan}
      />
    </>
  );

  if (embedded) {
    return (
      <div className="cart-embedded">
        <h3 className="cart-embedded-title">Tu inscripción</h3>
        <p className="cart-embedded-subtitle">Resumen de lo que llevas seleccionado</p>
        {content}
      </div>
    );
  }

  return (
    <>
      <button className="cart-fab" onClick={() => setIsOpen(true)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        {itemCount > 0 && <span className="cart-fab-badge">{itemCount}</span>}
      </button>

      {isOpen && <div className="cart-overlay" onClick={() => setIsOpen(false)} />}

      <div className={`cart-panel ${isOpen ? 'open' : ''}`}>
        <div className="cart-panel-header">
          <div>
            <h3>Tu inscripción</h3>
            <p className="cart-embedded-subtitle">Resumen de lo que llevas seleccionado</p>
          </div>
          <button className="cart-close" onClick={() => setIsOpen(false)}>×</button>
        </div>
        <div className="cart-panel-body">
          {content}
        </div>
      </div>
    </>
  );
};

export default CartSummary;
