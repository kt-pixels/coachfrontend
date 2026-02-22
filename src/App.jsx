import { useEffect } from "react"; // ADD THIS
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import MealPlanner from "./pages/MealPlanner";
import ProgressTracker from "./pages/ProgressTracker";
import Workout from "./pages/Workout";
import NutritionGuide from "./pages/NutritionGuide";
import DisciplineTracker from "./pages/DisciplineTracker";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PublicRoute from "./components/PublicRoute";
import Profile from "./pages/Profile";

function App() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration);

          // Request notification permission on load
          if (
            "Notification" in window &&
            Notification.permission === "default"
          ) {
            Notification.requestPermission();
          }
        })
        .catch((error) => {
          console.log("SW registration failed:", error);
        });
    }
  }, []);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="meals" element={<MealPlanner />} />
        <Route path="progress" element={<ProgressTracker />} />
        <Route path="workout" element={<Workout />} />
        <Route path="nutrition" element={<NutritionGuide />} />
        <Route path="discipline" element={<DisciplineTracker />} />
      </Route>
    </Routes>
  );
}

export default App;
