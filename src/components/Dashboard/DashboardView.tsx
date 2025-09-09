import React, {useState, useEffect} from "react";
import {Users, Armchair, Clock, FileText} from "lucide-react";
import StatsCard from "./StatsCard";
import {adminApi} from "../../services/api";
import {DashboardStats, SubscriptionPlan, ExpiringUser} from "../../types/api";

const DashboardView: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    availableSeats: 0,
    expiringSoon: 0,
    activeUsers: 0,
    totalPlans: 0,
  });
  const [expiringUsers, setExpiringUsers] = useState<ExpiringUser[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrationForm, setRegistrationForm] = useState({
    name: "", // Changed from fullName
    idNumber: "", // Changed from email
    age: "",
    adharNumber: "", // Will be converted to number
    address: "",
    subscriptionPlan: "",
    seatSection: "",
    seatNumber: "",
    feePaid: false,
    isActive: false,
  });

  // Notification system
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({show: false, type: "success", message: ""});

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({show: true, type, message});
    setTimeout(() => {
      setNotification({show: false, type: "success", message: ""});
    }, 3000);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (import.meta.env.DEV) {
          console.log("Dashboard: Fetching data from working backend...");
        }

        const [dashboardData, expiringData, plansData] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getSubscriptionEndingPlan(),
          adminApi.getSubscriptionPlans(),
        ]);

        if (import.meta.env.DEV) {
          console.log("Dashboard: Received data", {
            dashboardData,
            expiringData,
            plansData,
          });
        }

        setStats({
          totalStudents: dashboardData.totalStudents || 0,
          availableSeats: dashboardData.availableSeats || 0,
          expiringSoon: dashboardData.expiringSoon || 0,
          activeUsers: dashboardData.activeUsers || 0,
          totalPlans: dashboardData.totalPlans || 0,
        });
        setExpiringUsers(expiringData.users || []);
        setPlans(plansData || []);

        if (import.meta.env.DEV)
          console.log("Dashboard: Data loaded successfully from backend");
      } catch (error) {
        if (import.meta.env.DEV) console.error("Dashboard fetch error", error);
        showNotification("error", "Error loading dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);
  const handleRegistrationSubmit = async () => {
    if (
      !registrationForm.name ||
      !registrationForm.idNumber ||
      !registrationForm.adharNumber ||
      !registrationForm.subscriptionPlan ||
      !registrationForm.seatSection ||
      !registrationForm.seatNumber
    ) {
      showNotification("error", "Please fill all required fields including subscription plan and seat details");
      return;
    }

    try {
      const userData = {
        name: registrationForm.name,
        idNumber: parseInt(registrationForm.idNumber),
        age: parseInt(registrationForm.age),
        adharNumber: parseInt(registrationForm.adharNumber),
        address: registrationForm.address,
        subscriptionPlan: registrationForm.subscriptionPlan,
        seatNumber: registrationForm.seatSection + registrationForm.seatNumber,
        feePaid: registrationForm.feePaid,
        isActive: registrationForm.isActive,
      };

      await adminApi.registerUser(userData);
      showNotification("success", "Student registered successfully!");

      // Reset form
      setRegistrationForm({
        name: "",
        idNumber: "",
        age: "",
        adharNumber: "",
        address: "",
        subscriptionPlan: "",
        seatSection: "",
        seatNumber: "",
        feePaid: false,
        isActive: false,
      });

      // Refresh dashboard data
      const dashboardData = await adminApi.getDashboardStats();
      setStats({
        totalStudents: dashboardData.totalStudents,
        availableSeats: dashboardData.availableSeats,
        expiringSoon: dashboardData.expiringSoon,
        activeUsers: dashboardData.activeUsers,
        totalPlans: dashboardData.totalPlans,
      });
    } catch (error) {
      console.error("Error registering student:", error);
      let errorMessage = "Error registering student. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("HTTP_400")) {
          if (error.message.includes("Subscription plan not found")) {
            errorMessage = "Selected subscription plan is not available. Please refresh and select a valid plan.";
          } else if (error.message.includes("Invalid subscriptionPlan ID format")) {
            errorMessage = "Invalid subscription plan selected. Please select a valid plan.";
          } else if (error.message.includes("already exists")) {
            errorMessage = "Student with this Aadhar number, ID number, or seat already exists.";
          } else {
            errorMessage = "Invalid data provided. Please check all fields.";
          }
        } else if (error.message.includes("HTTP_401")) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (error.message.includes("HTTP_500")) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = `Registration failed: ${error.message}`;
        }
      }
      
      showNotification("error", errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents || 0}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Available Seats"
          value={stats.availableSeats || 0}
          icon={Armchair}
          color="green"
        />
        <StatsCard
          title="Expiring Soon"
          value={stats.expiringSoon || 0}
          icon={Clock}
          color="orange"
        />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers || 0}
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Total Plans"
          value={stats.totalPlans || 0}
          icon={FileText}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Register New Student
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={registrationForm.name}
                  onChange={(e) =>
                    setRegistrationForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number
                </label>
                <input
                  type="number"
                  placeholder="Enter ID number"
                  value={registrationForm.idNumber}
                  onChange={(e) =>
                    setRegistrationForm((prev) => ({
                      ...prev,
                      idNumber: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  placeholder="Enter age"
                  value={registrationForm.age}
                  onChange={(e) =>
                    setRegistrationForm((prev) => ({
                      ...prev,
                      age: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhar Number
                </label>
                <input
                  type="number"
                  placeholder="Enter Aadhar number"
                  value={registrationForm.adharNumber}
                  onChange={(e) =>
                    setRegistrationForm((prev) => ({
                      ...prev,
                      adharNumber: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                placeholder="Enter address"
                value={registrationForm.address}
                onChange={(e) =>
                  setRegistrationForm((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription Plan
                </label>
                <select
                  value={registrationForm.subscriptionPlan}
                  onChange={(e) =>
                    setRegistrationForm((prev) => ({
                      ...prev,
                      subscriptionPlan: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select plan</option>
                  {plans.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.planName} - ₹{plan.price}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seat Section
                </label>
                <select
                  value={registrationForm.seatSection}
                  onChange={(e) =>
                    setRegistrationForm((prev) => ({
                      ...prev,
                      seatSection: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select section</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seat Number
                </label>
                <input
                  type="text"
                  placeholder="Enter seat number"
                  value={registrationForm.seatNumber}
                  onChange={(e) =>
                    setRegistrationForm((prev) => ({
                      ...prev,
                      seatNumber: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="feePaid"
                  checked={registrationForm.feePaid}
                  onChange={(e) =>
                    setRegistrationForm((prev) => ({
                      ...prev,
                      feePaid: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                <label htmlFor="feePaid" className="text-sm text-gray-700">
                  Fee Paid
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={registrationForm.isActive}
                  onChange={(e) =>
                    setRegistrationForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>
            <button
              onClick={handleRegistrationSubmit}
              className="w-full bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-slate-700 transition-colors"
            >
              Register Student
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Subscriptions Expiring in 5 Days
            </h3>
          </div>
          <div className="space-y-3">
            {expiringUsers.length > 0 ? (
              expiringUsers.slice(0, 4).map((user, index) => (
                <div
                  key={user.seatNumber + index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {user.name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.name || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Seat: {user.seatNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.expirationDate
                        ? new Date(user.expirationDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p className="text-xs text-orange-600">
                      {user.daysLeft} day{user.daysLeft === 1 ? "" : "s"} left
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No expiring subscriptions found</p>
              </div>
            )}
          </div>
          <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All Expiring Subscriptions
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
