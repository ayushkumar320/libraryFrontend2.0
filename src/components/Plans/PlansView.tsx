import {useState, useEffect} from "react";
import {Plus, Search, Edit, Trash2, TrendingUp, X} from "lucide-react";
import {adminApi} from "../../services/api";
import {SubscriptionPlan} from "../../types/api";

const PlansView = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addPlanModalOpen, setAddPlanModalOpen] = useState(false);
  const [editPlanModalOpen, setEditPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [newPlanForm, setNewPlanForm] = useState({
    planName: "",
    duration: "",
    price: "",
  });
  const [editPlanForm, setEditPlanForm] = useState({
    planName: "",
    duration: "",
    price: "",
    status: true,
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
    const fetchPlans = async () => {
      try {
        if (import.meta.env.DEV) console.log("Plans: Fetching data...");
        const response = await adminApi.getSubscriptionPlans();
        if (import.meta.env.DEV) console.log("Plans: Received data:", response);
        setPlans(response || []);
      } catch (error) {
        console.error("Error fetching plans:", error);
        showNotification("error", "Failed to fetch plans from backend");
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const filteredPlans = plans.filter((plan) =>
    plan.planName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: boolean) => {
    return status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const handleAddPlan = async () => {
    if (!newPlanForm.planName || !newPlanForm.duration || !newPlanForm.price) {
      showNotification("error", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const planData = {
        planName: newPlanForm.planName,
        duration: newPlanForm.duration,
        price: parseInt(newPlanForm.price),
        status: true,
      };
      const response = await adminApi.createSubscriptionPlan(planData); // {message, planName}
      if (import.meta.env.DEV) console.log("Plan created:", response);
      // Refetch plans to get authoritative list
      const updated = await adminApi.getSubscriptionPlans();
      setPlans(updated || []);
      setAddPlanModalOpen(false);
      setNewPlanForm({planName: "", duration: "", price: ""});
      showNotification(
        "success",
        response.message || "Plan created successfully!"
      );
    } catch (error) {
      console.error("Error creating plan:", error);
      showNotification("error", "Error creating plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setEditPlanForm({
      planName: plan.planName,
      duration: plan.duration,
      price: plan.price.toString(),
      status: plan.status,
    });
    setEditPlanModalOpen(true);
  };

  const handleUpdatePlan = async () => {
    if (
      !editingPlan ||
      !editPlanForm.planName ||
      !editPlanForm.duration ||
      !editPlanForm.price
    ) {
      showNotification("error", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const planData = {
        planId: editingPlan._id,
        planName: editPlanForm.planName,
        duration: editPlanForm.duration,
        price: parseInt(editPlanForm.price),
        status: editPlanForm.status,
      };
      const response = await adminApi.updateSubscriptionPlan(planData);
      if (import.meta.env.DEV) console.log("Plan updated:", response);
      // Refetch plans to get authoritative list
      const updated = await adminApi.getSubscriptionPlans();
      setPlans(updated || []);
      setEditPlanModalOpen(false);
      setEditingPlan(null);
      setEditPlanForm({planName: "", duration: "", price: "", status: true});
      showNotification(
        "success",
        response.message || "Plan updated successfully!"
      );
    } catch (error) {
      console.error("Error updating plan:", error);
      showNotification("error", "Error updating plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId: string, planName: string) => {
    if (
      window.confirm(`Are you sure you want to delete the ${planName} plan?`)
    ) {
      try {
        setLoading(true);
        const response = await adminApi.deleteSubscriptionPlan(planId);
        if (import.meta.env.DEV) console.log("Plan deleted:", response);
        // Refetch plans to get authoritative list
        const updated = await adminApi.getSubscriptionPlans();
        setPlans(updated || []);
        showNotification(
          "success",
          response.message || "Plan deleted successfully!"
        );
      } catch (error) {
        console.error("Error deleting plan:", error);
        let message = "Error deleting plan. Please try again.";
        if (error instanceof Error) {
          if (
            error.message.includes("Cannot delete plan with active subscribers")
          ) {
            message =
              "Cannot delete plan with active subscribers. Reassign or remove subscribers first.";
          } else if (error.message.includes("HTTP_401")) {
            message = "Unauthorized. Please login again.";
          } else if (error.message.includes("Invalid plan ID")) {
            message = "Invalid plan id.";
          } else {
            message = error.message;
          }
        }
        showNotification("error", message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalPlans = plans.length;
  const activeSubscribers = plans.reduce(
    (sum, plan) => sum + (plan.subscribers?.length || 0),
    0
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plan Management</h1>
          <p className="text-gray-600">
            Manage pricing for different subscription plans
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Plans</p>
              <p className="text-2xl font-bold text-gray-900">{totalPlans}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <Plus className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Subscribers
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {activeSubscribers}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Subscription Plans
            </h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Plans</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <button
                onClick={() => setAddPlanModalOpen(true)}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Plan</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscribers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPlans.map((plan) => (
                <tr key={plan._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {plan.planName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {plan.planName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Subscription Plan
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {plan.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{plan.price}
                    </div>
                    <div className="text-sm text-gray-500">Edit Price</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {plan.subscribers?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        plan.status
                      )}`}
                    >
                      {plan.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit plan"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if ((plan.subscribers?.length || 0) > 0) {
                            showNotification(
                              "error",
                              "Cannot delete plan with active subscribers."
                            );
                            return;
                          }
                          handleDeletePlan(plan._id, plan.planName);
                        }}
                        className={`text-red-600 hover:text-red-900 ${
                          (plan.subscribers?.length || 0) > 0
                            ? "opacity-40 cursor-not-allowed"
                            : ""
                        }`}
                        title={
                          (plan.subscribers?.length || 0) > 0
                            ? "Has active subscribers"
                            : "Delete plan"
                        }
                        disabled={(plan.subscribers?.length || 0) > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1 to {filteredPlans.length} of {plans.length} plans
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 text-sm bg-slate-800 text-white rounded">
              1
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Plan Modal */}
      {addPlanModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 animate-slideIn">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add New Plan
                </h3>
                <button
                  onClick={() => setAddPlanModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={newPlanForm.planName}
                    onChange={(e) =>
                      setNewPlanForm((prev) => ({
                        ...prev,
                        planName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter plan name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newPlanForm.duration}
                    onChange={(e) =>
                      setNewPlanForm((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 30 Days, 3 Months"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newPlanForm.price}
                    onChange={(e) =>
                      setNewPlanForm((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter price"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setAddPlanModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPlan}
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-800 border border-transparent rounded-md hover:bg-slate-700 transition-colors"
                >
                  Add Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editPlanModalOpen && editingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 animate-slideIn">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Plan: {editingPlan.planName}
                </h3>
                <button
                  onClick={() => {
                    setEditPlanModalOpen(false);
                    setEditingPlan(null);
                    setEditPlanForm({
                      planName: "",
                      duration: "",
                      price: "",
                      status: true,
                    });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={editPlanForm.planName}
                    onChange={(e) =>
                      setEditPlanForm((prev) => ({
                        ...prev,
                        planName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter plan name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={editPlanForm.duration}
                    onChange={(e) =>
                      setEditPlanForm((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 30 Days, 3 Months"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editPlanForm.price}
                    onChange={(e) =>
                      setEditPlanForm((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editPlanForm.status ? "active" : "inactive"}
                    onChange={(e) =>
                      setEditPlanForm((prev) => ({
                        ...prev,
                        status: e.target.value === "active",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setEditPlanModalOpen(false);
                    setEditingPlan(null);
                    setEditPlanForm({
                      planName: "",
                      duration: "",
                      price: "",
                      status: true,
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePlan}
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-800 border border-transparent rounded-md hover:bg-slate-700 transition-colors"
                >
                  Update Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg animate-slideIn ${
            notification.type === "success"
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          <div className="flex items-center">
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() =>
                setNotification({show: false, type: "success", message: ""})
              }
              className="ml-3 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansView;
