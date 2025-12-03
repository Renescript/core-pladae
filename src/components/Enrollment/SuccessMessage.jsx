import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

const SuccessMessage = ({ enrollmentData, onClose }) => {
  return (
    <div className="enrollment-container success-container">
        <div className="success-content">
          <div className="success-icon">✓</div>
          <h1>¡Inscripción Exitosa!</h1>
          <p className="success-message">
            Bienvenido a GUSTARTE, {enrollmentData.student.firstName}
          </p>

          <div className="success-details">
            <h3>Detalles de tu Inscripción</h3>

            <div className="detail-item">
              <strong>Curso:</strong>
              <span>{enrollmentData.course.name}</span>
            </div>

            <div className="detail-item">
              <strong>Plan:</strong>
              <span>{enrollmentData.plan.plan}</span>
            </div>

            <div className="detail-item">
              <strong>Clases Seleccionadas:</strong>
              <div className="schedules-list">
                {enrollmentData.sections.map((selectedClass, classIndex) => (
                  <div key={selectedClass.eventId} style={{ marginBottom: '1rem' }}>
                    <strong>Clase {classIndex + 1}:</strong> {selectedClass.teacher_name}
                    <div style={{ marginLeft: '1rem', fontSize: '0.9em' }}>
                      {moment(selectedClass.date).format('dddd DD [de] MMMM YYYY')}
                    </div>
                    <div style={{ marginLeft: '1rem', fontSize: '0.9em' }}>
                      {selectedClass.start_time} - {selectedClass.end_time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-item">
              <strong>ID de Transacción:</strong>
              <span>{enrollmentData.transactionId}</span>
            </div>
          </div>

          <div className="success-info">
            <p>
              Hemos enviado un email de confirmación a <strong>{enrollmentData.student.email}</strong>
            </p>
            <p>
              El instructor se pondrá en contacto contigo antes del inicio del curso.
            </p>
          </div>

          <button className="btn-primary" onClick={onClose}>
            Finalizar
          </button>
        </div>
      </div>
  );
};

export default SuccessMessage;
