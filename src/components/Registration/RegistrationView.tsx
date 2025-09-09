import React, {useState, useEffect} from "react";
import {X} from "lucide-react";
import {adminApi} from "../../services/api";
import {SubscriptionPlan} from "../../types/api";

const RegistrationView: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    age: "",
    slot: "",
    subscriptionPlan: "",
    joiningDate: "",
    address: "",
    examPreparingFor: "",
    schoolOrCollegeName: "",
    adharNumber: "",
    seatSection: "A",
    seatNumber: "",
    feePaid: false,
    isActive: true,
    lockerService: false,
  });
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);

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
    const fetchData = async () => {
      try {
        if (import.meta.env.DEV) console.log("Registration: fetching plans");

        // Check if user is authenticated
        const token = localStorage.getItem("adminToken");
        if (!token) {
          console.error("Registration: No auth token found");
          showNotification(
            "error",
            "Please login first to access registration"
          );
          return;
        }

        const plansResponse = await adminApi.getSubscriptionPlans();
        console.log("Registration: Plans fetched:", plansResponse);
        console.log(
          "Registration: Number of plans:",
          plansResponse ? plansResponse.length : 0
        );

        // Log individual plan details to check ObjectId format
        if (plansResponse && plansResponse.length > 0) {
          plansResponse.forEach((plan, index) => {
            console.log(`Registration: Plan ${index + 1}:`, {
              id: plan._id,
              name: plan.planName,
              price: plan.price,
              isValidObjectId: /^[0-9a-fA-F]{24}$/.test(plan._id),
            });
          });
        }

        setPlans(plansResponse || []);

        if (!plansResponse || plansResponse.length === 0) {
          showNotification(
            "error",
            "No subscription plans available. Please create plans first or check your connection."
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);

        // Check if it's an auth error
        if (error instanceof Error && error.message.includes("401")) {
          showNotification(
            "error",
            "Authentication failed. Please login again."
          );
        } else {
          showNotification(
            "error",
            "Failed to fetch subscription plans from backend. Please check if you're logged in."
          );
        }
        setPlans([]);
      }
    };

    fetchData();
  }, []);

  // Show notification function
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({show: true, type, message});
    setTimeout(() => {
      setNotification((prev) => ({...prev, show: false}));
    }, 4000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const {name, value, type} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine seat section and number
      const fullSeatNumber = `${formData.seatSection}${formData.seatNumber}`;

      // Validate required fields
      if (!formData.name || !formData.idNumber || !formData.adharNumber || !formData.subscriptionPlan) {
        showNotification("error", "Please fill in all required fields including subscription plan");
        setLoading(false);
        return;
      }

      // Validate subscription plan ID format (MongoDB ObjectId should be 24 hex characters)
      console.log("Registration: Validating subscription plan:", {
        selectedPlan: formData.subscriptionPlan,
        isValid: /^[0-9a-fA-F]{24}$/.test(formData.subscriptionPlan),
        length: formData.subscriptionPlan.length,
        availablePlans: plans.map((p) => ({id: p._id, name: p.planName})),
      });

      // Validate subscription plan selection
      if (!formData.subscriptionPlan || formData.subscriptionPlan.trim() === "") {
        showNotification("error", "Please select a subscription plan");
        setLoading(false);
        return;
      }

      // Validate ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(formData.subscriptionPlan)) {
        showNotification("error", "Invalid subscription plan selected");
        setLoading(false);
        return;
      }

      const finalSubscriptionPlan = formData.subscriptionPlan;

      // Prepare data with proper types for backend (matching Postman format exactly)
      const submitData: any = {
        name: formData.name.trim(),
        slot: formData.slot || undefined,
        adharNumber: parseInt(formData.adharNumber),
        subscriptionPlan: finalSubscriptionPlan, // Use the forced valid ObjectId
        joiningDate:
          formData.joiningDate || new Date().toISOString().split("T")[0], // YYYY-MM-DD format
        feePaid: formData.feePaid,
        seatNumber: fullSeatNumber,
        age: formData.age ? parseInt(formData.age) : undefined,
        address: formData.address?.trim(),
        examPreparingFor: formData.examPreparingFor?.trim() || undefined,
        schoolOrCollegeName: formData.schoolOrCollegeName?.trim() || undefined,
        idNumber: parseInt(formData.idNumber),
        isActive: formData.isActive,
        lockerService: formData.lockerService,
      };

      // Remove undefined values
      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      console.log("Registration: Submitting data:", submitData);
      console.log("Registration: Plans available:", plans);
      console.log("Registration: Selected plan ID:", formData.subscriptionPlan);

      const response = await adminApi.registerUser(submitData);
      console.log("Registration: Success response:", response);
      showNotification(
        "success",
        response.message || "Student registered successfully!"
      );
      setFormData({
        name: "",
        idNumber: "",
        age: "",
        slot: "",
        subscriptionPlan: "",
        joiningDate: "",
        address: "",
        examPreparingFor: "",
        schoolOrCollegeName: "",
        adharNumber: "",
        seatSection: "A",
        seatNumber: "",
        feePaid: false,
        isActive: true,
        lockerService: false,
      });
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Error registering student. Please try again.";
      
      if (error instanceof Error) {
        console.log("Registration: Error details:", error.message);
        
        // Extract more specific error message
        if (error.message.includes("HTTP_400")) {
          if (error.message.includes("Subscription plan not found")) {
            errorMessage = "Selected subscription plan is not available. Please refresh and select a valid plan.";
          } else if (error.message.includes("Invalid subscriptionPlan ID format")) {
            errorMessage = "Invalid subscription plan selected. Please select a valid plan.";
          } else if (error.message.includes("Missing required fields")) {
            errorMessage = "Please fill in all required fields.";
          } else if (error.message.includes("already exists")) {
            errorMessage = "Student with this Aadhar number, ID number, or seat already exists.";
          } else {
            errorMessage = "Invalid data provided. Please check all fields.";
          }
        } else if (error.message.includes("HTTP_401")) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (error.message.includes("HTTP_500")) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.message.includes("NETWORK_ERROR")) {
          errorMessage = "Cannot connect to server. Please check your internet connection.";
        } else {
          errorMessage = `Registration failed: ${error.message}`;
        }
      }
      
      console.log("Registration: Showing error:", errorMessage);
      showNotification("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Register New Student
          </h1>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Number
                </label>
                <input
                  type="number"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slot
                </label>
                <select
                  name="slot"
                  value={formData.slot}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select slot</option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Full day">Full day</option>
                  <option value="24 Hour">24 Hour</option>
                  <option value="Short Slot">Short Slot</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Plan
                </label>
                <select
                  name="subscriptionPlan"
                  value={formData.subscriptionPlan}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Select a plan
                  </option>
                  {plans.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.planName} - ₹{plan.price}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Joining Date
                </label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Preparing For
                </label>
                <input
                  type="text"
                  name="examPreparingFor"
                  value={formData.examPreparingFor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School/College Name
                </label>
                <input
                  type="text"
                  name="schoolOrCollegeName"
                  value={formData.schoolOrCollegeName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhar Number
                </label>
                <input
                  type="text"
                  name="adharNumber"
                  value={formData.adharNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seat Number
                </label>
                <div className="flex space-x-2">
                  <select
                    name="seatSection"
                    value={formData.seatSection}
                    onChange={handleInputChange}
                    required
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                  </select>
                  <input
                    type="number"
                    name="seatNumber"
                    value={formData.seatNumber}
                    onChange={handleInputChange}
                    placeholder="10"
                    min="1"
                    max="99"
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Example: A + 10 = A10
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="feePaid"
                  name="feePaid"
                  checked={formData.feePaid}
                  onChange={handleInputChange}
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
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="lockerService"
                  name="lockerService"
                  checked={formData.lockerService}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="lockerService" className="text-sm text-gray-700">
                  Locker Service (+₹100/month)
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register Student"}
            </button>
          </form>
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
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationView;
