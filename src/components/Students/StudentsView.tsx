import React, {useState, useEffect} from "react";
import {Search, Filter, Eye, Edit, Trash2, X} from "lucide-react";
import {adminApi} from "../../services/api";
import {Student, SubscriptionPlan} from "../../types/api";

const StudentsView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("All Plans");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    fatherName: "",
    subscriptionPlan: "",
    joiningDate: "",
    address: "",
    adharNumber: "",
    seatSection: "A",
    seatNumber: "",
    feePaid: false,
    isActive: true,
    slot: "",
    examPreparingFor: "",
    schoolOrCollegeName: "",
    lockerService: false,
  });
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  // Helper to calculate expiry date from joiningDate and plan duration
  const calculateExpiryDate = (student: Student): string => {
    const plan =
      typeof student.subscriptionPlan === "string"
        ? plans.find((p: SubscriptionPlan) => p._id === student.subscriptionPlan)
        : student.subscriptionPlan;
    if (!plan || !student.joiningDate) return "-";
    const joiningDate = new Date(student.joiningDate);
    const duration = plan.duration.toLowerCase();

    const expiry = new Date(joiningDate);
    if (duration.includes("day")) {
      const days = parseInt(duration.match(/\d+/)?.[0] || "0");
      expiry.setDate(joiningDate.getDate() + days);
    } else if (duration.includes("week")) {
      const weeks = parseInt(duration.match(/\d+/)?.[0] || "0");
      expiry.setDate(joiningDate.getDate() + weeks * 7);
    } else if (duration.includes("month")) {
      const months = parseInt(duration.match(/\d+/)?.[0] || "0");
      expiry.setMonth(joiningDate.getMonth() + months);
    } else if (duration.includes("year")) {
      const years = parseInt(duration.match(/\d+/)?.[0] || "0");
      expiry.setFullYear(joiningDate.getFullYear() + years);
    } else {
      return "-";
    }
    return expiry.toLocaleDateString();
  };

  // Helpers to resolve plan info and fees
  const getPlanById = (planId: string | undefined) =>
    plans.find((p) => p._id === planId);
  const getPlanNameForStudent = (student: Student) => {
    if (typeof student.subscriptionPlan === "string") {
      return (
        getPlanById(student.subscriptionPlan)?.planName ||
        student.subscriptionPlan
      );
    }
    return student.subscriptionPlan.planName;
  };
  const getPlanPriceForStudent = (student: Student) => {
    const planPrice =
      typeof student.subscriptionPlan === "string"
        ? getPlanById(student.subscriptionPlan)?.price
        : student.subscriptionPlan.price;
    return planPrice || 0;
  };

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
        if (import.meta.env.DEV) console.log("Students: Fetching data...");
        const [studentsResponse, plansResponse] = await Promise.all([
          adminApi.getUsers(),
          adminApi.getSubscriptionPlans(),
        ]);
        if (import.meta.env.DEV)
          console.log("Students: Received data:", {
            studentsResponse,
            plansResponse,
          });

        // Handle direct array responses from backend
        setStudents(studentsResponse || []);
        setPlans(plansResponse || []);

        if (import.meta.env.DEV)
          console.log("Students: Data loaded successfully");
      } catch (error) {
        console.error("Error fetching data:", error);
        showNotification("error", "Failed to fetch data from backend");
        setStudents([]);
        setPlans([]);
      } finally {
        setLoading(false);
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

  // Handler functions
  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setViewModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    // Parse seat number into section and number
    const seatMatch = student.seatNumber.match(/([A-Z])(\d+)/);
    const seatSection = seatMatch ? seatMatch[1] : "A";
    const seatNumber = seatMatch ? seatMatch[2] : "";

    setEditFormData({
      name: student.name,
      fatherName: student.fatherName || "",
      subscriptionPlan:
        typeof student.subscriptionPlan === "string"
          ? student.subscriptionPlan
          : student.subscriptionPlan._id,
      joiningDate: student.joiningDate.split("T")[0], // Format for date input
      address: student.address || "",
      adharNumber: student.adharNumber.toString(),
      seatSection,
      seatNumber,
      feePaid: student.feePaid,
      isActive: student.isActive,
  slot: student.slot || "",
  examPreparingFor: student.examPreparingFor || "",
  schoolOrCollegeName: student.schoolOrCollegeName || "",
  lockerService: student.lockerService || false,
    });
    setEditModalOpen(true);
  };

  const handleDelete = async (student: Student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      try {
        await adminApi.deleteStudent(student.adharNumber.toString());
        setStudents(students.filter((s) => s._id !== student._id));
        showNotification("success", "Student deleted successfully!");
      } catch (error) {
        console.error("Error deleting student:", error);
        showNotification("error", "Error deleting student. Please try again.");
      }
    }
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const {name, value, type} = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setEditLoading(true);
    try {
      // Combine seat section and number
      const fullSeatNumber = `${editFormData.seatSection}${editFormData.seatNumber}`;
      const submitData = {
        name: editFormData.name,
        fatherName: editFormData.fatherName || undefined,
        address: editFormData.address,
        adharNumber: parseInt(editFormData.adharNumber),
        seatNumber: fullSeatNumber,
        subscriptionPlan: editFormData.subscriptionPlan, // send ObjectId
        joiningDate: editFormData.joiningDate,
        feePaid: editFormData.feePaid,
        isActive: editFormData.isActive,
        slot: (editFormData.slot || undefined) as Student["slot"],
        examPreparingFor: editFormData.examPreparingFor || undefined,
        schoolOrCollegeName: editFormData.schoolOrCollegeName || undefined,
        lockerService: editFormData.lockerService,
      };

      const response = await adminApi.updateStudent(
        selectedStudent.adharNumber.toString(),
        submitData
      );

      // Backend returns {name, adharNumber, message} - refresh the student list
      const updatedStudents = await adminApi.getUsers();
      setStudents(updatedStudents || []);

      setEditModalOpen(false);
      showNotification(
        "success",
        response.message || "Student updated successfully!"
      );
    } catch (error) {
      console.error("Error updating student:", error);
      showNotification("error", "Error updating student. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.idNumber.toString().includes(searchTerm.toLowerCase());
    const matchesPlan =
      planFilter === "All Plans" ||
      (typeof student.subscriptionPlan === "string"
        ? student.subscriptionPlan
        : student.subscriptionPlan.planName) === planFilter;
    const matchesStatus =
      statusFilter === "All Status" ||
      (student.feePaid ? "Paid" : "Pending") === statusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
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
        <h1 className="text-2xl font-bold text-gray-900">All Students</h1>
        <p className="text-gray-600">Manage and view all registered students</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Filter by plan"
            >
              <option>All Plans</option>
              {plans.map((plan) => (
                <option key={plan._id} value={plan.planName}>
                  {plan.planName}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Filter by status"
            >
              <option>All Status</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Overdue</option>
            </select>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.seatNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getPlanNameForStudent(student)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹
                    {(
                      getPlanPriceForStudent(student) +
                      (student.lockerService ? 100 : 0)
                    ).toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(student.joiningDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {calculateExpiryDate(student)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        student.feePaid ? "Paid" : "Pending"
                      )}`}
                    >
                      {student.feePaid ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(student)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        aria-label={`View ${student.name}`}
                        title={`View ${student.name}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        aria-label={`Edit ${student.name}`}
                        title={`Edit ${student.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        aria-label={`Delete ${student.name}`}
                        title={`Delete ${student.name}`}
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
            Showing 1 to {filteredStudents.length} of {students.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 text-sm bg-slate-800 text-white rounded">
              1
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              3
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Student Modal */}
      {viewModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideIn">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Student Details
                </h2>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedStudent.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father's Name
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedStudent.fatherName || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slot
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedStudent.slot || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seat Number
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedStudent.seatNumber}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription Plan
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {typeof selectedStudent.subscriptionPlan === "string"
                      ? plans.find(
                          (p) => p._id === selectedStudent.subscriptionPlan
                        )?.planName || selectedStudent.subscriptionPlan
                      : selectedStudent.subscriptionPlan.planName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Fee
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    ₹
                    {(() => {
                      const base =
                        typeof selectedStudent.subscriptionPlan === "string"
                          ? plans.find(
                              (p) => p._id === selectedStudent.subscriptionPlan
                            )?.price || 0
                          : selectedStudent.subscriptionPlan.price;
                      const locker = selectedStudent.lockerService ? 100 : 0;
                      return (base + locker).toLocaleString("en-IN");
                    })()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joining Date
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {new Date(selectedStudent.joiningDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {calculateExpiryDate(selectedStudent)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fee Status
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      selectedStudent.feePaid ? "Paid" : "Pending"
                    )}`}
                  >
                    {selectedStudent.feePaid ? "Paid" : "Pending"}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedStudent.address}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School/College Name
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedStudent.schoolOrCollegeName || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhar Number
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedStudent.adharNumber}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Locker Service
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedStudent.lockerService ? "Yes (+₹100)" : "No"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedStudent.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedStudent.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideIn">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Student
                </h2>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter full name"
                      title="Full Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Father's Name
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={editFormData.fatherName}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter father's name"
                      title="Father's Name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slot
                    </label>
                    <select
                      name="slot"
                      value={editFormData.slot}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Slot"
                    >
                      <option value="">Select slot</option>
                      <option value="Morning">Morning</option>
                      <option value="Evening">Evening</option>
                      <option value="Full day">Full day</option>
                      <option value="24 Hour">24 Hour</option>
                      <option value="Short Slot">Short Slot</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subscription Plan
                    </label>
                    <select
                      name="subscriptionPlan"
                      value={editFormData.subscriptionPlan}
                      onChange={handleEditInputChange}
                      required
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={editFormData.joiningDate}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Joining date"
                      title="Joining Date"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhar Number
                    </label>
                    <input
                      type="text"
                      name="adharNumber"
                      value={editFormData.adharNumber}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Aadhar number"
                      title="Aadhar Number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditInputChange}
                    rows={3}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter address"
                    title="Address"
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
                      value={editFormData.examPreparingFor}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Exam preparing for"
                      title="Exam Preparing For"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School/College Name
                    </label>
                    <input
                      type="text"
                      name="schoolOrCollegeName"
                      value={editFormData.schoolOrCollegeName}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="School or college name"
                      title="School/College Name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seat Number
                    </label>
                    <div className="flex space-x-2">
                      <select
                        name="seatSection"
                        value={editFormData.seatSection}
                        onChange={handleEditInputChange}
                        required
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Seat Section"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                      </select>
                      <input
                        type="number"
                        name="seatNumber"
                        value={editFormData.seatNumber}
                        onChange={handleEditInputChange}
                        placeholder="10"
                        min="1"
                        max="99"
                        required
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Seat Number"
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
                      id="editFeePaid"
                      name="feePaid"
                      checked={editFormData.feePaid}
                      onChange={handleEditInputChange}
                      className="mr-2"
                    />
                    <label
                      htmlFor="editFeePaid"
                      className="text-sm text-gray-700"
                    >
                      Fee Paid
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editIsActive"
                      name="isActive"
                      checked={editFormData.isActive}
                      onChange={handleEditInputChange}
                      className="mr-2"
                    />
                    <label
                      htmlFor="editIsActive"
                      className="text-sm text-gray-700"
                    >
                      Active
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editLockerService"
                      name="lockerService"
                      checked={editFormData.lockerService}
                      onChange={handleEditInputChange}
                      className="mr-2"
                    />
                    <label
                      htmlFor="editLockerService"
                      className="text-sm text-gray-700"
                    >
                      Locker Service (+₹100/month)
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-slate-800 border border-transparent rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    {editLoading ? "Updating..." : "Update Student"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
              title="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};
export default StudentsView;
