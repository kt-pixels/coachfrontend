import React from "react";
import { Check, Dumbbell, Clock, Flame, Edit2, Trash2 } from "lucide-react";

const WorkoutCard = ({ workout, onToggle, onEdit, onDelete }) => {
  const intensityColors = {
    low: "bg-green-500/20 text-green-400 border-green-500/30",
    moderate: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    very_high: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const typeIcons = {
    strength: "💪",
    cardio: "🏃",
    hiit: "⚡",
    yoga: "🧘",
    stretching: "🤸",
    sports: "⚽",
    other: "🎯",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        workout.isCompleted
          ? "bg-slate-800/30 border-slate-600/50"
          : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
      }`}
    >
      {/* Completion indicator */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
          workout.isCompleted ? "bg-green-500" : "bg-slate-600"
        }`}
      />

      <div className="p-5 pl-6">
        <div className="flex items-start gap-4">
          {/* Toggle Button */}
          <button
            onClick={onToggle}
            className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              workout.isCompleted
                ? "bg-green-500 text-white scale-110 shadow-lg shadow-green-500/25"
                : "bg-slate-700 text-slate-400 hover:bg-slate-600 hover:scale-105"
            }`}
          >
            {workout.isCompleted ? <Check size={28} /> : <Dumbbell size={24} />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">
                    {typeIcons[workout.type] || "💪"}
                  </span>
                  <h4
                    className={`font-bold text-lg transition-all ${
                      workout.isCompleted
                        ? "text-slate-500 line-through"
                        : "text-white"
                    }`}
                  >
                    {workout.name}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock size={14} />
                    {workout.scheduledTime || "09:00"}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Flame size={14} />
                    {workout.duration || 45} min
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      intensityColors[workout.intensity] ||
                      intensityColors.moderate
                    }`}
                  >
                    {workout.intensity?.replace("_", " ")}
                  </span>
                </div>

                {/* Exercises list */}
                {workout.exercises && workout.exercises.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {workout.exercises.slice(0, 3).map((ex, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-slate-700/50 rounded-md text-slate-300"
                      >
                        {ex.name} {ex.sets && `(${ex.sets}×${ex.reps})`}
                      </span>
                    ))}
                    {workout.exercises.length > 3 && (
                      <span className="text-xs px-2 py-1 text-slate-500">
                        +{workout.exercises.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {workout.notes && (
                  <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                    {workout.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={onEdit}
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                  title="Edit workout"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Delete workout"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Calories & Stats */}
            <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-4">
              <span
                className={`text-sm font-medium ${
                  workout.isCompleted ? "text-slate-500" : "text-orange-400"
                }`}
              >
                🔥 {workout.estimatedCaloriesBurned || 0} kcal
              </span>
              <span
                className={`text-sm ${
                  workout.isCompleted ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {workout.totalExercises || workout.exercises?.length || 0}{" "}
                exercises
              </span>
              {workout.isCompleted && workout.completedAt && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <Check size={12} />
                  Done{" "}
                  {new Date(workout.completedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard;
