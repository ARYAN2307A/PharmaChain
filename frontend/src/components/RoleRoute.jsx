import { Navigate } from "react-router-dom";
import { getRole } from "../utils/auth";

export default function RoleRoute({ roles, children }) {
  const role = getRole();

  if (!role || !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
