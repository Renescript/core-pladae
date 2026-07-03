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

const WorkshopPricing = ({ customPlans = null }) => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(customPlans || []);
  const [loading, setLoading] = useState(!customPlans);

  useEffect(() => {
    if (customPlans) {
      setPlans(customPlans);
      setLoading(false);
      return;
    }
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
  }, [customPlans]);

  const { nonMonthly, monthlyPlans, baseWeekday, baseSaturday } = useMemo(() => {
    const clean = plans.filter((p) => p.event_type !== 'special_event');
    const monthly = clean
      .filter((p) => !isNonMonthly(p))
      .sort((a, b) => a.number_of_classes - b.number_of_classes);
    const nonMonthlyList = clean.filter(isNonMonthly);
    const base = monthly.find((p) => p.number_of_classes === 4);
    return {
      nonMonthly: nonMonthlyList,
      monthlyPlans: monthly,
      baseWeekday: base ? base.price / 4 : 0,
      baseSaturday: base ? base.saturday_price / 4 : 0,
    };
  }, [plans]);

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
      <header className="pricing-header">
        <p className="pricing-kicker">Planes</p>
        <h2 className="pricing-title">Elige cuántas clases al mes</h2>
        <p className="pricing-intro">
          Todos los planes incluyen materiales. Puedes empezar con una clase de prueba y luego
          decidir el ritmo que más te acomode.
        </p>
      </header>

      {nonMonthly.length > 0 && (
        <div className="pricing-table pricing-table--trial">
          <div className="pricing-row pricing-row--head">
            <div className="pricing-cell pricing-cell--plan">{nonMonthlyTitle}</div>
            <div className="pricing-cell">Lunes a Viernes</div>
            <div className="pricing-cell">Sábado</div>
          </div>
          {nonMonthly.map((plan) => (
            <div key={plan.id} className="pricing-row pricing-row--trial">
              <div className="pricing-cell pricing-cell--plan">
                <strong>{renderPlanLabel(plan)}</strong>
                <span className="pricing-cell-sub">{renderPlanSub(plan)}</span>
              </div>
              <div className="pricing-cell">
                <span className="pricing-price">{formatCLP(plan.price)}</span>
              </div>
              <div className="pricing-cell">
                {plan.saturday_price != null ? (
                  <span className="pricing-price">{formatCLP(plan.saturday_price)}</span>
                ) : (
                  <span className="pricing-na">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {monthlyPlans.length > 0 && (
        <div className="pricing-table">
          <div className="pricing-row pricing-row--head">
            <div className="pricing-cell pricing-cell--plan">Plan mensual</div>
            <div className="pricing-cell">Lunes a Viernes</div>
            <div className="pricing-cell">Sábado</div>
          </div>

          {monthlyPlans.map((plan) => {
            const weekdayDiscount = computeDiscount(baseWeekday, plan.price, plan.number_of_classes);
            const saturdayDiscount = computeDiscount(
              baseSaturday,
              plan.saturday_price,
              plan.number_of_classes
            );
            return (
              <div key={plan.id} className="pricing-row">
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
              </div>
            );
          })}
        </div>
      )}

      <div className="pricing-actions">
        <button
          type="button"
          className="pricing-cta"
          onClick={() => navigate('/inscripcion')}
        >
          Inscribirme
        </button>
      </div>
    </section>
  );
};

export default WorkshopPricing;
