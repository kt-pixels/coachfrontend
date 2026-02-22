import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Check, Flame } from "lucide-react";

const HabitTracker = () => {
  const { token } = useAuth();
  const [habitList, setHabitList] = useState([]);

  useEffect(() => {
    if (token) {
      fetchHabits();
    }
  }, [token]);

  const fetchHabits = async () => {
    try {
      const today = new Date().toISOString();

      const res = await apiRequest(
        `/habits/daily?date=${today}`,
        "GET",
        null,
        token,
      );

      setHabitList(res.data.habits);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    }
  };

  const toggleHabit = async (id) => {
    try {
      await apiRequest(
        `/habits/${id}/toggle`,
        "PATCH",
        { date: new Date() },
        token,
      );

      fetchHabits(); // Refresh after toggle
    } catch (err) {
      console.error("Toggle Error:", err.message);
    }
  };

  return (
    <div className="space-y-3">
      {habitList.map((habit) => (
        <div
          key={habit._id}
          className={`card py-3 px-4 transition-all duration-200 ${
            habit.isCompletedToday
              ? "bg-primary-500/10 border-primary-500/30"
              : "bg-dark-800"
          }`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleHabit(habit._id)}
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                habit.isCompletedToday
                  ? "bg-primary-500 text-white"
                  : "bg-dark-700 text-gray-400 hover:bg-dark-600"
              }`}
            >
              <Check size={20} />
            </button>

            <div className="flex-1">
              <h4
                className={`font-medium ${
                  habit.isCompletedToday
                    ? "text-gray-500 line-through"
                    : "text-white"
                }`}
              >
                {habit.name}
              </h4>
            </div>

            <div className="flex items-center gap-1 text-orange-400">
              <Flame size={16} />
              <span className="font-bold text-sm">
                {habit.streak?.current || 0}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HabitTracker;
