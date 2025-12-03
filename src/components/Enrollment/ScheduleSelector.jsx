const ScheduleSelector = ({ selectedCourse, selectedSection, onSelectSection }) => {
  if (!selectedCourse) {
    return (
      <div className="enrollment-step disabled">
        <h2>Paso 2: Selecciona tu Horario</h2>
        <p className="info-message">
          Primero debes seleccionar un curso
        </p>
      </div>
    );
  }

  const availableSections = selectedCourse.sections || [];

  // Mapeo de días de la semana (asumiendo que schedule es un número 0-6)
  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleSectionClick = (section) => {
    if (section.available_places === 0) return;
    onSelectSection(section);
  };

  if (availableSections.length === 0) {
    return (
      <div className="enrollment-step">
        <h2>Paso 2: Selecciona tu Horario</h2>
        <p className="info-message">
          Este curso no tiene secciones disponibles en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="enrollment-step">
      <h2>Paso 2: Selecciona tu Horario</h2>
      <p className="schedule-info">
        Selecciona una sección disponible para el curso <strong>{selectedCourse.name}</strong>
      </p>

      <div className="schedules-calendar">
        {availableSections.map(section => {
          const isSelected = selectedSection?.id === section.id;
          const isDisabled = section.available_places === 0;
          const dayName = daysOfWeek[section.schedule] || 'Por definir';

          return (
            <div
              key={section.id}
              className={`section-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => handleSectionClick(section)}
            >
              <div className="section-header">
                <h3>{dayName}</h3>
                {isSelected && <span className="selected-badge">✓ Seleccionado</span>}
              </div>

              <div className="section-details">
                <div className="section-info-row">
                  <span className="info-label">📅 Inicio:</span>
                  <span className="info-value">{formatDate(section.start_date)}</span>
                </div>
                <div className="section-info-row">
                  <span className="info-label">📅 Fin:</span>
                  <span className="info-value">{formatDate(section.end_date)}</span>
                </div>
                <div className="section-info-row">
                  <span className="info-label">👨‍🏫 Profesor:</span>
                  <span className="info-value">{section.teacher_name}</span>
                </div>
                <div className="section-info-row">
                  <span className="info-label">👥 Cupos:</span>
                  <span className={`info-value ${section.available_places <= 3 ? 'limited' : ''}`}>
                    {isDisabled ? (
                      <span className="slots-full">Sin cupos</span>
                    ) : (
                      `${section.available_places} de ${section.places} disponibles`
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleSelector;
