// src/pages/ProgressTracker.jsx
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  TrendingUp,
  Scale,
  Ruler,
  Calendar,
  Target,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  Activity,
  TrendingDown,
  Minus,
  Info,
  Camera,
  Edit3,
} from "lucide-react";
import ProgressChart from "../components/ProgressChart";
import { calculateBMI, getBMICategory } from "../utils/calculations";

const ProgressTracker = () => {
  const { token, user, setUser } = useAuth();
  const [weightHistory, setWeightHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingMetrics, setEditingMetrics] = useState(false);

  const [formData, setFormData] = useState({
    weight: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [metricsForm, setMetricsForm] = useState({
    height: user?.height || "",
    targetWeight: user?.targetWeight || "",
  });

  // Fetch data on mount
  useEffect(() => {
    fetchProgress();
    fetchSummary();
  }, []);

  // Update metrics form when user data changes
  useEffect(() => {
    if (user) {
      setMetricsForm({
        height: user.height || "",
        targetWeight: user.targetWeight || "",
      });
    }
  }, [user]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/progress", "GET", null, token);
      setWeightHistory(res.data?.progress || []);
    } catch (err) {
      console.error("Failed to fetch progress:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await apiRequest("/progress/summary", "GET", null, token);
      setSummary(res.data?.summary || null);
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(
        "/progress",
        "POST",
        {
          weight: parseFloat(formData.weight),
          date: formData.date,
          notes: formData.notes,
        },
        token,
      );

      // Reset form
      setFormData({
        weight: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setShowForm(false);

      // Refresh data
      fetchProgress();
      fetchSummary();
    } catch (err) {
      alert(err.message || "Failed to save entry");
    }
  };

  const deleteEntry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await apiRequest(`/progress/${id}`, "DELETE", null, token);
      fetchProgress();
      fetchSummary();
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  const updateMetrics = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest(
        "/auth/profile",
        "PUT",
        {
          height: parseFloat(metricsForm.height),
          targetWeight: parseFloat(metricsForm.targetWeight),
        },
        token,
      );

      if (res.data?.user) {
        setUser(res.data.user);
      }
      setEditingMetrics(false);
    } catch (err) {
      alert(err.message || "Failed to update metrics");
    }
  };

  // Calculations
  const currentWeight =
    weightHistory.length > 0
      ? weightHistory[0].weight
      : user?.currentWeight || 0;

  const startWeight = summary?.startWeight || user?.currentWeight || 0;
  const bmi = calculateBMI(currentWeight, user?.height || 0);
  const bmiInfo = getBMICategory(bmi);

  const totalGain = summary?.totalChange || 0;
  const weightGainPercent = summary?.percentageChange || 0;

  const remainingToTarget = user?.targetWeight
    ? Math.max(0, user.targetWeight - currentWeight)
    : 0;

  const progressToTarget =
    user?.targetWeight && user?.currentWeight
      ? Math.min(
          100,
          Math.max(
            0,
            ((currentWeight - startWeight) /
              (user.targetWeight - startWeight)) *
              100,
          ),
        )
      : 0;

  // Chart data - reverse to show chronological order
  const chartData = [...weightHistory]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((entry) => ({
      date: entry.date,
      value: entry.weight,
      target: user?.targetWeight,
    }));

  // Get trend indicator
  const getTrend = () => {
    if (weightHistory.length < 2) return "neutral";
    const recent = weightHistory.slice(0, 2);
    const diff = recent[0].weight - recent[1].weight;
    if (diff > 0.1) return "up";
    if (diff < -0.1) return "down";
    return "neutral";
  };

  const trend = getTrend();

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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Progress Tracker
            </h1>
            <p className="text-slate-400 mt-2">
              Monitor your weight gain journey and body metrics
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-blue-500/25"
          >
            <Plus size={20} />
            Log Weight
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current Weight */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 hover:border-slate-600 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition">
                <Scale className="text-blue-400" size={24} />
              </div>
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  trend === "up"
                    ? "text-green-400"
                    : trend === "down"
                      ? "text-red-400"
                      : "text-slate-400"
                }`}
              >
                {trend === "up" ? (
                  <ChevronUp size={16} />
                ) : trend === "down" ? (
                  <ChevronDown size={16} />
                ) : (
                  <Minus size={16} />
                )}
                {totalGain >= 0 ? "+" : ""}
                {totalGain.toFixed(1)} kg
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Current Weight</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {currentWeight.toFixed(1)}
              </span>
              <span className="text-slate-400">kg</span>
            </div>
          </div>

          {/* BMI Score */}
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
                <Ruler
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
              className={`text-sm mt-2 font-medium ${
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

          {/* Progress */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 hover:border-slate-600 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition">
                <TrendingUp className="text-green-400" size={24} />
              </div>
              <span className="text-green-400 text-sm font-medium">
                {weightGainPercent > 0 ? "+" : ""}
                {weightGainPercent}%
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Progress</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {Math.abs(totalGain).toFixed(1)}
              </span>
              <span className="text-slate-400">
                kg {totalGain >= 0 ? "gained" : "lost"}
              </span>
            </div>
          </div>

          {/* To Target */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 hover:border-slate-600 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition">
                  <Target className="text-purple-400" size={24} />
                </div>
                <span className="text-purple-400 text-sm font-medium">
                  {Math.round(progressToTarget)}%
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-1">To Target</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">
                  {remainingToTarget.toFixed(1)}
                </span>
                <span className="text-slate-400">kg</span>
              </div>
              <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                  style={{ width: `${progressToTarget}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Add Entry Form */}
        {showForm && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Scale size={20} className="text-blue-400" />
                Log New Weight
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="75.5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="Feeling strong today..."
                />
              </div>
              <div className="md:col-span-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity size={20} className="text-blue-400" />
                Weight History
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-slate-400">Weight</span>
                </div>
                {user?.targetWeight && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500 border border-dashed border-purple-400"></div>
                    <span className="text-slate-400">Target</span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ProgressChart
                  data={chartData}
                  type="weight"
                  target={user?.targetWeight}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No weight data yet. Start logging!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Entries */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-purple-400" />
              Recent Entries
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {weightHistory.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-2xl">
                  <Scale className="mx-auto text-slate-600 mb-2" size={32} />
                  <p className="text-slate-500">No entries yet</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Add your first entry
                  </button>
                </div>
              ) : (
                weightHistory.map((entry, index) => {
                  const prevEntry = weightHistory[index + 1];
                  const change = prevEntry
                    ? (entry.weight - prevEntry.weight).toFixed(1)
                    : null;

                  return (
                    <div
                      key={entry._id}
                      className="group flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 rounded-2xl transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-white">
                            {entry.weight} kg
                          </span>
                          {change !== null && (
                            <span
                              className={`text-xs font-medium ${
                                parseFloat(change) > 0
                                  ? "text-green-400"
                                  : parseFloat(change) < 0
                                    ? "text-red-400"
                                    : "text-slate-400"
                              }`}
                            >
                              {parseFloat(change) > 0 ? "+" : ""}
                              {change}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        {entry.notes && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteEntry(entry._id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Body Metrics Section */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Info size={20} className="text-cyan-400" />
              Body Metrics & Goals
            </h3>
            <button
              onClick={() => setEditingMetrics(!editingMetrics)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 transition"
            >
              <Edit3 size={16} />
              {editingMetrics ? "Cancel" : "Edit"}
            </button>
          </div>

          {editingMetrics ? (
            <form
              onSubmit={updateMetrics}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={metricsForm.height}
                  onChange={(e) =>
                    setMetricsForm({ ...metricsForm, height: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
                  placeholder="175"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Target Weight (kg)
                </label>
                <input
                  type="number"
                  value={metricsForm.targetWeight}
                  onChange={(e) =>
                    setMetricsForm({
                      ...metricsForm,
                      targetWeight: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                  placeholder="80"
                  required
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-xl">
                  <span className="text-slate-400">Height</span>
                  <span className="text-white font-semibold">
                    {user?.height || "--"} cm
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-xl">
                  <span className="text-slate-400">Target Weight</span>
                  <span className="text-white font-semibold">
                    {user?.targetWeight || "--"} kg
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-xl">
                  <span className="text-slate-400">Starting Weight</span>
                  <span className="text-white font-semibold">
                    {summary?.startWeight || user?.currentWeight || "--"} kg
                  </span>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-2xl p-6 space-y-4">
                <h4 className="font-semibold text-white mb-4">
                  BMI Information
                </h4>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">BMI Category</span>
                  <span className={`font-bold ${bmiInfo.color}`}>
                    {bmiInfo.label}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Healthy Range</span>
                  <span className="text-white">18.5 - 24.9</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Your BMI</span>
                  <span className={`font-bold text-xl ${bmiInfo.color}`}>
                    {bmi || "--"}
                  </span>
                </div>

                <div className="h-px bg-slate-600 my-4"></div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Entries</span>
                  <span className="text-white font-semibold">
                    {weightHistory.length}
                  </span>
                </div>

                {summary?.durationDays > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Tracking For</span>
                    <span className="text-white font-semibold">
                      {summary.durationDays} days
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Journey Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-white">
                {summary.totalEntries}
              </p>
              <p className="text-xs text-blue-200 mt-1">Total Check-ins</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-white">
                {summary.weeklyAverages?.length || 0}
              </p>
              <p className="text-xs text-green-200 mt-1">Weeks Tracked</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-white">
                {summary.latestEntry?.weightChange > 0 ? "+" : ""}
                {summary.latestEntry?.weightChange?.toFixed(1) || 0}
              </p>
              <p className="text-xs text-purple-200 mt-1">Latest Change</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-white">
                {weightGainPercent > 0 ? "+" : ""}
                {weightGainPercent}%
              </p>
              <p className="text-xs text-orange-200 mt-1">Total Change %</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;
