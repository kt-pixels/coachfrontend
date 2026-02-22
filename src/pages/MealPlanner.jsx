// src/pages/MealPlanner.jsx
import React, { useEffect, useState, useCallback } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  X,
  Clock,
  Utensils,
  Flame,
  Dumbbell,
  ChevronRight,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Bell,
  Search,
  Loader2,
  Sparkles,
  ChevronLeft,
  BellRing,
} from "lucide-react";
import MealCard from "../components/MealCard";

const MealPlanner = () => {
  const { token, user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [activeMealType, setActiveMealType] = useState("breakfast");
  const [showNutritionDetails, setShowNutritionDetails] = useState(false);
  const [upcomingAlarms, setUpcomingAlarms] = useState([]);
  const [nutritionLoading, setNutritionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    enableAlarm: true,
    scheduledTime: "",
    mealType: "breakfast",
    items: [{ name: "", quantity: "1 serving" }], // No manual nutrition fields
  });

  useEffect(() => {
    // Service worker se messages handle karo
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "START_VIBRATION") {
          startContinuousVibration();
        } else if (event.data.type === "STOP_VIBRATION") {
          stopContinuousVibration();
        }
      });
    }
  }, []);

  // Vibration control functions
  let vibrationInterval;

  const startContinuousVibration = () => {
    if (!navigator.vibrate) return;

    // Pattern: vibrate 300ms, pause 100ms, repeat
    const pattern = [300, 100];

    // Immediate vibration
    navigator.vibrate(pattern);

    // Continuous vibration har 500ms mein
    vibrationInterval = setInterval(() => {
      navigator.vibrate(pattern);
    }, 500);

    // Auto stop after 1 minute (safety)
    setTimeout(stopContinuousVibration, 60000);
  };

  const stopContinuousVibration = () => {
    if (vibrationInterval) {
      clearInterval(vibrationInterval);
      vibrationInterval = null;
    }
    if (navigator.vibrate) {
      navigator.vibrate(0); // Stop vibration
    }
  };
  const mealTypes = [
    {
      id: "breakfast",
      label: "Breakfast",
      icon: "🌅",
      time: "08:00",
      color: "from-orange-400 to-yellow-400",
    },
    {
      id: "morning_snack",
      label: "Morning Snack",
      icon: "🍎",
      time: "10:30",
      color: "from-green-400 to-emerald-400",
    },
    {
      id: "lunch",
      label: "Lunch",
      icon: "☀️",
      time: "13:00",
      color: "from-yellow-400 to-orange-400",
    },
    {
      id: "afternoon_snack",
      label: "Afternoon Snack",
      icon: "🥜",
      time: "16:00",
      color: "from-emerald-400 to-teal-400",
    },
    {
      id: "dinner",
      label: "Dinner",
      icon: "🌙",
      time: "20:00",
      color: "from-indigo-400 to-purple-400",
    },
    {
      id: "evening_snack",
      label: "Evening Snack",
      icon: "🥛",
      time: "21:30",
      color: "from-purple-400 to-pink-400",
    },
    {
      id: "pre_workout",
      label: "Pre-Workout",
      icon: "⚡",
      time: "07:00",
      color: "from-red-400 to-orange-400",
    },
    {
      id: "post_workout",
      label: "Post-Workout",
      icon: "💪",
      time: "09:00",
      color: "from-blue-400 to-cyan-400",
    },
  ];

  const targetCalories = user?.dailyCalorieTarget || 3000;
  const targetProtein = user?.dailyProteinTarget || 150;

  useEffect(() => {
    fetchMeals();
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [selectedDate]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split("T")[0];
      const res = await apiRequest(
        `/meals/today/summary?date=${dateStr}`,
        "GET",
        null,
        token,
      );
      setMeals(res.data?.meals || []);
      setUpcomingAlarms(res.data?.upcomingAlarms || []);
    } catch (err) {
      console.error("Failed to fetch meals:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMealsByType = (type) => {
    if (
      type === "morning_snack" ||
      type === "afternoon_snack" ||
      type === "evening_snack"
    ) {
      return meals.filter((m) =>
        ["morning_snack", "afternoon_snack", "evening_snack"].includes(m.type),
      );
    }
    return meals.filter((m) => m.type === type);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };

  // Close modal (ADD THIS FUNCTION)
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMeal(null);
    setFormData({
      name: "",
      enableAlarm: true,
      scheduledTime: "",
      mealType: "breakfast",
      items: [{ name: "", quantity: "1 serving" }],
    });
  };

  // Auto-fetch nutrition when item name changes
  const fetchNutritionForItem = useCallback(
    async (index, foodName) => {
      if (!foodName || foodName.length < 3) return;

      setNutritionLoading(true);
      try {
        // You can call a separate endpoint or this happens on backend
        const res = await apiRequest(
          `/meals/nutrition?food=${encodeURIComponent(foodName)}`,
          "GET",
          null,
          token,
        );

        const newItems = [...formData.items];
        newItems[index] = {
          ...newItems[index],
          name: foodName,
          calories: res.data?.calories,
          protein: res.data?.protein,
          carbs: res.data?.carbs,
          fats: res.data?.fats,
        };
        setFormData((prev) => ({ ...prev, items: newItems }));
      } catch (err) {
        console.error("Nutrition fetch failed:", err);
      } finally {
        setNutritionLoading(false);
      }
    },
    [formData.items, token],
  );

  const calculateTotals = () => {
    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.totalCalories || 0),
        protein: acc.protein + (meal.totalProtein || 0),
        carbs: acc.carbs + (meal.totalCarbs || 0),
        fats: acc.fats + (meal.totalFats || 0),
        completed: acc.completed + (meal.isCompleted ? 1 : 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, completed: 0 },
    );
  };

  const totals = calculateTotals();
  const calorieProgress = Math.min(
    (totals.calories / targetCalories) * 100,
    100,
  );
  const proteinProgress = Math.min((totals.protein / targetProtein) * 100, 100);
  const completionRate =
    meals.length > 0 ? (totals.completed / meals.length) * 100 : 0;

  const openAddModal = (type) => {
    const mealType = mealTypes.find((t) => t.id === type);
    setActiveMealType(type);
    setFormData({
      name: "",
      enableAlarm: true,
      scheduledTime: mealType?.time || getCurrentTime(),
      mealType: type,
      items: [{ name: "", quantity: "1 serving" }],
    });
    setEditingMeal(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const mealData = {
        name: formData.name,
        type: formData.mealType,
        scheduledTime: formData.scheduledTime,
        date: selectedDate,
        items: formData.items,
        enableAlarm: formData.enableAlarm,
      };

      if (editingMeal) {
        await apiRequest(`/meals/${editingMeal._id}`, "PUT", mealData, token);
      } else {
        await apiRequest("/meals", "POST", mealData, token);
      }

      fetchMeals();
      closeModal();

      // Show browser notification if enabled
      if (
        formData.enableAlarm &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        scheduleNotification(formData.name, formData.scheduledTime);
      }
    } catch (err) {
      alert(err.message || "Failed to save meal");
    }
  };

  // In your notification code (MealPlanner.jsx)
  // Replace your scheduleNotification function with this:

  const scheduleNotification = (mealName, time) => {
    const [hours, minutes] = time.split(":");
    const now = new Date();
    const scheduledTime = new Date(now);
    scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (scheduledTime > now) {
      const timeout = scheduledTime.getTime() - now.getTime();

      setTimeout(() => {
        // Vibration pattern - pehle se zyada aggressive
        const vibrationPattern = [500, 200, 500, 200, 500, 200, 500, 200, 500];

        // Agar phone mein open hai to vibration start
        if (navigator.vibrate) {
          navigator.vibrate(vibrationPattern);
        }

        // Service Worker notification bhejo
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            // Notification show karo
            registration.showNotification("🍽️ Meal Time!", {
              body: `Time to eat: ${mealName}`,
              icon: "/logo.png",
              badge: "/badge.png",
              tag: `meal-${mealName}`,
              requireInteraction: true, // Yeh important hai - notification tab tak rahega jab tak interact na karo
              actions: [
                { action: "ok", title: "✓ OK" },
                { action: "snooze", title: "⏰ Snooze 5m" },
              ],
              vibrate: vibrationPattern,
              renotify: true, // Har baar notification aaye to vibrate kare
              silent: false,
            });

            // Agar user ne abhi tak notification dekha nahi, toh bar bar vibrate karo
            let vibrateInterval = setInterval(() => {
              // Check karo ki notification abhi bhi hai ya nahi
              registration
                .getNotifications({ tag: `meal-${mealName}` })
                .then((notifications) => {
                  if (notifications.length > 0) {
                    // Notification abhi bhi active hai, vibrate karo
                    if (navigator.vibrate) {
                      navigator.vibrate([300, 100, 300]);
                    }
                  } else {
                    // Notification band ho gaya, interval clear karo
                    clearInterval(vibrateInterval);
                  }
                });
            }, 2000); // Har 2 second mein check karo

            // 1 minute baad auto stop
            setTimeout(() => {
              clearInterval(vibrateInterval);
            }, 60000);
          });
        } else {
          // Fallback: Normal notification agar service worker nahi hai
          const notification = new Notification("🍽️ Meal Time!", {
            body: `Time to eat: ${mealName}`,
            icon: "/logo.png",
            requireInteraction: true,
          });

          // Fallback vibration
          let count = 0;
          const fallbackInterval = setInterval(() => {
            if (count > 15) {
              clearInterval(fallbackInterval);
              return;
            }
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }
            count++;
          }, 2000);

          notification.onclose = () => clearInterval(fallbackInterval);
          notification.onclick = () => clearInterval(fallbackInterval);
        }
      }, timeout);
    }
  };

  const toggleMeal = async (mealId) => {
    try {
      const res = await apiRequest(
        `/meals/${mealId}/complete`,
        "PATCH",
        null,
        token,
      );
      fetchMeals();

      // Show progress notification
      if (res.data?.progress?.completionRate === 100) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("🎉 All Meals Completed!", {
            body: "Great job! You've completed all your meals for today.",
            icon: "/logo.png",
          });
        }
      }
    } catch (err) {
      console.error("Failed to toggle meal:", err);
    }
  };

  const openEditModal = (meal) => {
    setEditingMeal(meal);
    setActiveMealType(meal.type);
    setFormData({
      name: meal.name || "",
      enableAlarm: meal.enableAlarm !== false, // default to true if undefined
      scheduledTime: meal.scheduledTime || meal.time || getCurrentTime(),
      mealType: meal.type || "breakfast",
      items:
        meal.items?.length > 0
          ? meal.items
          : [{ name: "", quantity: "1 serving" }],
    });
    setIsModalOpen(true);
  };

  const updateItemField = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItemField = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: "1 serving" }],
    }));
  };

  const deleteMeal = async (mealId) => {
    if (!window.confirm("Are you sure you want to delete this meal?")) return;

    try {
      await apiRequest(`/meals/${mealId}`, "DELETE", null, token);
      fetchMeals();
    } catch (err) {
      alert(err.message || "Failed to delete meal");
    }
  };

  // ... rest of helper functions (delete, addItem, etc.) same as before ...

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Alarms */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Meal Planner
            </h1>
            <p className="text-slate-400 mt-2">
              Smart nutrition tracking with automatic calorie detection
            </p>
          </div>

          {/* Upcoming Alarms */}
          {upcomingAlarms.length > 0 && (
            <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl px-4 py-2">
              <BellRing className="text-yellow-400 animate-pulse" size={20} />
              <span className="text-yellow-200 text-sm">
                {upcomingAlarms.length} alarms today
              </span>
            </div>
          )}
        </div>

        {/* Smart Nutrition Overview */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6">
          {/* Progress Rings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Calories Ring */}
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#334155"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#gradientOrange)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${calorieProgress * 3.52} 351.86`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient
                    id="gradientOrange"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <p className="text-2xl font-bold text-white">
                  {Math.round(calorieProgress)}%
                </p>
                <p className="text-xs text-slate-400">Calories</p>
              </div>
            </div>

            {/* Protein Ring */}
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#334155"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#gradientBlue)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${proteinProgress * 3.52} 351.86`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient
                    id="gradientBlue"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <p className="text-2xl font-bold text-white">
                  {Math.round(proteinProgress)}%
                </p>
                <p className="text-xs text-slate-400">Protein</p>
              </div>
            </div>

            {/* Completion Ring */}
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#334155"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#gradientGreen)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${completionRate * 3.52} 351.86`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient
                    id="gradientGreen"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <p className="text-2xl font-bold text-white">
                  {Math.round(completionRate)}%
                </p>
                <p className="text-xs text-slate-400">Done</p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">
                {totals.calories}
              </p>
              <p className="text-xs text-slate-400">/ {targetCalories} kcal</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                {totals.protein}g
              </p>
              <p className="text-xs text-slate-400">
                / {targetProtein}g protein
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">
                {totals.completed}
              </p>
              <p className="text-xs text-slate-400">meals done</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {meals.length - totals.completed}
              </p>
              <p className="text-xs text-slate-400">remaining</p>
            </div>
          </div>
        </div>

        {/* Meal Sections with Alarms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mealTypes.map((type) => {
            if (["afternoon_snack", "evening_snack"].includes(type.id))
              return null;

            const typeMeals = getMealsByType(type.id);
            const hasAlarm = upcomingAlarms.some(
              (a) =>
                a.relatedMeal &&
                typeMeals.some((m) => m._id === a.relatedMeal.toString()),
            );

            return (
              <div
                key={type.id}
                className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl bg-gradient-to-r ${type.color}`}
                    >
                      <span className="text-xl">{type.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {type.label}
                        {hasAlarm && (
                          <Bell size={14} className="text-yellow-400" />
                        )}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {typeMeals.filter((m) => m.isCompleted).length}/
                        {typeMeals.length} completed
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openAddModal(type.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all hover:scale-105"
                  >
                    <Plus size={18} />
                    Add
                  </button>
                </div>

                <div className="space-y-3">
                  {typeMeals.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-2xl">
                      <Sparkles
                        className="mx-auto text-slate-600 mb-2"
                        size={32}
                      />
                      <p className="text-slate-500">No meals planned</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Add a meal and we'll auto-detect calories!
                      </p>
                    </div>
                  ) : (
                    typeMeals.map((meal) => (
                      <MealCard
                        key={meal._id}
                        meal={meal}
                        onToggle={toggleMeal}
                        onEdit={openEditModal}
                        onDelete={deleteMeal}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Smart Add Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-yellow-400" size={20} />
                  {editingMeal ? "Edit Meal" : "Smart Meal Add"}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-slate-700 rounded-lg"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Meal Name with Auto-Detect */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Meal Name (We'll auto-detect nutrition!)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white"
                    placeholder="e.g., 2 eggs, 1 roti, dal rice"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Sparkles size={12} className="text-yellow-400" />
                    Just type what you eat - we'll calculate calories
                    automatically
                  </p>
                </div>

                {/* Alarm Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Bell className="text-yellow-400" size={20} />
                    <div>
                      <p className="text-white font-medium">Set Reminder</p>
                      <p className="text-xs text-slate-400">
                        Get notified when it's meal time
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        enableAlarm: !formData.enableAlarm,
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-all ${formData.enableAlarm ? "bg-green-500" : "bg-slate-600"}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-all ${formData.enableAlarm ? "translate-x-7" : "translate-x-1"}`}
                    />
                  </button>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledTime: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white"
                    required
                  />
                </div>

                {/* Food Items */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Food Items (Optional - for detailed tracking)
                  </label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Food name"
                        value={item.name}
                        onChange={(e) =>
                          updateItemField(index, "name", e.target.value)
                        }
                        onBlur={(e) =>
                          fetchNutritionForItem(index, e.target.value)
                        }
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItemField(index, "quantity", e.target.value)
                        }
                        className="w-20 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white text-sm"
                      />
                      {nutritionLoading &&
                        index === formData.items.length - 1 && (
                          <Loader2
                            className="animate-spin text-blue-400"
                            size={20}
                          />
                        )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItemField}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    + Add another item
                  </button>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-600 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
                  >
                    {editingMeal ? "Update" : "Add"} Meal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanner;
