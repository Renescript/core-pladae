import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAccount, getAccountClasses, logoutAccount, updateAccount } from '../services/api';
import LoginCard from '../components/Account/LoginCard';
import { dayMonth, longDate } from '../components/Account/dates';
import '../components/Account/account.css';

const STATUS = {
  attended: { label: 'Asististe', className: 'acc-tag--ok' },
  absent: { label: 'Faltaste', className: 'acc-tag--bad' },
  upcoming: { label: 'Próxima', className: '' },
  unmarked: { label: 'Sin marcar', className: '' }
};

const ClassRow = ({ item }) => {
  let status;
  if (item.kind === 'makeup') {
    status = <span className="acc-tag acc-tag--makeup">Recuperación</span>;
  } else if (item.status === 'absent' && item.makeup_date) {
    status = <span className="acc-tag acc-tag--makeup">Recupera el {dayMonth(item.makeup_date)}</span>;
  } else if (item.can_recover) {
    status = <Link to={`/mi-cuenta/recuperar/${item.id}`} className="acc-btn acc-btn--small">Recuperar</Link>;
  } else {
    const s = STATUS[item.status] || STATUS.unmarked;
    status = <span className={`acc-tag ${s.className}`}>{s.label}</span>;
  }

  return (
    <li className="acc-class">
      <div>
        <div className="acc-class-date">{longDate(item.date)}</div>
        <div className="acc-class-slot">{item.weekday} {item.schedule}{item.kind === 'makeup' ? ' · recuperación' : ''}</div>
      </div>
      {status}
    </li>
  );
};

const PlanCard = ({ plan }) => (
  <section className="acc-card">
    <h2 className="acc-plan-title">{plan.course}</h2>
    <p className="acc-plan-meta">
      {plan.trial ? 'Clase de prueba' : plan.plan}
      {plan.makeups_allowed != null && !plan.trial && <> · recuperaciones {plan.makeups_used} de {plan.makeups_allowed}</>}
      {plan.window_end && !plan.trial && <> · plazo hasta el {dayMonth(plan.window_end)}</>}
    </p>
    <ul className="acc-classes">
      {plan.classes.map((c) => <ClassRow key={c.id} item={c} />)}
    </ul>
  </section>
);

const HistoryRow = ({ plan }) => {
  const attended = plan.classes.filter((c) => c.status === 'attended').length;
  return (
    <li className="acc-history-row">
      <div>
        <div className="acc-class-date">{plan.course}</div>
        <div className="acc-class-slot">{plan.trial ? 'Clase de prueba' : plan.plan} · {dayMonth(plan.first_date)} al {dayMonth(plan.last_date)}</div>
      </div>
      <span className="acc-tag">{attended} de {plan.classes.length} clases</span>
    </li>
  );
};

const ProfileForm = ({ user, onSaved }) => {
  const [form, setForm] = useState({
    phone: user.phone || '', guardian_email: user.guardian_email || '', guardian_phone: user.guardian_phone || ''
  });
  const [state, setState] = useState({ busy: false, message: null, error: null });
  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState({ busy: true, message: null, error: null });
    try {
      const result = await updateAccount(form);
      onSaved(result.user);
      setState({ busy: false, message: 'Datos guardados.', error: null });
    } catch (err) {
      setState({ busy: false, message: null, error: err.message });
    }
  };

  return (
    <form className="acc-card" onSubmit={handleSubmit}>
      <h2 className="acc-plan-title">Mis datos</h2>
      <p className="acc-plan-meta">{user.name} · {user.email}</p>
      <label className="acc-field">Teléfono<input type="tel" value={form.phone} onChange={change('phone')} /></label>
      <p className="acc-subhead">Apoderado (si eres menor de edad)</p>
      <label className="acc-field">Email del apoderado<input type="email" value={form.guardian_email} onChange={change('guardian_email')} /></label>
      <label className="acc-field">Teléfono del apoderado<input type="tel" value={form.guardian_phone} onChange={change('guardian_phone')} /></label>
      {state.error && <p className="acc-error" role="alert">{state.error}</p>}
      {state.message && <p className="acc-ok" role="status">{state.message}</p>}
      <button type="submit" className="acc-btn" disabled={state.busy}>{state.busy ? 'Guardando…' : 'Guardar'}</button>
      <p className="acc-note">Para cambiar tu nombre o correo, escríbenos por WhatsApp al <a href="https://wa.me/56923718373">+56 9 2371 8373</a>.</p>
    </form>
  );
};

const TABS = [['clases', 'Mis clases'], ['historial', 'Historial'], ['datos', 'Mis datos']];

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Próxima clase y recuperaciones disponibles, para el resumen de arriba.
const summarize = (plans) => {
  const today = todayStr();
  const upcoming = plans
    .flatMap((p) => p.classes.map((c) => ({ ...c, course: p.course })))
    .filter((c) => String(c.date) >= today && c.status !== 'absent')
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const recoverable = plans.flatMap((p) => p.classes).filter((c) => c.can_recover).length;
  return { next: upcoming[0] || null, recoverable };
};

const initials = (user) =>
  [user.first_name, user.last_name].map((n) => (n || '').trim().charAt(0)).join('').toUpperCase() || '?';

const EmptyClasses = () => (
  <div className="acc-card acc-empty">
    <svg className="acc-empty-icon" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#e6f3f8" />
      <path d="M15 31c3-1 4-4 6-7l9-11c1-1 3-1 4 0s1 3 0 4L23 26c-2 2-4 4-6 5" fill="none" stroke="#3b8da8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 31c-1 2-1 4-3 5 3 1 7 0 8-3" fill="#47a1bf" />
    </svg>
    <h2 className="acc-empty-title">Todavía no tienes clases activas</h2>
    <p className="acc-empty-text">Cuando te inscribas en un taller, acá vas a ver tus clases, tu asistencia y vas a poder recuperar las que te pierdas.</p>
    <div className="acc-empty-actions">
      <Link to="/inscripcion" className="acc-btn">Inscribirme</Link>
      <Link to="/valores" className="acc-btn acc-btn--ghost">Ver valores y planes</Link>
    </div>
  </div>
);

const MiCuentaPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [account, setAccount] = useState(null);
  const [classes, setClasses] = useState(null);
  const [error, setError] = useState(null);
  const tab = TABS.some(([key]) => key === searchParams.get('tab')) ? searchParams.get('tab') : 'clases';
  const loginError = searchParams.get('login_error');

  const load = useCallback(async () => {
    setError(null);
    try {
      const acc = await getAccount();
      setAccount(acc);
      if (acc.signed_in) setClasses(await getAccountClasses());
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    load();
  }, [load]);

  const handleLogout = async () => {
    try { await logoutAccount(); } catch { /* igual se limpia la vista */ }
    setAccount({ ...account, signed_in: false, user: null });
    setClasses(null);
  };

  let content;
  if (error) {
    content = (
      <div className="acc-card">
        <p className="acc-error" role="alert">{error}</p>
        <button type="button" className="acc-btn" onClick={load}>Reintentar</button>
      </div>
    );
  } else if (!account || (account.signed_in && !classes)) {
    content = <p className="acc-loading">Cargando…</p>;
  } else if (!account.signed_in) {
    content = <LoginCard loginError={loginError} />;
  } else {
    const user = account.user;
    const { next, recoverable } = summarize(classes.current);
    content = (
      <>
        <header className="acc-profile">
          <div className="acc-avatar" aria-hidden="true">{initials(user)}</div>
          <div className="acc-profile-text">
            <h1 className="acc-title">Hola, {user.first_name}</h1>
            <p className="acc-profile-email">{user.email}</p>
          </div>
          <button type="button" className="acc-btn acc-btn--ghost acc-btn--small" onClick={handleLogout}>Cerrar sesión</button>
        </header>

        {(next || recoverable > 0) && (
          <div className="acc-summary">
            {next && (
              <div className="acc-stat">
                <span className="acc-stat-label">Próxima clase</span>
                <span className="acc-stat-value">{longDate(next.date)}</span>
                <span className="acc-stat-sub">{next.course} · {next.weekday} {next.schedule}</span>
              </div>
            )}
            <div className="acc-stat">
              <span className="acc-stat-label">Recuperaciones disponibles</span>
              <span className="acc-stat-value">{recoverable}</span>
              <span className="acc-stat-sub">{recoverable > 0 ? 'Toca Recuperar en la clase que faltaste' : 'Sin faltas por recuperar'}</span>
            </div>
          </div>
        )}

        <nav className="acc-tabs" aria-label="Secciones de mi cuenta">
          {TABS.map(([key, label]) => (
            <button key={key} type="button" className={`acc-tab ${tab === key ? 'is-active' : ''}`}
                    aria-current={tab === key ? 'page' : undefined}
                    onClick={() => setSearchParams(key === 'clases' ? {} : { tab: key })}>
              {label}
            </button>
          ))}
        </nav>

        {tab === 'clases' && (
          classes.current.length ? classes.current.map((p) => <PlanCard key={p.enrollment_id} plan={p} />) : <EmptyClasses />
        )}
        {tab === 'clases' && classes.current.length > 0 && (
          <p className="acc-note">Si faltaste, el botón Recuperar aparece cuando el profe marca la asistencia.</p>
        )}

        {tab === 'historial' && (
          <section className="acc-card">
            <h2 className="acc-plan-title">Historial</h2>
            {classes.history.length + classes.current.length === 0 ? <p className="acc-muted">Todavía no tienes planes. Cuando te inscribas, acá quedará el registro de cada uno.</p> : (
              <ul className="acc-classes">
                {[...classes.current, ...classes.history].map((p) => <HistoryRow key={p.enrollment_id} plan={p} />)}
              </ul>
            )}
          </section>
        )}

        {tab === 'datos' && <ProfileForm user={user} onSaved={(u) => setAccount({ ...account, user: u })} />}
      </>
    );
  }

  return <main className="acc-page">{content}</main>;
};

export default MiCuentaPage;
