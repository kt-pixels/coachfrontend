import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { token } = useAuth();

  // Agar already login hai to home pe bhej do
  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
