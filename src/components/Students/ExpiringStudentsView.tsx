import React, {useState, useEffect} from "react";
import {Clock, AlertTriangle, RefreshCw} from "lucide-react";
import {adminApi} from "../../services/api";
import {ExpiringUser} from "../../types/api";

const ExpiringStudentsView: React.FC = () => {
  const [expiringUsers, setExpiringUsers] = useState<ExpiringUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    fetchExpiringUsers();
  }, []);

  const fetchExpiringUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getSubscriptionEndingPlan();
      setExpiringUsers(response.users || []);
    } catch (error) {
      console.error("Error fetching expiring users:", error);
      showNotification("error", "Failed to fetch expiring subscriptions");
      setExpiringUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchExpiringUsers();
    setRefreshing(false);
    showNotification("success", "Data refreshed successfully");
  };

  // Show notification function
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({show: true, type, message});
    setTimeout(() => {
      setNotification((prev) => ({...prev, show: false}));
    }, 4000);
  };

  const getDaysLeftColor = (daysLeft: number) => {
    if (daysLeft <= 1) return "text-red-600 bg-red-100";
    if (daysLeft <= 2) return "text-orange-600 bg-orange-100";
    if (daysLeft <= 3) return "text-yellow-600 bg-yellow-100";
    return "text-blue-600 bg-blue-100";
  };

  const getUrgencyIcon = (daysLeft: number) => {
    if (daysLeft <= 1) return <AlertTriangle className="w-4 h-4" />;
    if (daysLeft <= 3) return <Clock className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Expiring Subscriptions
            </h1>
            <p className="text-gray-600">
              Students whose subscriptions are expiring in the next 5 days
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Expiring Soon ({expiringUsers.length})
            </h3>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="p-6">
          {expiringUsers.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Expiring Subscriptions
              </h3>
              <p className="text-gray-500">
                All subscriptions are up to date. No students have expiring subscriptions in the next 5 days.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {expiringUsers.map((user, index) => (
                <div
                  key={`${user.seatNumber}-${index}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-gray-600">
                        {user.name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {user.name || "Unknown Student"}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Seat: {user.seatNumber} • Plan: {user.planName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Expires</p>
                      <p className="font-medium text-gray-900">
                        {user.expirationDate
                          ? new Date(user.expirationDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getDaysLeftColor(user.daysLeft)}`}>
                      {getUrgencyIcon(user.daysLeft)}
                      <span className="text-sm font-medium">
                        {user.daysLeft} day{user.daysLeft === 1 ? "" : "s"} left
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notification Popup */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slideIn">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <div className="flex-shrink-0">
              {notification.type === "success" ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className="font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() =>
                setNotification((prev) => ({...prev, show: false}))
              }
              className="flex-shrink-0 ml-4 text-white hover:text-gray-200 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiringStudentsView;
