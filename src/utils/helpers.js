export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getRandomQuote = (quotes) => {
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    result[group] = result[group] || [];
    result[group].push(item);
    return result;
  }, {});
};

export const calculateStreak = (completedDates) => {
  if (!completedDates || completedDates.length === 0) return 0;

  const sorted = [...completedDates].sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const dateStr of sorted) {
    const checkDate = new Date(dateStr);
    checkDate.setHours(0, 0, 0, 0);

    const diffTime = currentDate - checkDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === streak) {
      streak++;
    } else if (diffDays > streak) {
      break;
    }
  }

  return streak;
};

export const getWeekDates = () => {
  const dates = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
};

export const capitalizeFirst = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const calculateTotalCalories = (meals) => {
  return Object.values(meals)
    .flat()
    .reduce((total, meal) => {
      return total + (meal.completed ? meal.calories : 0);
    }, 0);
};

export const calculateTotalProtein = (meals) => {
  return Object.values(meals)
    .flat()
    .reduce((total, meal) => {
      return total + (meal.completed ? meal.protein || 0 : 0);
    }, 0);
};
