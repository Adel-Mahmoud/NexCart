import { Navigate } from "react-router";
import { authService } from "../services/authService";

export default function ProtectedRoute({ children }: any) {
  const token = authService.getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}