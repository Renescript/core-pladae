import { useState } from 'react';

const StudentForm = ({ studentData, onUpdateStudent, onNext, onBack }) => {
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!studentData.firstName?.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    if (!studentData.lastName?.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    if (!studentData.email?.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!studentData.phone?.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  const handleChange = (field, value) => {
    onUpdateStudent({ ...studentData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <div className="enrollment-step">
      <h2>Paso 3: Datos del Estudiante</h2>
      <form className="student-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">Nombre *</label>
            <input
              type="text"
              id="firstName"
              value={studentData.firstName || ''}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Apellido *</label>
            <input
              type="text"
              id="lastName"
              value={studentData.lastName || ''}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            value={studentData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Teléfono *</label>
          <input
            type="tel"
            id="phone"
            placeholder="+56 9 1234 5678"
            value={studentData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onBack}>
            Volver
          </button>
          <button type="submit" className="btn-primary">
            Continuar al Pago
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
