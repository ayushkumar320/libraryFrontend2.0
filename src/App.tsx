import {useState} from "react";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import DashboardView from "./components/Dashboard/DashboardView";
import StudentsView from "./components/Students/StudentsView";
import PlansView from "./components/Plans/PlansView";
import RegistrationView from "./components/Registration/RegistrationView";
import SeatsView from "./components/Seats/SeatsView";
import ExpiringStudentsView from "./components/Students/ExpiringStudentsView";
import {AuthProvider} from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

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
    <ErrorBoundary>
      <AuthProvider>
        <ProtectedRoute>
          <div className="flex h-screen bg-gray-50">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto">{renderContent()}</main>
            </div>
          </div>
        </ProtectedRoute>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
