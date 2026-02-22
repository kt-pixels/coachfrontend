import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";
import {
  TrendingUp,
  Target,
  Flame,
  Calendar,
  Quote,
  Activity,
  Utensils,
  Dumbbell,
  Droplets,
  ChevronUp,
  ChevronDown,
  Minus,
  Timer,
  Zap,
  TrendingDown,
} from "lucide-react";
import StatCard from "../components/StatCard";
import ProgressChart from "../components/ProgressChart";
import { getRandomQuote } from "../utils/helpers";

const Dashboard = () => {
  const { user, token } = useAuth();

  // Dashboard data states
  const [dashboardData, setDashboardData] = useState({
    todayStats: {
      meals: [],
      workouts: [],
      waterIntake: 0,
      caloriesConsumed: 0,
      caloriesBurned: 0,
    },
    weightHistory: [],
    habits: [],
    weeklyProgress: [],
  });

  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("");
  const [activeTimeRange, setActiveTimeRange] = useState("7d"); // 7d, 30d, 90d

  // Motivational quotes array
  const motivationalQuotes = [
    "The only bad workout is the one that didn't happen.",
    "Your body can stand almost anything. It's your mind that you have to convince.",
    "Fitness is not about being better than someone else. It's about being better than you used to be.",
    "The hardest lift of all is lifting your butt off the couch.",
    "Don't stop when you're tired. Stop when you're done.",
    "Sweat is just fat crying.",
    "A one-hour workout is 4% of your day. No excuses.",
  ];

  useEffect(() => {
    setQuote(getRandomQuote(motivationalQuotes));
    fetchDashboardData();
  }, [activeTimeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [statsRes, weightRes, habitsRes] = await Promise.all([
        apiRequest("/dashboard/today-stats", "GET", null, token),
        apiRequest(
          `/dashboard/weight-history?range=${activeTimeRange}`,
          "GET",
          null,
          token,
        ),
        apiRequest("/dashboard/habits", "GET", null, token),
      ]);

      setDashboardData({
        todayStats: statsRes.data || {
          meals: [],
          workouts: [],
          waterIntake: 0,
          caloriesConsumed: 0,
          caloriesBurned: 0,
        },
        weightHistory: weightRes.data?.history || [],
        habits: habitsRes.data?.habits || [],
        weeklyProgress: statsRes.data?.weeklyProgress || [],
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      // Fallback to empty data
      setDashboardData({
        todayStats: {
          meals: [],
          workouts: [],
          waterIntake: 0,
          caloriesConsumed: 0,
          caloriesBurned: 0,
        },
        weightHistory: [],
        habits: [],
        weeklyProgress: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate BMI
  const calculateBMI = () => {
    if (user?.height && user?.currentWeight) {
      const heightInM = user.height / 100;
      return (user.currentWeight / (heightInM * heightInM)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return { label: "Unknown", color: "gray", status: "neutral" };
    if (bmi < 18.5)
      return { label: "Underweight", color: "blue", status: "warning" };
    if (bmi < 25) return { label: "Healthy", color: "green", status: "good" };
    if (bmi < 30)
      return { label: "Overweight", color: "yellow", status: "warning" };
    return { label: "Obese", color: "red", status: "danger" };
  };

  const bmi = calculateBMI();
  const bmiInfo = getBMICategory(bmi);

  // Calculate weight progress
  const weightProgress =
    user?.targetWeight && user?.currentWeight
      ? Math.min(
          100,
          Math.max(
            0,
            ((user.currentWeight / user.targetWeight) * 100).toFixed(1),
          ),
        )
      : 0;

  const weightToGain =
    user?.targetWeight && user?.currentWeight
      ? (user.targetWeight - user.currentWeight).toFixed(1)
      : 0;

  // Today's stats
  const { todayStats } = dashboardData;
  const calorieTarget = user?.dailyCalorieTarget || 3000;
  const calorieProgress = Math.min(
    (todayStats.caloriesConsumed / calorieTarget) * 100,
    100,
  );

  const completedMeals = todayStats.meals.filter((m) => m.completed).length;
  const totalMeals = todayStats.meals.length || 4; // Default to 4 meals if no data

  const completedWorkouts = todayStats.workouts.filter(
    (w) => w.completed,
  ).length;
  const totalWorkouts = todayStats.workouts.length || 1;

  const completedHabits = dashboardData.habits.filter(
    (h) => h.completedToday,
  ).length;
  const totalHabits = dashboardData.habits.length || 5;

  // Chart data preparation
  const chartData =
    dashboardData.weightHistory.length > 0
      ? dashboardData.weightHistory.map((entry) => ({
          date: entry.date,
          value: entry.weight,
          target: user?.targetWeight,
        }))
      : generateMockWeightData();

  function generateMockWeightData() {
    // Generate last 7 days of mock data if no real data
    const data = [];
    const currentWeight = user?.currentWeight || 70;
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split("T")[0],
        value: currentWeight + (Math.random() * 0.4 - 0.2), // Small variations
        target: user?.targetWeight || 75,
      });
    }
    return data;
  }

  // Get trend indicator
  const getWeightTrend = () => {
    if (dashboardData.weightHistory.length < 2) return "neutral";
    const recent = dashboardData.weightHistory.slice(-2);
    const diff = recent[1].weight - recent[0].weight;
    if (diff > 0.1) return "up";
    if (diff < -0.1) return "down";
    return "neutral";
  };

  const weightTrend = getWeightTrend();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome back, {user?.name || "Warrior"}! 💪
            </h1>
            <p className="text-slate-400 mt-2 flex items-center gap-2">
              <Calendar size={16} />
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700">
            {["7d", "30d", "90d"].map((range) => (
              <button
                key={range}
                onClick={() => setActiveTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTimeRange === range
                    ? "bg-blue-500 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {range === "7d"
                  ? "Week"
                  : range === "30d"
                    ? "Month"
                    : "3 Months"}
              </button>
            ))}
          </div>
        </div>

        {/* Motivation Quote */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-slate-700 p-6 backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/30 rounded-full blur-2xl"></div>
          <div className="relative flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl shrink-0">
              <Quote className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-lg font-medium text-white italic leading-relaxed">
                "{quote}"
              </p>
              <p className="text-sm text-slate-400 mt-2">Daily Motivation</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Weight Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 hover:border-slate-600 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition">
                <TrendingUp className="text-blue-400" size={24} />
              </div>
              <span
                className={`flex items-center gap-1 text-sm ${
                  weightTrend === "up"
                    ? "text-green-400"
                    : weightTrend === "down"
                      ? "text-red-400"
                      : "text-slate-400"
                }`}
              >
                {weightTrend === "up" ? (
                  <ChevronUp size={16} />
                ) : weightTrend === "down" ? (
                  <ChevronDown size={16} />
                ) : (
                  <Minus size={16} />
                )}
                {weightTrend !== "neutral" && "Recent"}
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Current Weight</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {user?.currentWeight || "--"}
              </span>
              <span className="text-slate-400">kg</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Target: {user?.targetWeight || "--"} kg
            </p>
          </div>

          {/* Calories Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 hover:border-slate-600 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl group-hover:bg-orange-500/30 transition">
                <Flame className="text-orange-400" size={24} />
              </div>
              <span
                className={`text-sm ${calorieProgress >= 100 ? "text-green-400" : "text-orange-400"}`}
              >
                {Math.round(calorieProgress)}%
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Calories Today</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {todayStats.caloriesConsumed}
              </span>
              <span className="text-slate-400">/ {calorieTarget}</span>
            </div>
            <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                style={{ width: `${calorieProgress}%` }}
              />
            </div>
          </div>

          {/* BMI Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 hover:border-slate-600 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl transition ${
                  bmiInfo.status === "good"
                    ? "bg-green-500/20 group-hover:bg-green-500/30"
                    : bmiInfo.status === "warning"
                      ? "bg-yellow-500/20 group-hover:bg-yellow-500/30"
                      : "bg-red-500/20 group-hover:bg-red-500/30"
                }`}
              >
                <Activity
                  className={`${
                    bmiInfo.status === "good"
                      ? "text-green-400"
                      : bmiInfo.status === "warning"
                        ? "text-yellow-400"
                        : "text-red-400"
                  }`}
                  size={24}
                />
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">BMI Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {bmi || "--"}
              </span>
            </div>
            <p
              className={`text-sm mt-2 ${
                bmiInfo.status === "good"
                  ? "text-green-400"
                  : bmiInfo.status === "warning"
                    ? "text-yellow-400"
                    : "text-red-400"
              }`}
            >
              {bmiInfo.label}
            </p>
          </div>

          {/* Water/Workouts Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 hover:border-slate-600 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-500/20 rounded-xl group-hover:bg-cyan-500/30 transition">
                <Droplets className="text-cyan-400" size={24} />
              </div>
              <span className="text-cyan-400 text-sm">
                {todayStats.workouts.length} workouts
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Water Intake</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {todayStats.waterIntake}
              </span>
              <span className="text-slate-400">glasses</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Burned: {todayStats.caloriesBurned} kcal
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weight Progress Chart */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-400" />
                Weight Progress
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-slate-400">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-600 border border-dashed border-slate-400"></div>
                  <span className="text-slate-400">Target</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ProgressChart data={chartData} type="weight" />
            </div>
          </div>

          {/* Right Side Stats */}
          <div className="space-y-6">
            {/* Today's Progress */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Target size={20} className="text-purple-400" />
                Today's Progress
              </h3>

              <div className="space-y-5">
                {/* Meals Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Utensils size={16} className="text-orange-400" />
                      <span className="text-slate-300 text-sm">Meals</span>
                    </div>
                    <span className="text-white font-medium text-sm">
                      {completedMeals}/{totalMeals}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-500"
                      style={{
                        width: `${(completedMeals / totalMeals) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Workouts Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Dumbbell size={16} className="text-blue-400" />
                      <span className="text-slate-300 text-sm">Workouts</span>
                    </div>
                    <span className="text-white font-medium text-sm">
                      {completedWorkouts}/{totalWorkouts}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                      style={{
                        width: `${(completedWorkouts / totalWorkouts) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Habits Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-yellow-400" />
                      <span className="text-slate-300 text-sm">Habits</span>
                    </div>
                    <span className="text-white font-medium text-sm">
                      {completedHabits}/{totalHabits}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                      style={{
                        width: `${(completedHabits / totalHabits) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Target Weight Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-6 text-white">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <Target size={20} />
                  Target Weight
                </h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold">
                    {user?.targetWeight || "--"}
                  </span>
                  <span className="text-blue-200">kg</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-blue-100">
                    <span>Progress</span>
                    <span>{weightProgress}%</span>
                  </div>
                  <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/90 transition-all duration-1000"
                      style={{ width: `${weightProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-blue-100 mt-3">
                    {weightToGain > 0 ? (
                      <span className="flex items-center gap-1">
                        <TrendingUp size={14} />
                        {weightToGain} kg to gain
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <TrendingDown size={14} />
                        {Math.abs(weightToGain)} kg to lose
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 transition-all text-sm text-white font-medium">
                  + Log Meal
                </button>
                <button className="p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 transition-all text-sm text-white font-medium">
                  + Workout
                </button>
                <button className="p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 transition-all text-sm text-white font-medium">
                  + Weight
                </button>
                <button className="p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 transition-all text-sm text-white font-medium">
                  + Water
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Timer size={20} className="text-green-400" />
            Recent Activity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recent Meals */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Latest Meals
              </h4>
              {todayStats.meals.slice(0, 3).map((meal, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-600/50"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${meal.completed ? "bg-green-400" : "bg-slate-500"}`}
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {meal.name || `Meal ${idx + 1}`}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {meal.calories || 0} kcal
                    </p>
                  </div>
                  {meal.completed && (
                    <span className="text-green-400 text-xs">Done</span>
                  )}
                </div>
              ))}
              {todayStats.meals.length === 0 && (
                <p className="text-slate-500 text-sm italic">
                  No meals logged today
                </p>
              )}
            </div>

            {/* Recent Workouts */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Workouts
              </h4>
              {todayStats.workouts.slice(0, 3).map((workout, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-600/50"
                >
                  <Dumbbell
                    size={16}
                    className={
                      workout.completed ? "text-blue-400" : "text-slate-500"
                    }
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {workout.name || `Workout ${idx + 1}`}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {workout.duration || 0} min
                    </p>
                  </div>
                  {workout.completed && (
                    <span className="text-blue-400 text-xs">Done</span>
                  )}
                </div>
              ))}
              {todayStats.workouts.length === 0 && (
                <p className="text-slate-500 text-sm italic">
                  No workouts today
                </p>
              )}
            </div>

            {/* Habits Status */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Habits
              </h4>
              {dashboardData.habits.slice(0, 3).map((habit, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-600/50"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${habit.completedToday ? "bg-yellow-400" : "bg-slate-500"}`}
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {habit.name || `Habit ${idx + 1}`}
                    </p>
                    <p className="text-slate-400 text-xs">
                      Streak: {habit.streak || 0} days
                    </p>
                  </div>
                </div>
              ))}
              {dashboardData.habits.length === 0 && (
                <p className="text-slate-500 text-sm italic">
                  No habits tracked
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
