import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/Landing/landing.css';
import WorkshopPricing from '../components/Landing/WorkshopPricing';
import { getWeeklyPlans } from '../services/api';
import { workshops } from '../data/workshops';
import './SimplePage.css';
import './PreciosPage.css';

const normalizeName = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

const planSignature = (plans) =>
  JSON.stringify(
    plans
      .map((p) => ({
        wc: p.weekly_classes,
        nc: p.number_of_classes,
        pr: p.price,
        sp: p.saturday_price,
        et: p.event_type,
      }))
      .sort((a, b) => (a.nc || 0) - (b.nc || 0) || (a.wc || 0) - (b.wc || 0)),
  );

const PreciosPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getWeeklyPlans();
        if (!cancelled) setPlans(data || []);
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

  const groups = useMemo(() => {
    if (plans.length === 0) return [];

    // Planes por course_title
    const byTitle = new Map();
    plans.forEach((p) => {
      const t = p.course_title || '—';
      if (!byTitle.has(t)) byTitle.set(t, []);
      byTitle.get(t).push(p);
    });

    // Agrupar cursos con misma firma de planes
    const bySignature = new Map();
    byTitle.forEach((planList, title) => {
      const sig = planSignature(planList);
      if (!bySignature.has(sig)) bySignature.set(sig, []);
      bySignature.get(sig).push(title);
    });

    return Array.from(bySignature.entries()).map(([, titles]) => {
      const scheduleCombined = titles.flatMap((title) => {
        const w = workshops.find((wk) => normalizeName(wk.name) === normalizeName(title));
        return w?.schedule || [];
      });
      return { titles, workshopSchedule: scheduleCombined };
    }).sort((a, b) => b.titles.length - a.titles.length);
  }, [plans]);

  return (
    <main className="simple-page">
      <header className="simple-page-header">
        <p className="simple-page-kicker">Talleres</p>
        <h1 className="simple-page-title">Valores de planes</h1>
        <p className="simple-page-intro">
          Planes mensuales con descuento por permanencia. Puedes empezar con una clase de prueba
          y luego decidir el ritmo que más te acomode.
        </p>
      </header>

      {loading && <p className="pricing-loading">Cargando planes…</p>}

      {!loading &&
        groups.map((group, i) => {
          const isGeneral = group.titles.length > 1;
          const heading = isGeneral ? 'Planes generales' : group.titles[0];
          return (
            <section key={i} className="pricing-group">
              <div className="pricing-group__header">
                <h2 className="pricing-group__title">{heading}</h2>
                {isGeneral && (
                  <p className="pricing-group__subtitle">
                    Aplica a: {group.titles.join(' · ')}
                  </p>
                )}
              </div>
              <WorkshopPricing
                showHeader={false}
                showActions={false}
                courseTitle={group.titles[0]}
                workshopSchedule={group.workshopSchedule}
              />
            </section>
          );
        })}

      {!loading && groups.length > 0 && (
        <div className="valores-actions">
          <button
            type="button"
            className="valores-cta valores-cta--secondary"
            onClick={() => navigate('/horario')}
          >
            Ver horarios
          </button>
          <button
            type="button"
            className="valores-cta valores-cta--primary"
            onClick={() => navigate('/inscripcion')}
          >
            Inscribirme
          </button>
        </div>
      )}
    </main>
  );
};

export default PreciosPage;
