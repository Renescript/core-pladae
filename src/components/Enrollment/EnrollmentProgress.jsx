const STEPS = [
  { num: 1, label: 'Curso' },
  { num: 2, label: 'Frecuencia' },
  { num: 3, label: 'Horarios' },
  { num: 4, label: 'Duración' },
  { num: 5, label: 'Calendario' },
];

const formatPrice = (price) => {
  if (!price) return '';
  return '$' + price.toLocaleString('es-CL');
};

const EnrollmentProgress = ({ currentStep, technique, weeklyPlan, frequency, selectedSchedules, durationMonths, priceInfo }) => {
  // Don't show on steps 6 and 7
  if (currentStep > 5) return null;

  const getValue = (stepNum) => {
    switch (stepNum) {
      case 1:
        return technique?.name || null;
      case 2:
        if (!frequency) return null;
        return `${frequency}x/sem`;
      case 3:
        if (!selectedSchedules?.length) return null;
        return selectedSchedules.map(s => {
          const day = s.dayOfWeek;
          const dayNames = { monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié', thursday: 'Jue', friday: 'Vie', saturday: 'Sáb' };
          return `${dayNames[day] || day} ${s.timeSlot || ''}`;
        }).join(' · ');
      case 4:
        if (!durationMonths) return null;
        const price = priceInfo?.finalPrice;
        return `${durationMonths} mes${durationMonths > 1 ? 'es' : ''}${price ? ' · ' + formatPrice(price) : ''}`;
      case 5:
        return null; // Calendar step doesn't have a summary value
      default:
        return null;
    }
  };

  return (
    <div className="enrollment-progress">
      {STEPS.map((step) => {
        const isCompleted = currentStep > step.num;
        const isCurrent = currentStep === step.num;
        const value = getValue(step.num);

        return (
          <div
            key={step.num}
            className={`progress-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${!isCompleted && !isCurrent ? 'pending' : ''}`}
          >
            <div className="progress-dot">
              {isCompleted ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              ) : step.num}
            </div>
            <div className="progress-info">
              <span className="progress-label">{step.label}</span>
              {value && <span className="progress-value">{value}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EnrollmentProgress;
