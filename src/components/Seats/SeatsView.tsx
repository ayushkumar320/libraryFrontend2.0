import React, {useState, useEffect} from "react";
import {Search, Plus, User, CheckCircle, Wrench, X} from "lucide-react";
import {adminApi} from "../../services/api";
import {SeatManagementData, Student} from "../../types/api";

const SeatsView: React.FC = () => {
  const [seatData, setSeatData] = useState<SeatManagementData>({
    totalSeats: 0,
    occupiedSeats: 0,
    availableSeats: 0,
    maintenanceSeats: 0,
    seats: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedSection, setSelectedSection] = useState<"A" | "B">("A");

  // Modal states
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [addSeatModalOpen, setAddSeatModalOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [allocateLoading, setAllocateLoading] = useState(false);

  // Form data for allocation
  const [allocationForm, setAllocationForm] = useState({
    studentId: "",
    subscriptionPlan: "",
  });

  // Form data for adding seat
  const [addSeatForm, setAddSeatForm] = useState({
    section: "A" as "A" | "B",
    startNumber: "",
    endNumber: "",
  });

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
        console.log("Seats: Fetching data...");
        const [seatResponse, studentsResponse] = await Promise.all([
          adminApi.getSeatManagement(),
          adminApi.getUsers(),
        ]);
        console.log("Seats: Received data:", {seatResponse, studentsResponse});

        if (seatResponse?.seats) {
          const seats = seatResponse.seats;
          const occupiedSeats = seats.filter(
            (s) => s.status === "Occupied"
          ).length;
          const availableSeats = seats.filter(
            (s) => s.status === "Available"
          ).length;
          const maintenanceSeats = seats.filter(
            (s) => s.status === "Maintenance"
          ).length;

          setSeatData({
            totalSeats: seats.length,
            occupiedSeats,
            availableSeats,
            maintenanceSeats,
            seats,
          });
        } else {
          // No seat data available
          setSeatData({
            totalSeats: 0,
            occupiedSeats: 0,
            availableSeats: 0,
            maintenanceSeats: 0,
            seats: [],
          });
        }

        setStudents(studentsResponse || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        showNotification("error", "Failed to fetch data from backend");
        setSeatData({
          totalSeats: 0,
          occupiedSeats: 0,
          availableSeats: 0,
          maintenanceSeats: 0,
          seats: [],
        });
        setStudents([]);
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
  const handleAllocateSeat = (seatNumber: string) => {
    setSelectedSeat(seatNumber);
    setAllocationForm({studentId: "", subscriptionPlan: ""}); // Reset form
    setAllocateModalOpen(true);
  };

  const handleSubmitAllocation = async () => {
    if (!allocationForm.studentId || !allocationForm.subscriptionPlan) {
      showNotification(
        "error",
        "Please select both student and subscription plan."
      );
      return;
    }

    setAllocateLoading(true);
    try {
      // Find the selected student
      const selectedStudent = students.find(
        (s) => s._id === allocationForm.studentId
      );
      if (!selectedStudent) {
        showNotification("error", "Selected student not found.");
        return;
      }

      // Calculate expiry date based on subscription plan
      const today = new Date();
      const expiryDate = new Date(today);

      switch (allocationForm.subscriptionPlan) {
        case "Monthly":
          expiryDate.setMonth(today.getMonth() + 1);
          break;
        case "Quarterly":
          expiryDate.setMonth(today.getMonth() + 3);
          break;
        case "Yearly":
          expiryDate.setFullYear(today.getFullYear() + 1);
          break;
      }

      // Update seat via API
      const seatUpdateData = {
        studentId: selectedStudent._id,
        studentName: selectedStudent.name,
        subscriptionPlan: allocationForm.subscriptionPlan,
        allocatedDate: today.toISOString().split("T")[0],
        expiryDate: expiryDate.toISOString().split("T")[0],
        status: "Occupied",
      };

      await adminApi.updateSeat(selectedSeat, seatUpdateData);

      // Update local state
      setSeatData((prev) => ({
        ...prev,
        seats: prev.seats.map((seat) =>
          seat.seatNumber === selectedSeat
            ? {
                ...seat,
                status: "Occupied" as "Occupied",
                studentId: selectedStudent._id,
                studentName: selectedStudent.name,
                subscriptionPlan: allocationForm.subscriptionPlan,
                allocatedDate: today.toISOString().split("T")[0],
                expiryDate: expiryDate.toISOString().split("T")[0],
              }
            : seat
        ),
        occupiedSeats: prev.occupiedSeats + 1,
        availableSeats: prev.availableSeats - 1,
      }));

      showNotification(
        "success",
        `Seat ${selectedSeat} allocated to ${selectedStudent.name} successfully!`
      );
      setAllocateModalOpen(false);
      setAllocationForm({studentId: "", subscriptionPlan: ""});
    } catch (error) {
      console.error("Error allocating seat:", error);
      showNotification("error", "Error allocating seat. Please try again.");
    } finally {
      setAllocateLoading(false);
    }
  };

  const handleDeallocateSeat = async (seatNumber: string) => {
    if (window.confirm("Are you sure you want to deallocate this seat?")) {
      try {
        // Call API to update seat status
        await adminApi.updateSeat(seatNumber, {
          status: "Available",
          studentId: null,
          studentName: null,
          subscriptionPlan: null,
          allocatedDate: null,
          expiryDate: null,
        });

        // Update local state
        setSeatData((prev) => ({
          ...prev,
          seats: prev.seats.map((seat) =>
            seat.seatNumber === seatNumber
              ? {
                  ...seat,
                  status: "Available",
                  studentName: undefined,
                  subscriptionPlan: undefined,
                  allocatedDate: undefined,
                  expiryDate: undefined,
                }
              : seat
          ),
          occupiedSeats: prev.occupiedSeats - 1,
          availableSeats: prev.availableSeats + 1,
        }));

        showNotification("success", "Seat deallocated successfully!");
      } catch (error) {
        console.error("Error deallocating seat:", error);
        showNotification("error", "Error deallocating seat. Please try again.");
      }
    }
  };

  const handleToggleMaintenance = async (
    seatNumber: string,
    currentStatus: string
  ) => {
    try {
      const newStatus =
        currentStatus === "Maintenance" ? "Available" : "Maintenance";

      setSeatData((prev) => ({
        ...prev,
        seats: prev.seats.map((seat) =>
          seat.seatNumber === seatNumber
            ? {...seat, status: newStatus as "Available" | "Occupied" | "Maintenance"}
            : seat
        ),
        maintenanceSeats:
          newStatus === "Maintenance"
            ? prev.maintenanceSeats + 1
            : prev.maintenanceSeats - 1,
        availableSeats:
          newStatus === "Available"
            ? prev.availableSeats + 1
            : prev.availableSeats - 1,
      }));

      showNotification(
        "success",
        `Seat ${
          newStatus === "Maintenance"
            ? "marked for maintenance"
            : "marked as available"
        }!`
      );
    } catch (error) {
      console.error("Error updating seat status:", error);
      showNotification(
        "error",
        "Error updating seat status. Please try again."
      );
    }
  };

  // Get current section seats
  const getCurrentSectionSeats = () => {
    return seatData.seats.filter((seat) =>
      seat.seatNumber.startsWith(selectedSection)
    );
  };

  // Generate seat grid for visual display
  const generateSeatGrid = (section: "A" | "B") => {
    const maxSeats = section === "A" ? 66 : 39;
    const seats = [];

    for (let i = 1; i <= maxSeats; i++) {
      const seatNumber = `${section}${i}`;
      const seatData = getCurrentSectionSeats().find(
        (s) => s.seatNumber === seatNumber
      );

      seats.push({
        number: seatNumber,
        status: seatData?.status || "Available",
        student: seatData?.studentName,
      });
    }
    return seats;
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case "Occupied":
        return "bg-slate-600 text-white";
      case "Available":
        return "bg-green-500 text-white hover:bg-green-600";
      case "Maintenance":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Occupied":
        return "bg-red-100 text-red-800";
      case "Available":
        return "bg-green-100 text-green-800";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seat Management</h1>
          <p className="text-gray-600">NaiUdaan Library</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Seats</p>
              <p className="text-2xl font-bold text-gray-900">
                {seatData.totalSeats}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <span className="text-2xl">🪑</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-gray-900">
                {seatData.occupiedSeats}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 text-red-600">
              <span className="text-2xl">👤</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {seatData.availableSeats}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">
                {seatData.maintenanceSeats}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
              <span className="text-2xl">🔧</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Selector and Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">Seat Layout</h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedSection("A")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedSection === "A"
                    ? "bg-slate-800 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Section A (1-66)
              </button>
              <button
                onClick={() => setSelectedSection("B")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedSection === "B"
                    ? "bg-slate-800 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Section B (1-39)
              </button>
            </div>
          </div>
          <button
            onClick={() => setAddSeatModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Seats</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by seat number or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Filter by seat status"
            aria-label="Filter by seat status"
          >
            <option>All Status</option>
            <option>Occupied</option>
            <option>Available</option>
            <option>Maintenance</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end space-x-4 text-sm mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-slate-600 rounded"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Maintenance</span>
          </div>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Section {selectedSection} (
          {selectedSection === "A" ? "66 seats" : "39 seats"})
        </h4>
        <div className="grid grid-cols-11 gap-2">
          {generateSeatGrid(selectedSection).map((seat) => (
            <div key={seat.number} className="relative group">
              <button
                onClick={() => {
                  if (seat.status === "Available") {
                    handleAllocateSeat(seat.number);
                  }
                }}
                className={`w-12 h-12 rounded-lg font-medium text-sm transition-all hover:scale-105 ${getSeatColor(
                  seat.status
                )} ${
                  seat.status === "Available"
                    ? "cursor-pointer hover:opacity-80"
                    : "cursor-default"
                }`}
                title={
                  seat.student
                    ? `${seat.number} - ${seat.student}`
                    : seat.number
                }
              >
                {seat.number.replace(selectedSection, "")}
              </button>
              {seat.student && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {seat.student}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Seat Allocations Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Seat Allocations
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seat No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allocated Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
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
              {seatData.seats.map((seat, index) => (
                <tr key={seat.seatNumber || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {seat.seatNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {seat.studentName ? (
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-gray-600">
                            {seat.studentName.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">
                          {seat.studentName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {seat.subscriptionPlan || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {seat.allocatedDate
                      ? new Date(seat.allocatedDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {seat.expiryDate
                      ? new Date(seat.expiryDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        seat.status
                      )}`}
                    >
                      {seat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {seat.status === "Available" ? (
                        <button
                          onClick={() => handleAllocateSeat(seat.seatNumber)}
                          className="bg-slate-800 text-white px-3 py-1 rounded text-xs hover:bg-slate-700 transition-colors"
                        >
                          Allocate
                        </button>
                      ) : seat.status === "Occupied" ? (
                        <>
                          <button
                            onClick={() =>
                              handleDeallocateSeat(seat.seatNumber)
                            }
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Deallocate seat"
                          >
                            <User className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleMaintenance(
                                seat.seatNumber,
                                seat.status
                              )
                            }
                            className="text-yellow-600 hover:text-yellow-900 transition-colors"
                            title="Mark for maintenance"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            handleToggleMaintenance(
                              seat.seatNumber,
                              seat.status
                            )
                          }
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Mark as available"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1 to 3 of 120 seats
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
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Allocate Seat Modal */}
      {allocateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 animate-slideIn">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Allocate Seat {selectedSeat}
                </h2>
                <button
                  onClick={() => setAllocateModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Student
                  </label>
                  <select
                    value={allocationForm.studentId}
                    onChange={(e) =>
                      setAllocationForm((prev) => ({
                        ...prev,
                        studentId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    title="Select student"
                    aria-label="Select student"
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name} - ID: {student.idNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subscription Plan
                  </label>
                  <select
                    value={allocationForm.subscriptionPlan}
                    onChange={(e) =>
                      setAllocationForm((prev) => ({
                        ...prev,
                        subscriptionPlan: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    title="Select subscription plan"
                    aria-label="Select subscription plan"
                  >
                    <option value="">Select a plan</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setAllocateModalOpen(false)}
                disabled={allocateLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAllocation}
                disabled={
                  !allocationForm.studentId ||
                  !allocationForm.subscriptionPlan ||
                  allocateLoading
                }
                className="px-4 py-2 text-sm font-medium text-white bg-slate-800 border border-transparent rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {allocateLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Allocating...
                  </>
                ) : (
                  "Allocate Seat"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Seats Modal */}
      {addSeatModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 animate-slideIn">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Add New Seats
                </h2>
                <button
                  onClick={() => setAddSeatModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section
                  </label>
                  <select
                    value={addSeatForm.section}
                    onChange={(e) =>
                      setAddSeatForm((prev) => ({
                        ...prev,
                        section: e.target.value as "A" | "B",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Select seat section"
                    aria-label="Select seat section"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Number
                    </label>
                    <input
                      type="number"
                      value={addSeatForm.startNumber}
                      onChange={(e) =>
                        setAddSeatForm((prev) => ({
                          ...prev,
                          startNumber: e.target.value,
                        }))
                      }
                      placeholder="e.g., 67"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Number
                    </label>
                    <input
                      type="number"
                      value={addSeatForm.endNumber}
                      onChange={(e) =>
                        setAddSeatForm((prev) => ({
                          ...prev,
                          endNumber: e.target.value,
                        }))
                      }
                      placeholder="e.g., 70"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    This will add seats from {addSeatForm.section}
                    {addSeatForm.startNumber || "X"} to {addSeatForm.section}
                    {addSeatForm.endNumber || "Y"}
                  </p>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setAddSeatModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle adding seats logic here
                  const count =
                    parseInt(addSeatForm.endNumber) -
                    parseInt(addSeatForm.startNumber) +
                    1;
                  showNotification(
                    "success",
                    `${count} seats added successfully!`
                  );
                  setAddSeatModalOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Seats
              </button>
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
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatsView;
