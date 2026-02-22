import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  Save,
  Ruler,
  Weight,
  Target,
  Activity,
  Utensils,
  Heart,
  Calendar,
  ChevronRight,
  Shield,
  X,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

const Profile = () => {
  const { token, user, setUser } = useAuth();

  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [isDirty, setIsDirty] = useState(false);

  // Password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        ...user,
        healthConditions: user.healthConditions || [],
        allergies: user.allergies || [],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue =
      type === "number" ? (value === "" ? "" : parseFloat(value)) : value;

    setForm((prev) => ({ ...prev, [name]: processedValue }));
    setIsDirty(true);
  };

  const handleArrayChange = (field, value) => {
    const array = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setForm((prev) => ({ ...prev, [field]: array }));
    setIsDirty(true);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDirty) return;

    setLoading(true);

    try {
      const response = await apiRequest("/auth/profile", "PUT", form, token);

      if (response.data && response.data.user) {
        setUser(response.data.user);
        showMessage("success", "Profile updated successfully!");
        setIsDirty(false);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      showMessage("error", err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("error", "New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage("error", "Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      await apiRequest(
        "/auth/password",
        "PUT",
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        token,
      );

      showMessage("success", "Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      showMessage("error", err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const calculateBMI = () => {
    if (form.height && form.currentWeight && form.height > 0) {
      const heightInM = form.height / 100;
      const bmi = (form.currentWeight / (heightInM * heightInM)).toFixed(1);
      return parseFloat(bmi);
    }
    return null;
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5)
      return {
        label: "Underweight",
        color: "text-blue-400",
        bg: "bg-blue-500/20",
        border: "border-blue-500/30",
      };
    if (bmi < 25)
      return {
        label: "Healthy",
        color: "text-green-400",
        bg: "bg-green-500/20",
        border: "border-green-500/30",
      };
    if (bmi < 30)
      return {
        label: "Overweight",
        color: "text-yellow-400",
        bg: "bg-yellow-500/20",
        border: "border-yellow-500/30",
      };
    return {
      label: "Obese",
      color: "text-red-400",
      bg: "bg-red-500/20",
      border: "border-red-500/30",
    };
  };

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);

  const weightProgress =
    form.currentWeight && form.targetWeight && form.targetWeight > 0
      ? Math.min(
          100,
          Math.max(
            0,
            parseFloat(
              ((form.currentWeight / form.targetWeight) * 100).toFixed(1),
            ),
          ),
        )
      : 0;

  const tabs = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "health", label: "Health & Body", icon: Heart },
    { id: "preferences", label: "Preferences", icon: Utensils },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-slate-400">
            Manage your personal information and health goals
          </p>
        </div>

        {/* Alert Message */}
        {message && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-top-2 ${
              message.type === "success"
                ? "bg-green-500/90 border-green-400 text-white"
                : "bg-red-500/90 border-red-400 text-white"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Info Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative inline-block">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-slate-700 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User size={48} className="text-white" />
                </div>
              </div>

              <h3 className="mt-4 text-xl font-bold text-white">
                {form.name || "Your Name"}
              </h3>
              <p className="text-slate-400 text-sm">
                {form.email || "email@example.com"}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 space-y-4">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity size={20} className="text-blue-400" />
                Health Overview
              </h4>

              {/* BMI Card */}
              {bmi && bmiCategory && (
                <div
                  className={`p-4 rounded-2xl ${bmiCategory.bg} border ${bmiCategory.border}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300 text-sm">BMI Score</span>
                    <span className={`font-bold ${bmiCategory.color}`}>
                      {bmiCategory.label}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-white">{bmi}</div>
                </div>
              )}

              {/* Weight Progress */}
              {form.targetWeight > 0 && (
                <div className="p-4 rounded-2xl bg-slate-700/50 border border-slate-600">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300 text-sm">
                      Goal Progress
                    </span>
                    <span className="text-blue-400 font-semibold">
                      {weightProgress}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                      style={{ width: `${weightProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-400">
                    <span>Current: {form.currentWeight || 0}kg</span>
                    <span>Target: {form.targetWeight}kg</span>
                  </div>
                </div>
              )}

              {/* Member Since */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30">
                <Calendar size={18} className="text-purple-400" />
                <div>
                  <p className="text-xs text-slate-400">Member Since</p>
                  <p className="text-sm font-medium text-white">
                    {form.createdAt
                      ? new Date(form.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-slate-700 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/10"
                          : "text-slate-400 hover:text-white hover:bg-slate-700/30"
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8">
                {/* Basic Info Tab */}
                {activeTab === "basic" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                          <User size={16} className="text-blue-400" />
                          Full Name
                        </label>
                        <input
                          name="name"
                          value={form.name || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                          placeholder="Enter your name"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                          <Mail size={16} className="text-blue-400" />
                          Email Address
                        </label>
                        <input
                          value={form.email || ""}
                          disabled
                          className="w-full px-4 py-3 rounded-xl bg-slate-900/30 border border-slate-700 text-slate-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-500">
                          Email cannot be changed
                        </p>
                      </div>

                      {/* Age */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                          <Calendar size={16} className="text-blue-400" />
                          Age
                        </label>
                        <input
                          type="number"
                          name="age"
                          value={form.age || ""}
                          onChange={handleChange}
                          min="13"
                          max="120"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                          placeholder="Years"
                        />
                      </div>

                      {/* Gender */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={form.gender || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none appearance-none cursor-pointer"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Health Tab */}
                {activeTab === "health" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Height */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                          <Ruler size={16} className="text-green-400" />
                          Height (cm)
                        </label>
                        <input
                          type="number"
                          name="height"
                          value={form.height || ""}
                          onChange={handleChange}
                          min="50"
                          max="300"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          placeholder="cm"
                        />
                      </div>

                      {/* Current Weight */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                          <Weight size={16} className="text-green-400" />
                          Current Weight (kg)
                        </label>
                        <input
                          type="number"
                          name="currentWeight"
                          value={form.currentWeight || ""}
                          onChange={handleChange}
                          step="0.1"
                          min="20"
                          max="500"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          placeholder="kg"
                        />
                      </div>

                      {/* Target Weight */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                          <Target size={16} className="text-purple-400" />
                          Target Weight (kg)
                        </label>
                        <input
                          type="number"
                          name="targetWeight"
                          value={form.targetWeight || ""}
                          onChange={handleChange}
                          step="0.1"
                          min="20"
                          max="500"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                          placeholder="kg"
                        />
                      </div>
                    </div>

                    {/* Activity Level */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Activity size={16} className="text-orange-400" />
                        Activity Level
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          {
                            value: "sedentary",
                            label: "Sedentary",
                            desc: "Little to no exercise",
                          },
                          {
                            value: "light",
                            label: "Lightly Active",
                            desc: "1-3 days/week",
                          },
                          {
                            value: "moderate",
                            label: "Moderately Active",
                            desc: "3-5 days/week",
                          },
                          {
                            value: "active",
                            label: "Very Active",
                            desc: "6-7 days/week",
                          },
                          {
                            value: "very_active",
                            label: "Extremely Active",
                            desc: "Physical job/training",
                          },
                        ].map((level) => (
                          <label
                            key={level.value}
                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                              form.activityLevel === level.value
                                ? "border-blue-500 bg-blue-500/10"
                                : "border-slate-600 hover:border-slate-500"
                            }`}
                          >
                            <input
                              type="radio"
                              name="activityLevel"
                              value={level.value}
                              checked={form.activityLevel === level.value}
                              onChange={handleChange}
                              className="hidden"
                            />
                            <div className="font-medium text-white text-sm">
                              {level.label}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {level.desc}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Health Conditions */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Heart size={16} className="text-red-400" />
                        Health Conditions (comma separated)
                      </label>
                      <textarea
                        value={
                          Array.isArray(form.healthConditions)
                            ? form.healthConditions.join(", ")
                            : ""
                        }
                        onChange={(e) =>
                          handleArrayChange("healthConditions", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all outline-none resize-none h-24"
                        placeholder="e.g., Diabetes, Hypertension, Asthma"
                      />
                    </div>

                    {/* Allergies */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Allergies (comma separated)
                      </label>
                      <textarea
                        value={
                          Array.isArray(form.allergies)
                            ? form.allergies.join(", ")
                            : ""
                        }
                        onChange={(e) =>
                          handleArrayChange("allergies", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all outline-none resize-none h-24"
                        placeholder="e.g., Peanuts, Shellfish, Gluten"
                      />
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === "preferences" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Dietary Preference */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Utensils size={16} className="text-yellow-400" />
                        Dietary Preference
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          {
                            value: "non-vegetarian",
                            label: "Non-Vegetarian",
                            icon: "🍖",
                          },
                          {
                            value: "vegetarian",
                            label: "Vegetarian",
                            icon: "🥗",
                          },
                          { value: "vegan", label: "Vegan", icon: "🌱" },
                          {
                            value: "eggetarian",
                            label: "Eggetarian",
                            icon: "🥚",
                          },
                        ].map((diet) => (
                          <label
                            key={diet.value}
                            className={`cursor-pointer p-4 rounded-xl border-2 text-center transition-all ${
                              form.dietaryPreference === diet.value
                                ? "border-yellow-500 bg-yellow-500/10"
                                : "border-slate-600 hover:border-slate-500"
                            }`}
                          >
                            <input
                              type="radio"
                              name="dietaryPreference"
                              value={diet.value}
                              checked={form.dietaryPreference === diet.value}
                              onChange={handleChange}
                              className="hidden"
                            />
                            <div className="text-2xl mb-1">{diet.icon}</div>
                            <div className="font-medium text-white text-sm">
                              {diet.label}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Password Change Section */}
                    <div className="mt-8 pt-8 border-t border-slate-700">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Shield size={20} className="text-slate-400" />
                        Security
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-700/30 border border-slate-600 hover:bg-slate-700/50 transition group"
                      >
                        <div className="p-2 rounded-lg bg-slate-600 group-hover:bg-slate-500 transition">
                          <Shield size={20} className="text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-white">
                            Change Password
                          </div>
                          <div className="text-sm text-slate-400">
                            Update your account password
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-500" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="mt-8 pt-6 border-t border-slate-700 flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    {isDirty && (
                      <span className="text-yellow-400">• Unsaved changes</span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !isDirty}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-500/25"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock size={20} className="text-blue-400" />
                Change Password
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-900/50 border border-slate-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        current: !prev.current,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword.current ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-900/50 border border-slate-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword.new ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-900/50 border border-slate-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword.confirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
