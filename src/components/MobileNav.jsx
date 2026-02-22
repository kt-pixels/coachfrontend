import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Utensils,
  TrendingUp,
  Dumbbell,
  Apple,
  Target,
  User,
  LogOut,
  Settings,
  ChevronUp,
  X,
  Bell,
} from "lucide-react";

const MobileNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Current path check karne ke liye
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Home" },
    { path: "/meals", icon: Utensils, label: "Meals" },
    { path: "/progress", icon: TrendingUp, label: "Progress" },
    { path: "/workout", icon: Dumbbell, label: "Workout" },
    { path: "/nutrition", icon: Apple, label: "Nutrition" },
    { path: "/discipline", icon: Target, label: "Habits" },
  ];

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate("/login");
  };

  const handleProfileClick = () => {
    setShowMenu(false);
    navigate("/profile");
  };

  const handleSettingsClick = () => {
    setShowMenu(false);
    navigate("/settings");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getProfileImage = () => {
    if (!user?.profileImage) return null;
    if (user.profileImage.startsWith("http")) return user.profileImage;
    return `http://localhost:5000${user.profileImage}`;
  };

  // Check if current path is profile
  const isProfileActive = location.pathname === "/profile";

  return (
    <>
      {/* Main Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 z-40 safe-area-pb">
        <div className="flex justify-around items-center py-2 px-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-2 rounded-xl transition-all duration-200 min-w-[3.5rem] ${
                  isActive
                    ? "text-blue-400 bg-blue-500/10"
                    : "text-slate-400 hover:text-slate-200"
                }`
              }
            >
              <item.icon size={20} strokeWidth={2} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </NavLink>
          ))}

          {/* Profile/More Button - isActive ki jagah showMenu check karo */}
          <button
            onClick={() => setShowMenu(true)}
            className={`flex flex-col items-center py-2 px-2 rounded-xl transition-all duration-200 min-w-[3.5rem] ${
              showMenu || isProfileActive
                ? "text-blue-400 bg-blue-500/10"
                : "text-slate-400"
            }`}
          >
            {getProfileImage() ? (
              <img
                src={getProfileImage()}
                alt="Profile"
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <User size={20} />
            )}
            <span className="text-[10px] mt-1 font-medium">Menu</span>
          </button>
        </div>
      </nav>

      {/* Bottom Sheet Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setShowMenu(false)}
          />

          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl z-50 lg:hidden max-h-[85vh] flex flex-col">
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
            </div>

            {/* Header with Close */}
            <div className="flex items-center justify-between px-5 pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Menu</h3>
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 rounded-full bg-slate-800 text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* User Profile Card */}
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-slate-700 rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  {getProfileImage() ? (
                    <img
                      src={getProfileImage()}
                      alt={user?.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/30"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl border-2 border-blue-500/30">
                      {getInitials(user?.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-white truncate">
                      {user?.name || "User"}
                    </h4>
                    <p className="text-sm text-slate-400 truncate">
                      {user?.email || "user@example.com"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-green-400">Online</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-700/50">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">
                      {user?.currentWeight || "--"}kg
                    </p>
                    <p className="text-xs text-slate-400">Current</p>
                  </div>
                  <div className="text-center border-x border-slate-700/50">
                    <p className="text-lg font-bold text-blue-400">
                      {user?.targetWeight || "--"}kg
                    </p>
                    <p className="text-xs text-slate-400">Target</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-400">
                      {user?.currentWeight && user?.targetWeight
                        ? (user.targetWeight - user.currentWeight).toFixed(1)
                        : "--"}
                      kg
                    </p>
                    <p className="text-xs text-slate-400">To Go</p>
                  </div>
                </div>
              </div>

              {/* Menu Options */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-1">
                  Account
                </h4>

                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white hover:bg-slate-800 transition"
                >
                  <div className="p-2.5 rounded-xl bg-blue-500/10">
                    <User size={22} className="text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">My Profile</p>
                    <p className="text-xs text-slate-400">
                      View & edit profile
                    </p>
                  </div>
                  <ChevronUp size={20} className="text-slate-500 rotate-90" />
                </button>

                <button
                  onClick={handleSettingsClick}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white hover:bg-slate-800 transition"
                >
                  <div className="p-2.5 rounded-xl bg-purple-500/10">
                    <Settings size={22} className="text-purple-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Settings</p>
                    <p className="text-xs text-slate-400">App preferences</p>
                  </div>
                  <ChevronUp size={20} className="text-slate-500 rotate-90" />
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowNotifications(true);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white hover:bg-slate-800 transition"
                >
                  <div className="p-2.5 rounded-xl bg-yellow-500/10 relative">
                    <Bell size={22} className="text-yellow-400" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                      3
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Notifications</p>
                    <p className="text-xs text-slate-400">3 unread messages</p>
                  </div>
                  <ChevronUp size={20} className="text-slate-500 rotate-90" />
                </button>
              </div>

              {/* App Info */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>Version 1.0.0</span>
                  <span>Weight Gain Coach</span>
                </div>
              </div>
            </div>

            {/* Logout Button - Fixed at bottom */}
            <div className="p-5 border-t border-slate-800 bg-slate-900">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all active:scale-95"
              >
                <LogOut size={22} />
                <span className="font-semibold text-lg">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setShowNotifications(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl z-50 lg:hidden max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell size={20} className="text-yellow-400" />
                Notifications
              </h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-2 rounded-full bg-slate-800 text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {[
                {
                  title: "Meal Reminder",
                  desc: "Time for your lunch!",
                  time: "2 min ago",
                  color: "blue",
                },
                {
                  title: "Goal Achieved",
                  desc: "Daily protein target reached",
                  time: "1 hour ago",
                  color: "green",
                },
                {
                  title: "Workout",
                  desc: "Evening workout scheduled",
                  time: "3 hours ago",
                  color: "purple",
                },
              ].map((notif, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 bg-${notif.color}-400`}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">
                        {notif.title}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        {notif.desc}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {notif.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Safe Area Spacer for iOS */}
      <div className="lg:hidden h-[calc(4rem+env(safe-area-inset-bottom))]" />
    </>
  );
};

export default MobileNav;
