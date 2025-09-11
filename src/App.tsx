import {useState} from "react";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import DashboardView from "./components/Dashboard/DashboardView";
import StudentsView from "./components/Students/StudentsView";
import PlansView from "./components/Plans/PlansView";
import RegistrationView from "./components/Registration/RegistrationView";
import SeatsView from "./components/Seats/SeatsView";
import ExpiringStudentsView from "./components/Students/ExpiringStudentsView";
import {AuthProvider, useAuth} from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./components/Home/Home";
import Navbar from "./components/Home/Navbar";
import LoginView from "./components/Auth/LoginView";

function DashboardShell() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "students":
        return <StudentsView />;
      case "plans":
        return <PlansView />;
      case "register":
        return <RegistrationView />;
      case "seats":
        return <SeatsView />;
      case "expiring":
        return <ExpiringStudentsView />; // Dedicated expiring view
      default:
        return <DashboardView />;
    }
  };

  return (
    <div id="dashboard" className="flex h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

function PublicApp() {
  const {isAuthenticated} = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (typeof document !== "undefined") {
    document.documentElement.style.scrollBehavior = "smooth";
  }

  if (isAuthenticated) {
    return (
      <ProtectedRoute>
        <DashboardShell />
      </ProtectedRoute>
    );
  }

  return (
    <div id="top">
      <Navbar
        onLoginClick={() => setShowLogin(true)}
        onHomeClick={() => setShowLogin(false)}
      />
      {showLogin ? <LoginView /> : <Home />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PublicApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
