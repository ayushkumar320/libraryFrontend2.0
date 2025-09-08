import React, {useState, useEffect} from "react";
import {Users, Armchair, Clock, IndianRupee} from "lucide-react";
import StatsCard from "./StatsCard";
import {adminApi} from "../../services/api";
import {DashboardStats, Student} from "../../types/api";

const DashboardView: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    availableSeats: 0,
    expiringSubscriptions: 0,
    monthlyRevenue: 0,
  });
  const [expiringStudents, setExpiringStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardData, expiringData] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getSubscriptionEndingPlan(),
        ]);

        setStats(dashboardData.data);
        setExpiringStudents(expiringData.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents || 156}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Available Seats"
          value={stats.availableSeats || 24}
          icon={Armchair}
          color="green"
        />
        <StatsCard
          title="Expiring Soon"
          value={stats.expiringSubscriptions || 8}
          icon={Clock}
          color="orange"
        />
        <StatsCard
          title="Monthly Revenue"
          value={`₹${stats.monthlyRevenue?.toLocaleString() || "45,600"}`}
          icon={IndianRupee}
          color="purple"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  placeholder="Enter age"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription Plan
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Select plan</option>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joining Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                placeholder="Enter complete address"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhar Number
                </label>
                <input
                  type="text"
                  placeholder="Enter Aadhar number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seat Number
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Select seat</option>
                </select>
              </div>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="feePaid" className="mr-2" />
              <label htmlFor="feePaid" className="text-sm text-gray-700">
                Fee Paid
              </label>
            </div>
            <button className="w-full bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-slate-700 transition-colors">
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
            {expiringStudents.length > 0 ? (
              expiringStudents.slice(0, 4).map((student, index) => (
                <div
                  key={student._id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {student.fullName?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.fullName || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Seat: {student.seatNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {student.expiryDate
                        ? new Date(student.expiryDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p className="text-xs text-orange-600">3 days left</p>
                  </div>
                </div>
              ))
            ) : (
              // Mock data for demonstration
              <>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        RS
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Rahul Sharma</p>
                      <p className="text-sm text-gray-500">Seat: A-015</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Jan 30, 2025
                    </p>
                    <p className="text-xs text-orange-600">3 days left</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        PP
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Priya Patel</p>
                      <p className="text-sm text-gray-500">Seat: B-008</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Feb 01, 2025
                    </p>
                    <p className="text-xs text-orange-600">5 days left</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        AK
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Amit Kumar</p>
                      <p className="text-sm text-gray-500">Seat: C-012</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Jan 29, 2025
                    </p>
                    <p className="text-xs text-orange-600">2 days left</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        SS
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Sneha Singh</p>
                      <p className="text-sm text-gray-500">Seat: A-023</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Jan 31, 2025
                    </p>
                    <p className="text-xs text-orange-600">4 days left</p>
                  </div>
                </div>
              </>
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
