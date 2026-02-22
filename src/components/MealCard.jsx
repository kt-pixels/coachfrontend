// src/components/MealCard.jsx
import React from "react";
import { Check, Edit2, Trash2, Clock, Flame, Dumbbell } from "lucide-react";

const MealCard = ({ meal, onToggle, onEdit, onDelete }) => {
  // Handle both old format (calories/protein directly) and new format (totalCalories/totalProtein)
  const calories = meal.totalCalories || meal.calories || 0;
  const protein = meal.totalProtein || meal.protein || 0;
  const isCompleted = meal.isCompleted || meal.completed || false;
  const mealId = meal._id || meal.id;
  const mealName = meal.name || "Unnamed Meal";
  const mealTime = meal.scheduledTime || meal.time || "";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isCompleted
          ? "bg-slate-800/30 border-slate-600/50"
          : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
      }`}
    >
      {/* Completion indicator line */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
          isCompleted ? "bg-green-500" : "bg-slate-600"
        }`}
      />

      <div className="p-4 pl-5">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(mealId)}
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              isCompleted
                ? "bg-green-500 border-green-500 scale-110"
                : "border-slate-500 hover:border-green-400 hover:scale-105"
            }`}
          >
            {isCompleted && <Check size={14} className="text-white" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4
                  className={`font-semibold text-base transition-all ${
                    isCompleted ? "text-slate-500 line-through" : "text-white"
                  }`}
                >
                  {mealName}
                </h4>

                {mealTime && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
                    <Clock size={12} className="text-slate-500" />
                    <span>{mealTime}</span>
                    {meal.type && (
                      <span className="capitalize text-slate-500">
                        • {meal.type.replace("_", " ")}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(meal)}
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                  title="Edit meal"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(mealId)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Delete meal"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Nutrition Info */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <Flame size={14} className="text-orange-400" />
                <span
                  className={`text-sm font-medium ${isCompleted ? "text-slate-500" : "text-orange-400"}`}
                >
                  {calories} kcal
                </span>
              </div>

              {protein > 0 && (
                <div className="flex items-center gap-1.5">
                  <Dumbbell size={14} className="text-blue-400" />
                  <span
                    className={`text-sm ${isCompleted ? "text-slate-500" : "text-blue-400"}`}
                  >
                    {protein}g protein
                  </span>
                </div>
              )}

              {/* Show items count if multiple items */}
              {meal.items && meal.items.length > 1 && (
                <span className="text-xs text-slate-500">
                  {meal.items.length} items
                </span>
              )}
            </div>

            {/* Show items list if expanded (optional) */}
            {meal.items && meal.items.length > 0 && !isCompleted && (
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <div className="flex flex-wrap gap-2">
                  {meal.items.slice(0, 3).map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-slate-700/50 rounded-md text-slate-300"
                    >
                      {item.name} {item.quantity && `(${item.quantity})`}
                    </span>
                  ))}
                  {meal.items.length > 3 && (
                    <span className="text-xs px-2 py-1 text-slate-500">
                      +{meal.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealCard;
