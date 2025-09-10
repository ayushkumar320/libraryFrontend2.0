import React, {useState, useEffect} from "react";
import {Search, Plus, User, X} from "lucide-react";
import {adminApi} from "../../services/api";
import {SeatManagementData, Student, SubscriptionPlan} from "../../types/api";

const SeatsView: React.FC = () => {
  const [seatData, setSeatData] = useState<SeatManagementData>({
    totalSeats: 0,
    occupiedSeats: 0,
    availableSeats: 0,
    seats: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedSection, setSelectedSection] = useState<"A" | "B">("A");

  // Modal states
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [addSeatModalOpen, setAddSeatModalOpen] = useState(false);
  const [editSeatModalOpen, setEditSeatModalOpen] = useState(false);
  const [seatDetailsModalOpen, setSeatDetailsModalOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<string>("");
  const [selectedSeatDetails, setSelectedSeatDetails] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
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
    addMode: "single" as "single" | "row", // New field for add mode
    singleSeatNumber: "", // For single seat addition
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
        const [seatResponse, studentsResponse, plansResponse] =
          await Promise.all([
            adminApi.getSeatManagement(),
            adminApi.getUsers(),
            adminApi.getSubscriptionPlans(),
          ]);
        console.log("Seats: Received data:", {seatResponse, studentsResponse});

        if (seatResponse?.seats) {
          // Check if Section B has no seats and initialize if needed
          const sectionBSeats = seatResponse.seats.filter((seat) =>
            seat.seatNumber.startsWith("B")
          );

          if (sectionBSeats.length === 0) {
            try {
              console.log("Initializing Section B with default 39 seats...");
              await adminApi.initializeDefaultSeats();
              // Refetch data after initialization
              const updatedSeatResponse = await adminApi.getSeatManagement();
              setSeatData(updatedSeatResponse);
            } catch (initError) {
              console.error("Error initializing default seats:", initError);
              setSeatData(seatResponse);
            }
          } else {
            setSeatData(seatResponse);
          }
        } else {
          setSeatData({
            totalSeats: 0,
            occupiedSeats: 0,
            availableSeats: 0,
            seats: [],
          });
        }

        setStudents(studentsResponse || []);
        setPlans(plansResponse || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        showNotification("error", "Failed to fetch data from backend");
        setSeatData({
          totalSeats: 0,
          occupiedSeats: 0,
          availableSeats: 0,
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

  const handleSeatClick = async (seatNumber: string) => {
    try {
      const seatInfo = await adminApi.getSeatInfo(seatNumber);
      setSelectedSeatDetails(seatInfo);
      setSeatDetailsModalOpen(true);
    } catch (error) {
      console.error("Error fetching seat details:", error);
      showNotification("error", "Failed to fetch seat details");
    }
  };

  const handleDeleteSeat = async (seatNumber: string) => {
    if (
      !window.confirm(`Are you sure you want to delete seat ${seatNumber}?`)
    ) {
      return;
    }
    try {
      await adminApi.deleteSeat(seatNumber);
      await refreshSeats();
      showNotification("success", `Seat ${seatNumber} deleted successfully!`);
    } catch (error: any) {
      console.error("Error deleting seat:", error);
      const errorMessage = error?.message || "Failed to delete seat";
      showNotification("error", errorMessage);
    }
  };

  const handleSeatSelection = (seatNumber: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleBulkDeleteSeats = async () => {
    if (selectedSeats.length === 0) {
      showNotification("error", "Please select seats to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedSeats.length} selected seat(s)?`
      )
    ) {
      return;
    }

    try {
      const deletePromises = selectedSeats.map((seatNumber) =>
        adminApi.deleteSeat(seatNumber)
      );
      await Promise.all(deletePromises);
      await refreshSeats();
      setSelectedSeats([]);
      showNotification(
        "success",
        `${selectedSeats.length} seat(s) deleted successfully!`
      );
    } catch (error: any) {
      console.error("Error deleting seats:", error);
      const errorMessage = error?.message || "Failed to delete some seats";
      showNotification("error", errorMessage);
    }
  };

  const handleEditSeat = () => {
    setEditSeatModalOpen(true);
  };

  const refreshSeats = async () => {
    try {
      console.log("Refreshing seat data...");
      const latest = await adminApi.getSeatManagement();
      console.log("Refreshed seat data:", latest);

      if (latest?.seats) {
        setSeatData(latest);
      } else {
        console.warn("Invalid seat data received during refresh");
        setSeatData({
          totalSeats: 0,
          occupiedSeats: 0,
          availableSeats: 0,
          seats: [],
        });
      }
    } catch (e) {
      console.error("Seats: refresh failed", e);
      showNotification("error", "Failed to refresh seat data");
    }
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

      // Find the selected plan to get duration
      const selectedPlan = plans.find(
        (p) => p._id === allocationForm.subscriptionPlan
      );
      if (!selectedPlan) {
        showNotification("error", "Selected subscription plan not found.");
        return;
      }

      // Calculate expiry date based on subscription plan duration
      const today = new Date();
      const expiryDate = new Date(today);
      const durationLower = selectedPlan.duration.toLowerCase();

      if (durationLower.includes("day")) {
        const days = parseInt(selectedPlan.duration.match(/\d+/)?.[0] || "30");
        expiryDate.setDate(today.getDate() + days);
      } else if (durationLower.includes("week")) {
        const weeks = parseInt(selectedPlan.duration.match(/\d+/)?.[0] || "4");
        expiryDate.setDate(today.getDate() + weeks * 7);
      } else if (durationLower.includes("month")) {
        const months = parseInt(selectedPlan.duration.match(/\d+/)?.[0] || "1");
        expiryDate.setMonth(today.getMonth() + months);
      } else if (durationLower.includes("year")) {
        const years = parseInt(selectedPlan.duration.match(/\d+/)?.[0] || "1");
        expiryDate.setFullYear(today.getFullYear() + years);
      }

      // Update seat via API
      // Backend expects partial seat update (using simplified contract). We send studentName & subscriptionPlan.
      await adminApi.updateSeat(selectedSeat, {
        status: "Occupied",
        studentName: selectedStudent.name,
        subscriptionPlan: selectedPlan.planName,
        allocatedDate: today.toISOString().split("T")[0],
        expiryDate: expiryDate.toISOString().split("T")[0],
      });

      await refreshSeats();

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
    if (!window.confirm("Are you sure you want to deallocate this seat?"))
      return;
    try {
      await adminApi.updateSeat(seatNumber, {
        status: "Available",
        studentName: undefined,
        subscriptionPlan: undefined,
        allocatedDate: undefined,
        expiryDate: undefined,
      });
      await refreshSeats();
      showNotification("success", "Seat deallocated successfully!");
    } catch (error) {
      console.error("Error deallocating seat:", error);
      showNotification("error", "Error deallocating seat. Please try again.");
    }
  };
  // Maintenance logic removed (not supported by backend currently)

  // Get current section seats
  const getCurrentSectionSeats = () => {
    return seatData.seats.filter((seat) =>
      seat.seatNumber.startsWith(selectedSection)
    );
  };

  // Get dynamic seat count for a section
  const getSectionSeatCount = (section: "A" | "B") => {
    const sectionSeats = seatData.seats.filter((seat) =>
      seat.seatNumber.startsWith(section)
    );

    if (sectionSeats.length === 0) {
      // For Section B, default to 39 seats if none exist
      return section === "B" ? 39 : 0;
    }

    const sectionNumbers = sectionSeats
      .map((seat) => parseInt(seat.seatNumber.substring(1)))
      .filter((num) => !isNaN(num));

    const maxSeat = sectionNumbers.length > 0 ? Math.max(...sectionNumbers) : 0;

    // For Section B, ensure minimum of 39 seats
    return section === "B" ? Math.max(maxSeat, 39) : maxSeat;
  };

  // Get dynamic seat range for display
  const getSectionRange = (section: "A" | "B") => {
    const maxSeat = getSectionSeatCount(section);
    if (maxSeat === 0) return "No seats";

    // For Section B, show default range even if no seats exist in DB
    if (section === "B" && maxSeat === 39) {
      const actualSeats = seatData.seats.filter((seat) =>
        seat.seatNumber.startsWith("B")
      ).length;
      if (actualSeats === 0) return "1-39 (default)";
    }

    return `1-${maxSeat}`;
  };

  // Generate seat grid for visual display - dynamic based on existing seats
  const generateSeatGrid = (section: "A" | "B") => {
    const sectionSeats = getCurrentSectionSeats();
    const sectionNumbers = sectionSeats
      .filter((seat) => seat.seatNumber.startsWith(section))
      .map((seat) => parseInt(seat.seatNumber.substring(1)))
      .filter((num) => !isNaN(num))
      .sort((a, b) => a - b);

    // Find the maximum seat number for this section
    let maxExistingSeat =
      sectionNumbers.length > 0 ? Math.max(...sectionNumbers) : 0;

    // For Section B, ensure we show at least 39 seats
    if (section === "B") {
      maxExistingSeat = Math.max(maxExistingSeat, 39);
    }

    // If no seats exist for Section A, return empty array
    if (section === "A" && maxExistingSeat === 0) {
      return [];
    }

    // Generate seats up to the maximum seat number
    const seats = [];
    for (let i = 1; i <= maxExistingSeat; i++) {
      const seatNumber = `${section}${i}`;
      const seatData = sectionSeats.find((s) => s.seatNumber === seatNumber);

      seats.push({
        number: seatNumber,
        status: seatData?.status || "Available",
        studentName: seatData?.studentName,
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
        {/* Maintenance card removed */}
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
                Section A ({getSectionRange("A")})
              </button>
              <button
                onClick={() => setSelectedSection("B")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedSection === "B"
                    ? "bg-slate-800 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Section B ({getSectionRange("B")})
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAddSeatModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Seats</span>
            </button>
            <button
              onClick={handleEditSeat}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Edit Seats</span>
            </button>
            {selectedSeats.length > 0 && (
              <button
                onClick={handleBulkDeleteSeats}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Delete Selected ({selectedSeats.length})</span>
              </button>
            )}
          </div>
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
            {/* Maintenance filter removed */}
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
          {/* Maintenance legend removed */}
        </div>
      </div>

      {/* Seat Grid */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Section {selectedSection} ({getSectionSeatCount(selectedSection)}{" "}
          seats)
        </h4>
        {generateSeatGrid(selectedSection).length === 0 &&
        selectedSection === "A" ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🪑</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No seats in Section {selectedSection}
            </h3>
            <p className="text-gray-500 mb-4">
              Start by adding some seats to this section.
            </p>
            <button
              onClick={() => setAddSeatModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Seat</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-11 gap-2">
            {generateSeatGrid(selectedSection).map((seat) => (
              <div key={seat.number} className="relative group">
                <div className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={selectedSeats.includes(seat.number)}
                    onChange={() => handleSeatSelection(seat.number)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleSeatClick(seat.number)}
                    className={`w-12 h-12 rounded-lg font-medium text-sm transition-all hover:scale-105 ${getSeatColor(
                      seat.status
                    )} cursor-pointer hover:opacity-80`}
                    title={
                      seat.studentName
                        ? `${seat.number} - ${seat.studentName} (Click for details)`
                        : `${seat.number} (Click for details)`
                    }
                  >
                    {seat.number.replace(selectedSection, "")}
                  </button>
                </div>
                {seat.studentName && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {seat.studentName}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
                      <button
                        onClick={() => handleSeatClick(seat.seatNumber)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View seat details"
                      >
                        <User className="w-4 h-4" />
                      </button>
                      {seat.status === "Available" ? (
                        <button
                          onClick={() => handleAllocateSeat(seat.seatNumber)}
                          className="bg-slate-800 text-white px-3 py-1 rounded text-xs hover:bg-slate-700 transition-colors"
                        >
                          Allocate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeallocateSeat(seat.seatNumber)}
                          className="text-orange-600 hover:text-orange-900 transition-colors"
                          title="Deallocate seat"
                        >
                          <User className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSeat(seat.seatNumber)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete seat"
                      >
                        <X className="w-4 h-4" />
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
                    {plans.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.planName} - ₹{plan.price}
                      </option>
                    ))}
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
                    Add Mode
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="single"
                        checked={addSeatForm.addMode === "single"}
                        onChange={(e) =>
                          setAddSeatForm((prev) => ({
                            ...prev,
                            addMode: e.target.value as "single" | "row",
                          }))
                        }
                        className="mr-2"
                      />
                      Single Seat
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="row"
                        checked={addSeatForm.addMode === "row"}
                        onChange={(e) =>
                          setAddSeatForm((prev) => ({
                            ...prev,
                            addMode: e.target.value as "single" | "row",
                          }))
                        }
                        className="mr-2"
                      />
                      Row of Seats
                    </label>
                  </div>
                </div>
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

                {addSeatForm.addMode === "single" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seat Number
                    </label>
                    <input
                      type="number"
                      value={addSeatForm.singleSeatNumber}
                      onChange={(e) =>
                        setAddSeatForm((prev) => ({
                          ...prev,
                          singleSeatNumber: e.target.value,
                        }))
                      }
                      placeholder={`e.g., ${
                        getSectionSeatCount(addSeatForm.section) + 1
                      }`}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <div className="bg-blue-50 p-3 rounded-lg mt-2">
                      <p className="text-sm text-blue-800">
                        This will add seat {addSeatForm.section}
                        {addSeatForm.singleSeatNumber || "X"}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Current seats in Section {addSeatForm.section}:{" "}
                        {getSectionSeatCount(addSeatForm.section)}
                      </p>
                    </div>
                  </div>
                ) : (
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
                        placeholder={`e.g., ${
                          getSectionSeatCount(addSeatForm.section) + 1
                        }`}
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
                        placeholder={`e.g., ${
                          getSectionSeatCount(addSeatForm.section) + 5
                        }`}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="col-span-2 bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        This will add seats from {addSeatForm.section}
                        {addSeatForm.startNumber || "X"} to{" "}
                        {addSeatForm.section}
                        {addSeatForm.endNumber || "Y"}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Current seats in Section {addSeatForm.section}:{" "}
                        {getSectionSeatCount(addSeatForm.section)}
                      </p>
                    </div>
                  </div>
                )}
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
                onClick={async () => {
                  try {
                    if (addSeatForm.addMode === "single") {
                      const seatNum = parseInt(
                        addSeatForm.singleSeatNumber,
                        10
                      );
                      if (isNaN(seatNum) || seatNum < 1) {
                        showNotification(
                          "error",
                          "Please enter a valid seat number (minimum 1)"
                        );
                        return;
                      }

                      // Check if seat already exists
                      const seatNumber = `${addSeatForm.section}${seatNum}`;
                      const existingSeat = seatData.seats.find(
                        (s) => s.seatNumber === seatNumber
                      );
                      if (existingSeat) {
                        showNotification(
                          "error",
                          `Seat ${seatNumber} already exists`
                        );
                        return;
                      }

                      console.log(`Adding seat: ${seatNumber}`);
                      await adminApi.addSeat({seatNumber});
                      console.log(
                        `Seat ${seatNumber} added, refreshing data...`
                      );
                      await refreshSeats();
                      console.log(`Data refreshed for seat ${seatNumber}`);
                      showNotification(
                        "success",
                        `Seat ${seatNumber} added successfully!`
                      );
                    } else {
                      const start = parseInt(addSeatForm.startNumber, 10);
                      const end = parseInt(addSeatForm.endNumber, 10);
                      if (
                        isNaN(start) ||
                        isNaN(end) ||
                        end < start ||
                        start < 1
                      ) {
                        showNotification(
                          "error",
                          "Invalid seat range. Start and end must be valid numbers, and start must be at least 1"
                        );
                        return;
                      }

                      // Check for existing seats in the range
                      const existingSeats = [];
                      for (let num = start; num <= end; num++) {
                        const seatNumber = `${addSeatForm.section}${num}`;
                        const existingSeat = seatData.seats.find(
                          (s) => s.seatNumber === seatNumber
                        );
                        if (existingSeat) {
                          existingSeats.push(seatNumber);
                        }
                      }

                      if (existingSeats.length > 0) {
                        showNotification(
                          "error",
                          `These seats already exist: ${existingSeats.join(
                            ", "
                          )}`
                        );
                        return;
                      }

                      console.log(`Adding seats: B${start} to B${end}`);
                      for (let num = start; num <= end; num++) {
                        const seatNumber = `${addSeatForm.section}${num}`;
                        console.log(`Adding seat: ${seatNumber}`);
                        await adminApi.addSeat({seatNumber});
                      }
                      console.log(`All seats added, refreshing data...`);
                      await refreshSeats();
                      console.log(`Data refreshed for seat range`);
                      showNotification(
                        "success",
                        `${end - start + 1} seats added successfully!`
                      );
                    }
                    setAddSeatModalOpen(false);
                    // Reset form
                    setAddSeatForm({
                      section: "A",
                      startNumber: "",
                      endNumber: "",
                      addMode: "single",
                      singleSeatNumber: "",
                    });
                  } catch (e) {
                    console.error("Add seats error", e);
                    showNotification("error", "Failed to add seats");
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
              >
                Add {addSeatForm.addMode === "single" ? "Seat" : "Seats"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Seats Modal */}
      {editSeatModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 transform transition-all duration-300 animate-slideIn">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Seats
                </h2>
                <button
                  onClick={() => setEditSeatModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Selected Seats ({selectedSeats.length})
                  </h3>
                  {selectedSeats.length === 0 ? (
                    <p className="text-gray-500">
                      No seats selected. Please select seats from the grid
                      above.
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedSeats.map((seatNumber) => (
                        <div
                          key={seatNumber}
                          className="bg-gray-100 p-2 rounded text-center"
                        >
                          {seatNumber}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedSeats.length > 0 && (
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3">
                        Bulk Actions
                      </h4>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleBulkDeleteSeats}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Delete Selected</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSeats([]);
                            showNotification("success", "Selection cleared");
                          }}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setEditSeatModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seat Details Modal */}
      {seatDetailsModalOpen && selectedSeatDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideIn">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Seat {selectedSeatDetails.seatNumber} Details
                </h2>
                <button
                  onClick={() => setSeatDetailsModalOpen(false)}
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
                    Seat Number
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedSeatDetails.seatNumber}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedSeatDetails.section}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedSeatDetails.status === "Occupied"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {selectedSeatDetails.status}
                  </span>
                </div>
              </div>

              {selectedSeatDetails.students &&
                selectedSeatDetails.students.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Assigned Students
                    </h3>
                    <div className="space-y-4">
                      {selectedSeatDetails.students.map(
                        (student: any, index: number) => (
                          <div
                            key={index}
                            className="bg-gray-50 p-4 rounded-lg"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Student Name
                                </label>
                                <p className="text-sm text-gray-900">
                                  {student.name}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Father's Name
                                </label>
                                <p className="text-sm text-gray-900">
                                  {student.fatherName || "-"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Date of Birth
                                </label>
                                <p className="text-sm text-gray-900">
                                  {student.dateOfBirth
                                    ? new Date(
                                        student.dateOfBirth
                                      ).toLocaleDateString()
                                    : "-"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Slot
                                </label>
                                <p className="text-sm text-gray-900">
                                  {student.slot || "-"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Plan
                                </label>
                                <p className="text-sm text-gray-900">
                                  {student.plan || "-"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Fee Status
                                </label>
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    student.feePaid
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {student.feePaid ? "Paid" : "Pending"}
                                </span>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Joining Date
                                </label>
                                <p className="text-sm text-gray-900">
                                  {student.joiningDate
                                    ? new Date(
                                        student.joiningDate
                                      ).toLocaleDateString()
                                    : "-"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Expiry Date
                                </label>
                                <p className="text-sm text-gray-900">
                                  {student.expiryDate
                                    ? new Date(
                                        student.expiryDate
                                      ).toLocaleDateString()
                                    : "-"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Total Fee
                                </label>
                                <p className="text-sm text-gray-900">
                                  ₹
                                  {(() => {
                                    const planPrice =
                                      plans.find(
                                        (p) => p.planName === student.plan
                                      )?.price || 0;
                                    const lockerFee = student.lockerService
                                      ? 100
                                      : 0;
                                    return (
                                      planPrice + lockerFee
                                    ).toLocaleString("en-IN");
                                  })()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {(!selectedSeatDetails.students ||
                selectedSeatDetails.students.length === 0) && (
                <div className="mt-6 text-center py-8">
                  <p className="text-gray-500">
                    No students assigned to this seat
                  </p>
                  <button
                    onClick={() => {
                      setSeatDetailsModalOpen(false);
                      handleAllocateSeat(selectedSeatDetails.seatNumber);
                    }}
                    className="mt-4 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Assign Student
                  </button>
                </div>
              )}
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
