import React from "react";

const StatCard = ({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  color = "primary",
}) => {
  const colorClasses = {
    primary: "bg-primary-500/10 text-primary-400 border-primary-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <div className={`card border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              {value}
            </h3>
            {unit && <span className="text-sm text-gray-400">{unit}</span>}
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${
                trend === "up" ? "text-green-400" : "text-red-400"
              }`}
            >
              <span>{trend === "up" ? "↑" : "↓"}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
