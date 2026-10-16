import { useEffect } from 'react';
import '../components/Landing/landing.css';
import './SimplePage.css';
import './PrivacidadPage.css';

const ULTIMA_ACTUALIZACION = '15 de octubre de 2026';
const CORREO = 'gustarteconcepcion@gmail.com';

const PrivacidadPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <main className="simple-page privacidad-page">
      <header className="simple-page-header">
        <p className="simple-page-kicker">Gustarte</p>
        <h1 className="simple-page-title">Política de privacidad</h1>
        <p className="simple-page-intro">
          Cómo tratamos los datos personales de nuestros alumnos, apoderados y de quienes nos
          contactan. Última actualización: {ULTIMA_ACTUALIZACION}.
        </p>
      </header>

      <section>
        <h2>1. Quién es responsable de sus datos</h2>
        <p>
          El responsable del tratamiento es <strong>Gustarte Gustavo Salazar Enseñanza Cultural
          E.I.R.L.</strong>, RUT 78.291.891-5, con domicilio en Barros Arana 492, oficina 78,
          Torre Ligure, Concepción, Chile.
        </p>
        <p>
          Para cualquier consulta sobre sus datos puede escribirnos a{' '}
          <a href={`mailto:${CORREO}`}>{CORREO}</a>.
        </p>
        <p>
          Esta política se rige por la Ley N° 19.628 sobre protección de la vida privada y por la
          Ley N° 21.719, que regula la protección y el tratamiento de los datos personales.
        </p>
      </section>

      <section>
        <h2>2. Qué datos recopilamos</h2>
        <ul>
          <li>
            <strong>Datos de identificación y contacto del alumno:</strong> nombre, correo
            electrónico y teléfono.
          </li>
          <li>
            <strong>Datos del apoderado</strong>, cuando el alumno es menor de edad o así lo
            indica: correo electrónico y teléfono.
          </li>
          <li>
            <strong>Datos de la inscripción:</strong> taller, horario, plan contratado, fechas de
            clases, asistencia y recuperaciones.
          </li>
          <li>
            <strong>Datos del pago:</strong> monto, fecha, medio de pago, código de autorización y
            número de orden. <strong>No recibimos ni guardamos los datos de su tarjeta</strong>:
            el pago se realiza directamente en Webpay (Transbank).
          </li>
          <li>
            <strong>Datos de su cuenta de Google</strong>, solo si ingresa al portal de alumnos con
            ella: nombre, correo y foto de perfil. No accedemos a su correo, contactos ni archivos.
          </li>
          <li>
            <strong>Imágenes</strong> (fotografías o videos) tomadas en clases o actividades, solo
            si usted lo autoriza expresamente.
          </li>
        </ul>
        <p>No recopilamos datos sensibles, como información de salud, origen étnico o creencias.</p>
      </section>

      <section>
        <h2>3. Para qué los usamos y con qué fundamento</h2>
        <ul>
          <li>
            <strong>Gestionar su inscripción y sus clases</strong>: reservar su cupo, llevar la
            asistencia, coordinar recuperaciones y avisarle de cambios. Fundamento: la ejecución
            del contrato que usted celebra con nosotros al inscribirse.
          </li>
          <li>
            <strong>Procesar pagos y emitir comprobantes</strong>. Fundamento: la ejecución del
            contrato y el cumplimiento de obligaciones legales y tributarias.
          </li>
          <li>
            <strong>Comunicarnos con usted</strong> por correo o WhatsApp sobre su inscripción,
            por ejemplo, confirmaciones, avisos de término de su plan y coordinación del grupo de
            su taller. Fundamento: la ejecución del contrato.
          </li>
          <li>
            <strong>Publicar imágenes</strong> de clases o actividades en nuestras redes sociales y
            sitio web. Fundamento: su consentimiento, que es voluntario y puede retirar en
            cualquier momento.
          </li>
        </ul>
        <p>
          No vendemos ni arrendamos sus datos. No los usamos para tomar decisiones automatizadas
          que le afecten.
        </p>
      </section>

      <section>
        <h2>4. Menores de edad</h2>
        <p>
          Cuando el alumno es menor de edad, la inscripción debe realizarla o autorizarla su
          madre, padre o apoderado. Registramos los datos de contacto del apoderado para
          comunicarle la información de la inscripción. Tratamos los datos de niños, niñas y
          adolescentes resguardando siempre su interés superior.
        </p>
      </section>

      <section>
        <h2>5. Con quién compartimos sus datos</h2>
        <p>
          Solo compartimos sus datos con proveedores que necesitamos para prestar el servicio, y
          únicamente para ese fin:
        </p>
        <ul>
          <li><strong>Transbank (Webpay):</strong> procesamiento de pagos.</li>
          <li>
            <strong>Render:</strong> alojamiento de nuestra plataforma y base de datos.
          </li>
          <li><strong>Proveedor de envío de correos:</strong> correos de confirmación y avisos.</li>
          <li><strong>Google:</strong> inicio de sesión en el portal de alumnos.</li>
          <li><strong>WhatsApp (Meta):</strong> mensajes de coordinación y grupos de cada taller.</li>
        </ul>
        <p>
          Algunos de estos proveedores almacenan información en servidores ubicados fuera de
          Chile, principalmente en Estados Unidos. Exigimos que apliquen medidas de seguridad
          adecuadas.
        </p>
        <p>
          También podremos entregar datos a autoridades cuando una ley o una orden judicial lo
          exija.
        </p>
      </section>

      <section>
        <h2>6. Cuánto tiempo los guardamos</h2>
        <ul>
          <li>
            Los datos de inscripción y contacto, mientras sea alumno y hasta 2 años después de su
            última inscripción. Luego los eliminamos o anonimizamos.
          </li>
          <li>
            Los registros de pagos, durante el plazo que exige la normativa tributaria (en
            general, 6 años).
          </li>
          <li>Las imágenes, hasta que retire su autorización.</li>
        </ul>
      </section>

      <section>
        <h2>7. Sus derechos</h2>
        <p>En cualquier momento usted puede solicitar:</p>
        <ul>
          <li><strong>Acceso:</strong> saber qué datos suyos tenemos y cómo los usamos.</li>
          <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
          <li>
            <strong>Supresión:</strong> que eliminemos sus datos, salvo los que debamos conservar
            por ley.
          </li>
          <li><strong>Oposición:</strong> que dejemos de usarlos para un fin determinado.</li>
          <li>
            <strong>Portabilidad:</strong> recibir sus datos en un formato estructurado y de uso
            común.
          </li>
          <li>
            <strong>Bloqueo:</strong> que suspendamos temporalmente su tratamiento mientras
            resolvemos una solicitud.
          </li>
        </ul>
        <p>
          Para ejercerlos, escríbanos a <a href={`mailto:${CORREO}`}>{CORREO}</a> indicando su
          nombre y lo que solicita. Es gratuito. Responderemos dentro de 30 días corridos.
        </p>
        <p>
          Si considera que no atendimos su solicitud correctamente, puede presentar un reclamo
          ante la Agencia de Protección de Datos Personales.
        </p>
      </section>

      <section>
        <h2>8. Retiro del consentimiento</h2>
        <p>
          Cuando el tratamiento se basa en su consentimiento, como la publicación de imágenes,
          puede retirarlo en cualquier momento escribiendo a{' '}
          <a href={`mailto:${CORREO}`}>{CORREO}</a>. Retiraremos las imágenes de nuestros canales.
          El retiro no afecta lo publicado antes de su solicitud.
        </p>
      </section>

      <section>
        <h2>9. Seguridad</h2>
        <p>
          Protegemos sus datos con conexiones cifradas, acceso restringido al personal que los
          necesita y proveedores que cumplen estándares de seguridad. Si ocurre un incidente que
          afecte sus datos, se lo informaremos según lo exige la ley.
        </p>
      </section>

      <section>
        <h2>10. Cookies</h2>
        <p>
          Nuestro sitio no usa cookies de publicidad ni de analítica. Solo usamos las cookies
          técnicas necesarias para que el sitio y el pago funcionen.
        </p>
      </section>

      <section>
        <h2>11. Cambios a esta política</h2>
        <p>
          Podemos actualizar esta política. Publicaremos la nueva versión en esta página con su
          fecha de actualización y, si el cambio es importante, se lo avisaremos por correo.
        </p>
      </section>
    </main>
  );
};

export default PrivacidadPage;
