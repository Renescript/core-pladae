// Precio de una clase suelta: el de sábado si el plan lo define, si no el normal.
export const singleClassPrice = (plan, dayOfWeek) =>
  dayOfWeek === 'saturday' && plan?.saturday_price ? plan.saturday_price : (plan?.price || 0);
