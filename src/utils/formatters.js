// Format standard amount into Indian Rupee (₹) string with en-IN formatting
export const formatINR = (amount, includeDecimal = false) => {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: includeDecimal ? 2 : 0,
    minimumFractionDigits: includeDecimal ? 2 : 0
  }).format(numericAmount);
};

// Format concise number format like ₹1.2L or ₹50k for dense displays if needed
export const formatINRCompact = (amount) => {
  const num = Number(amount) || 0;
  if (Math.abs(num) >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  if (Math.abs(num) >= 1000) {
    return `₹${(num / 1000).toFixed(1)}k`;
  }
  return formatINR(num);
};

// Format Date string into '15 Sep 2026' or relative
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Format YYYY-MM date string for inputs
export const getTodayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Auto-assign emoji based on goal name or category
export const getGoalEmoji = (name = '', category = '') => {
  const text = `${name} ${category}`.toLowerCase();
  
  if (text.includes('emergency') || text.includes('rainy') || text.includes('reserve') || text.includes('buffer')) {
    return '🛟';
  }
  if (text.includes('gold') || text.includes('jewel') || text.includes('sovereign')) {
    return '🪙';
  }
  if (text.includes('stock') || text.includes('share') || text.includes('equity') || text.includes('nifty') || text.includes('market')) {
    return '📈';
  }
  if (text.includes('sip') || text.includes('mutual') || text.includes('mf') || text.includes('index')) {
    return '💹';
  }
  if (text.includes('trip') || text.includes('vacation') || text.includes('travel') || text.includes('flight') || text.includes('tour') || text.includes('holiday')) {
    return '✈️';
  }
  if (text.includes('vehicle') || text.includes('car') || text.includes('bike') || text.includes('auto') || text.includes('scooter')) {
    return '🚗';
  }
  if (text.includes('home') || text.includes('house') || text.includes('flat') || text.includes('property') || text.includes('plot') || text.includes('downpayment')) {
    return '🏠';
  }
  if (text.includes('education') || text.includes('college') || text.includes('school') || text.includes('course') || text.includes('degree') || text.includes('study')) {
    return '🎓';
  }
  if (text.includes('wedding') || text.includes('marriage') || text.includes('ring')) {
    return '💍';
  }
  if (text.includes('gadget') || text.includes('phone') || text.includes('laptop') || text.includes('macbook') || text.includes('iphone') || text.includes('tech') || text.includes('pc')) {
    return '💻';
  }
  
  return '🎯';
};

// Calculate Days remaining and Goal Status badge (On Track, Behind, Completed)
export const calculateGoalStatus = (goal) => {
  const target = Number(goal.targetAmount) || 1;
  const current = Number(goal.currentAmount) || 0;
  const progressPercent = Math.min(100, Math.round((current / target) * 100));

  if (progressPercent >= 100) {
    return {
      status: 'Completed',
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      daysRemaining: 0,
      progressPercent: 100
    };
  }

  if (!goal.deadline) {
    return {
      status: 'On Track',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      daysRemaining: null,
      progressPercent
    };
  }

  const deadlineDate = new Date(goal.deadline);
  const createdAt = goal.createdAt ? new Date(goal.createdAt) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const today = new Date();

  const diffTime = deadlineDate.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const totalTime = deadlineDate.getTime() - createdAt.getTime();
  const timeElapsed = today.getTime() - createdAt.getTime();
  const expectedProgressPercent = totalTime > 0 ? Math.min(100, Math.max(0, (timeElapsed / totalTime) * 100)) : 50;

  let status = 'On Track';
  let color = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800';

  if (progressPercent < expectedProgressPercent - 10) {
    status = 'Behind';
    color = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800';
  } else {
    status = 'On Track';
    color = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
  }

  if (daysRemaining === 0 && progressPercent < 100) {
    status = 'Behind';
    color = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800';
  }

  return {
    status,
    color,
    daysRemaining,
    progressPercent
  };
};
