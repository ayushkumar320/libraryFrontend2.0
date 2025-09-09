export interface Student {
  _id: string;
  name: string; // Changed from fullName to match backend schema
  slot?: "Morning" | "Evening" | "Full day" | "24 Hour";
  idNumber: number; // Changed from email to match backend schema
  age?: number; // Made optional to match backend schema
  adharNumber: number; // Changed from string to number to match backend schema
  address?: string; // Made optional to match backend schema
  examPreparingFor?: string;
  schoolOrCollegeName?: string;
  seatNumber: string;
  subscriptionPlan: string | SubscriptionPlan; // Can be ObjectId string or populated object
  joiningDate: string;
  feePaid: boolean; // Changed from feeStatus to match backend schema
  isActive: boolean;
  lockerService?: boolean;
}

export interface SubscriptionPlan {
  _id: string;
  planName: string;
  duration: string;
  price: number;
  subscribers?: string[]; // Array of User ObjectIds
  status: boolean;
}

// Seat item as returned by getSeatManagement (transformed in frontend)
export interface ManagedSeat {
  seatNumber: string;
  section: string | null;
  student: string; // name or 'Available'
  plan: string; // plan name or '-'
  joiningDate: string; // yyyy-mm-dd or '-'
  expirationDate: string; // yyyy-mm-dd or '-'
  status: "Occupied" | "Available";
  feePaid: boolean;
}

export interface DashboardStats {
  totalStudents: number;
  availableSeats: number;
  expiringSoon: number;
  activeUsers: number;
  totalPlans: number;
}

export interface Seat {
  // Simple representation currently used in UI grids
  seatNumber: string;
  studentName?: string; // derived local label
  subscriptionPlan?: string; // plan name
  allocatedDate?: string; // joining date
  expiryDate?: string; // expirationDate
  status: "Available" | "Occupied";
}

export interface SeatManagementData {
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  seats: Seat[];
}

// Raw seat management response from backend
export interface SeatManagementApiResponse {
  statistics: {
    totalSeats: number;
    occupiedSeats: number;
    availableSeats: number;
    sectionA: {total: number; occupied: number; available: number};
    sectionB: {total: number; occupied: number; available: number};
  };
  seats: Array<{
    seatNumber: string;
    section: string | null;
    student: string; // name or 'Available'
    plan: string; // plan name or '-'
    joiningDate: string; // yyyy-mm-dd or '-'
    expirationDate: string; // yyyy-mm-dd or '-'
    status: "Occupied" | "Available";
    feePaid: boolean;
  }>;
  invalidSeats: Array<{
    seatNumber: string;
    studentName: string;
    reason: string;
  }>;
}

// Expiring user shape from subscription-ending endpoint
export interface ExpiringUser {
  name: string;
  seatNumber: string;
  expirationDate: string; // yyyy-mm-dd
  daysLeft: number;
  planName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
