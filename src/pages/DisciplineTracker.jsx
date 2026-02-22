import React, { useState, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  Target,
  Check,
  X,
  Flame,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import HabitTracker from "../components/HabitTracker";
import { initialHabits } from "../data/initialData";
import { getTodayKey, formatDate } from "../utils/calculations";
import { calculateStreak, getWeekDates } from "../utils/helpers";

const DisciplineTracker = () => {
  const [habits, setHabits] = useLocalStorage("habits", initialHabits);
  const [missedMeals, setMissedMeals] = useLocalStorage("missedMeals", []);
  const [showMissedForm, setShowMissedForm] = useState(false);
  const [missedFormData, setMissedFormData] = useState({
    mealType: "breakfast",
    reason: "",
  });

  const todayKey = getTodayKey();
  const weekDates = getWeekDates();

  const toggleHabit = (habitId) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === habitId) {
          const newCompleted = !habit.completed;
          const newStreak = newCompleted
            ? habit.streak + 1
            : Math.max(0, habit.streak - 1);
          return { ...habit, completed: newCompleted, streak: newStreak };
        }
        return habit;
      }),
    );
  };

  const addMissedMeal = (e) => {
    e.preventDefault();
    const newMissedMeal = {
      id: Date.now(),
      date: todayKey,
      mealType: missedFormData.mealType,
      reason: missedFormData.reason,
      timestamp: new Date().toISOString(),
    };

    setMissedMeals((prev) => [...prev, newMissedMeal]);
    setMissedFormData({ mealType: "breakfast", reason: "" });
    setShowMissedForm(false);
  };

  const deleteMissedMeal = (id) => {
    setMissedMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const completedHabits = habits.filter((h) => h.completed).length;
  const totalHabits = habits.length;
  const completionRate =
    totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0);
  const longestStreak = Math.max(...habits.map((h) => h.streak), 0);

  const todayMissedMeals = missedMeals.filter((m) => m.date === todayKey);
  const weekMissedCount = missedMeals.filter((m) =>
    weekDates.includes(m.date),
  ).length;

  useEffect(() => {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight - new Date();

    const timer = setTimeout(() => {
      setHabits((prev) =>
        prev.map((habit) => ({ ...habit, completed: false })),
      );
    }, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Discipline Tracker
          </h1>
          <p className="text-gray-400 mt-1">
            Build habits that lead to success
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-orange-500/20 to-dark-800">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="text-orange-400" size={24} />
            <span className="text-gray-400 text-sm">Total Streak</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalStreak}</p>
          <p className="text-xs text-orange-400 mt-1">days combined</p>
        </div>

        <div className="card bg-gradient-to-br from-primary-500/20 to-dark-800">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-primary-400" size={24} />
            <span className="text-gray-400 text-sm">Completed</span>
          </div>
          <p className="text-3xl font-bold text-white">{completedHabits}</p>
          <p className="text-xs text-primary-400 mt-1">
            of {totalHabits} habits today
          </p>
        </div>

        <div className="card bg-gradient-to-br from-blue-500/20 to-dark-800">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-blue-400" size={24} />
            <span className="text-gray-400 text-sm">Best Streak</span>
          </div>
          <p className="text-3xl font-bold text-white">{longestStreak}</p>
          <p className="text-xs text-blue-400 mt-1">days in a row</p>
        </div>

        <div className="card bg-gradient-to-br from-red-500/20 to-dark-800">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="text-red-400" size={24} />
            <span className="text-gray-400 text-sm">Missed (Week)</span>
          </div>
          <p className="text-3xl font-bold text-white">{weekMissedCount}</p>
          <p className="text-xs text-red-400 mt-1">meals skipped</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Daily Habits</h3>
              <p className="text-sm text-gray-400 mt-1">
                {Math.round(completionRate)}% completion rate today
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-400">
                {completedHabits}/{totalHabits}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <HabitTracker habits={habits} onToggle={toggleHabit} />
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Missed Meal Log</h3>
              <button
                onClick={() => setShowMissedForm(!showMissedForm)}
                className="btn-primary text-sm flex items-center gap-2"
              >
                {showMissedForm ? <X size={16} /> : <AlertCircle size={16} />}
                {showMissedForm ? "Cancel" : "Log Missed"}
              </button>
            </div>

            {showMissedForm && (
              <form
                onSubmit={addMissedMeal}
                className="mb-4 p-4 bg-dark-700 rounded-xl"
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Meal Type
                    </label>
                    <select
                      value={missedFormData.mealType}
                      onChange={(e) =>
                        setMissedFormData({
                          ...missedFormData,
                          mealType: e.target.value,
                        })
                      }
                      className="input-field"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="snacks">Snacks</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Reason (optional)
                    </label>
                    <input
                      type="text"
                      value={missedFormData.reason}
                      onChange={(e) =>
                        setMissedFormData({
                          ...missedFormData,
                          reason: e.target.value,
                        })
                      }
                      className="input-field"
                      placeholder="Why did you miss it?"
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full">
                    Log Missed Meal
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
              {missedMeals.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No missed meals logged. Great job!
                </p>
              ) : (
                [...missedMeals]
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((missed) => (
                    <div
                      key={missed.id}
                      className="flex items-center justify-between p-3 bg-dark-700 rounded-xl"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="capitalize font-medium text-white">
                            {missed.mealType}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(missed.date)}
                          </span>
                        </div>
                        {missed.reason && (
                          <p className="text-xs text-gray-400 mt-1">
                            {missed.reason}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteMissedMeal(missed.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-500/20 to-dark-800 border-yellow-500/30">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <Calendar size={20} className="text-yellow-400" />
              Weekly Consistency
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, index) => {
                const dayMissed = missedMeals.filter(
                  (m) => m.date === date,
                ).length;
                const dayHabits = habits.length;
                const dayCompleted = habits.filter((h) => {
                  return h.completed && h.lastCompleted === date;
                }).length;

                return (
                  <div key={date} className="text-center">
                    <div
                      className={`h-12 rounded-lg flex items-center justify-center text-xs font-bold ${
                        dayMissed === 0
                          ? "bg-primary-500/20 text-primary-400"
                          : dayMissed === 1
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {dayMissed === 0 ? "✓" : dayMissed}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {["S", "M", "T", "W", "T", "F", "S"][index]}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-primary-500/20 rounded"></div>
                <span className="text-gray-400">Perfect</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500/20 rounded"></div>
                <span className="text-gray-400">1 Miss</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500/20 rounded"></div>
                <span className="text-gray-400">2+ Miss</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisciplineTracker;
