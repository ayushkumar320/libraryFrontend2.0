import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import DashboardView from './components/Dashboard/DashboardView';
import StudentsView from './components/Students/StudentsView';
import PlansView from './components/Plans/PlansView';
import RegistrationView from './components/Registration/RegistrationView';
import SeatsView from './components/Seats/SeatsView';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'students':
        return <StudentsView />;
      case 'plans':
        return <PlansView />;
      case 'register':
        return <RegistrationView />;
      case 'seats':
        return <SeatsView />;
      case 'expiring':
        return <StudentsView />; // Could be a filtered version
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
// testing
export default App;