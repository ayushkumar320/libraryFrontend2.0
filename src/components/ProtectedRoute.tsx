import React from "react";
import {useAuth} from "../contexts/AuthContext";
import LoginView from "../components/Auth/LoginView";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({children}) => {
  const {isAuthenticated, loading} = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
