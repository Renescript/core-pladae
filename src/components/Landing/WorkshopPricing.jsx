import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWeeklyPlans } from '../../services/api';
import './WorkshopPricing.css';

const formatCLP = (value) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
    .format(value)
    .replace('CLP', '$')
    .trim();

const computeDiscount = (basePricePerClass, planPrice, numClasses) => {
  if (!basePricePerClass || !numClasses) return 0;
  const pricePerClass = planPrice / numClasses;
  const discount = 1 - pricePerClass / basePricePerClass;
  return Math.round(discount * 100);
};

const isNonMonthly = (plan) =>
  plan.event_type === 'trial' || plan.event_type === 'single';

const normalizeName = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

const DAY_TO_KEY = {
  lunes: 'monday',
  martes: 'tuesday',
  miercoles: 'wednesday',
  jueves: 'thursday',
  viernes: 'friday',
  sabado: 'saturday',
  domingo: 'sunday',
  monday: 'monday',
  tuesday: 'tuesday',
  wednesday: 'wednesday',
  thursday: 'thursday',
  friday: 'friday',
  saturday: 'saturday',
  sunday: 'sunday',
};

const WorkshopPricing = ({ courseTitle = null, workshopSchedule = null, showHeader = true, showActions = true }) => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getWeeklyPlans();
        if (!cancelled) setPlans(data);
      } catch (err) {
        console.error('Error al cargar planes:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { nonMonthly, monthlyPlans, baseWeekday, baseSaturday, hasSaturday, hasMixto } = useMemo(() => {
    const titleKey = normalizeName(courseTitle);
    const scoped = titleKey
      ? plans.filter((p) => normalizeName(p.course_title) === titleKey)
      : plans;

    // Días con clase efectivos según el schedule del taller
    const scheduleDays = Array.isArray(workshopSchedule)
      ? workshopSchedule
          .map((s) => DAY_TO_KEY[normalizeName(s?.day)] || null)
          .filter(Boolean)
      : null;
    const daySet = scheduleDays ? new Set(scheduleDays) : null;
    const maxWeeklyClasses = daySet ? daySet.size : Infinity;
    const workshopHasSaturday = daySet ? daySet.has('saturday') : true;

    // Filtrar planes cuya frecuencia semanal excede la capacidad del taller
    const withinCapacity = scoped.filter(
      (p) => !p.weekly_classes || p.weekly_classes <= maxWeeklyClasses,
    );

    const clean = withinCapacity.filter((p) => p.event_type !== 'special_event');
    const monthly = clean
      .filter((p) => !isNonMonthly(p))
      .sort((a, b) => a.number_of_classes - b.number_of_classes);
    const nonMonthlyList = clean.filter(isNonMonthly);
    const base = monthly.find((p) => p.number_of_classes === 4);
    const anySaturday = clean.some((p) => p.saturday_price != null);
    const anyMixto = clean.some((p) => p.weekly_classes >= 2 && p.saturday_price != null);
    return {
      nonMonthly: nonMonthlyList,
      monthlyPlans: monthly,
      baseWeekday: base ? base.price / 4 : 0,
      baseSaturday: base && base.saturday_price ? base.saturday_price / 4 : 0,
      hasSaturday: anySaturday && workshopHasSaturday,
      hasMixto: anyMixto && workshopHasSaturday,
    };
  }, [plans, courseTitle, workshopSchedule]);

  const colsCount = 1 + 1 + (hasSaturday ? 1 : 0) + (hasMixto ? 1 : 0);
  const rowClass = `pricing-row pricing-row--cols-${colsCount}`;

  if (loading) {
    return <p className="pricing-loading">Cargando planes…</p>;
  }

  if (monthlyPlans.length === 0 && nonMonthly.length === 0) {
    return null;
  }

  const nonMonthlyTitle = nonMonthly.length > 1 ? 'Clases sueltas' : 'Clase de prueba';

  const renderPlanLabel = (plan) => {
    if (plan.plan && plan.event_type) return plan.plan;
    return `${plan.number_of_classes} clases`;
  };

  const renderPlanSub = (plan) => {
    if (plan.event_type === 'trial') return 'Materiales incluidos';
    if (plan.event_type === 'single') return 'Sin compromiso mensual';
    return `${plan.weekly_classes} ${plan.weekly_classes === 1 ? 'vez' : 'veces'} por semana`;
  };

  return (
    <section className="workshop-pricing">
      {showHeader && (
        <header className="pricing-header">
          <p className="pricing-kicker">Planes</p>
          <h2 className="pricing-title">Elige cuántas clases al mes</h2>
          <p className="pricing-intro">
            Todos los planes incluyen materiales. Puedes empezar con una clase de prueba y luego
            decidir el ritmo que más te acomode.
          </p>
        </header>
      )}

      {nonMonthly.length > 0 && (
        <div className="pricing-table pricing-table--trial">
          <div className={`${rowClass} pricing-row--head`}>
            <div className="pricing-cell pricing-cell--plan">{nonMonthlyTitle}</div>
            <div className="pricing-cell">Lunes a Viernes</div>
            {hasSaturday && <div className="pricing-cell">Sábado</div>}
            {hasMixto && <div className="pricing-cell">Mixto</div>}
          </div>
          {nonMonthly.map((plan) => {
            const mixtoApplies = plan.weekly_classes >= 2 && plan.saturday_price != null;
            return (
              <div key={plan.id} className={`${rowClass} pricing-row--trial`}>
                <div className="pricing-cell pricing-cell--plan">
                  <strong>{renderPlanLabel(plan)}</strong>
                  <span className="pricing-cell-sub">{renderPlanSub(plan)}</span>
                </div>
                <div className="pricing-cell">
                  <span className="pricing-price">{formatCLP(plan.price)}</span>
                </div>
                {hasSaturday && (
                  <div className="pricing-cell">
                    {plan.saturday_price != null ? (
                      <span className="pricing-price">{formatCLP(plan.saturday_price)}</span>
                    ) : (
                      <span className="pricing-na">—</span>
                    )}
                  </div>
                )}
                {hasMixto && (
                  <div className="pricing-cell">
                    {mixtoApplies ? (
                      <span className="pricing-price">{formatCLP(plan.saturday_price)}</span>
                    ) : (
                      <span className="pricing-na">—</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {monthlyPlans.length > 0 && (
        <div className="pricing-table">
          <div className={`${rowClass} pricing-row--head`}>
            <div className="pricing-cell pricing-cell--plan">Plan mensual</div>
            <div className="pricing-cell">Lunes a Viernes</div>
            {hasSaturday && <div className="pricing-cell">Sábado</div>}
            {hasMixto && <div className="pricing-cell">Mixto</div>}
          </div>

          {monthlyPlans.map((plan) => {
            const weekdayDiscount = computeDiscount(baseWeekday, plan.price, plan.number_of_classes);
            const saturdayDiscount = computeDiscount(
              baseSaturday,
              plan.saturday_price,
              plan.number_of_classes
            );
            const mixtoApplies = plan.weekly_classes >= 2 && plan.saturday_price != null;
            return (
              <div key={plan.id} className={rowClass}>
                <div className="pricing-cell pricing-cell--plan">
                  <strong>{plan.number_of_classes} clases</strong>
                  <span className="pricing-cell-sub">
                    {plan.weekly_classes} {plan.weekly_classes === 1 ? 'vez' : 'veces'} por semana
                  </span>
                </div>
                <div className="pricing-cell">
                  <span className="pricing-price">{formatCLP(plan.price)}</span>
                  {weekdayDiscount > 0 && (
                    <span className="pricing-discount">-{weekdayDiscount}%</span>
                  )}
                </div>
                {hasSaturday && (
                  <div className="pricing-cell">
                    {plan.saturday_price != null ? (
                      <>
                        <span className="pricing-price">{formatCLP(plan.saturday_price)}</span>
                        {saturdayDiscount > 0 && (
                          <span className="pricing-discount">-{saturdayDiscount}%</span>
                        )}
                      </>
                    ) : (
                      <span className="pricing-na">—</span>
                    )}
                  </div>
                )}
                {hasMixto && (
                  <div className="pricing-cell">
                    {mixtoApplies ? (
                      <>
                        <span className="pricing-price">{formatCLP(plan.saturday_price)}</span>
                        {saturdayDiscount > 0 && (
                          <span className="pricing-discount">-{saturdayDiscount}%</span>
                        )}
                      </>
                    ) : (
                      <span className="pricing-na">—</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {hasMixto && (
        <div className="pricing-mixto-note__wrap">
          <div className="pricing-mixto-note">
            <span className="pricing-mixto-note__icon" aria-hidden="true">✦</span>
            <div className="pricing-mixto-note__body">
              <p className="pricing-mixto-note__title">¿Qué es el Plan Mixto?</p>
              <p className="pricing-mixto-note__text">
                Es el plan que se aplica cuando eliges <strong>2 o más clases a la semana</strong> y
                <strong> al menos una es en sábado</strong>. Por ejemplo: martes 10:00 + sábado 12:00.
              </p>
            </div>
          </div>
        </div>
      )}

      {showActions && (
        <div className="pricing-actions">
          <button
            type="button"
            className="pricing-cta"
            onClick={() => navigate('/inscripcion')}
          >
            Inscribirme
          </button>
        </div>
      )}
    </section>
  );
};

export default WorkshopPricing;
