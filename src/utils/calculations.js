export const calculateBMI = (weight, height) => {
  if (!weight || !height || weight <= 0 || height <= 0) return null; // Return null instead of 0 for invalid
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return parseFloat(bmi.toFixed(1));
};

export const getBMICategory = (bmi) => {
  if (!bmi || bmi <= 0)
    return {
      category: "Unknown",
      color: "text-slate-400",
      status: "neutral", // Add status for UI styling
    };
  if (bmi < 18.5)
    return {
      category: "Underweight",
      color: "text-blue-400", // Blue better hai underweight ke liye
      status: "warning",
    };
  if (bmi < 25)
    return {
      category: "Normal",
      color: "text-green-400",
      status: "good",
    };
  if (bmi < 30)
    return {
      category: "Overweight",
      color: "text-yellow-400",
      status: "warning",
    };
  return {
    category: "Obese",
    color: "text-red-400",
    status: "danger",
  };
};

export const calculateWeightGainPercentage = (startWeight, currentWeight) => {
  if (!startWeight || !currentWeight || startWeight <= 0) return 0;
  const gain = currentWeight - startWeight;
  const percentage = (gain / startWeight) * 100;
  return parseFloat(percentage.toFixed(1));
};
export const calculateCaloriesNeeded = (
  weight,
  height,
  age,
  gender,
  activityLevel = "moderate",
) => {
  let bmr;
  if (gender === "male") {
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
  };

  const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);
  const surplus = 500;
  return Math.round(tdee + surplus);
};

export const getProgressColor = (percentage) => {
  if (percentage >= 100) return "#22c55e";
  if (percentage >= 75) return "#4ade80";
  if (percentage >= 50) return "#facc15";
  if (percentage >= 25) return "#fb923c";
  return "#ef4444";
};

export const formatDate = (dateString) => {
  if (!dateString) return "N/A"; // Null check add kiya
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const getTodayKey = () => {
  return new Date().toISOString().split("T")[0];
};

export const getDayName = (date = new Date()) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
};
