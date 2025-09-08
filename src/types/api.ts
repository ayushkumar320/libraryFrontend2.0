export interface Student {
  _id: string;
  name: string; // Changed from fullName to match backend schema
  idNumber: number; // Changed from email to match backend schema
  age?: number; // Made optional to match backend schema
  adharNumber: number; // Changed from string to number to match backend schema
  address?: string; // Made optional to match backend schema
  seatNumber: string;
  subscriptionPlan: string | SubscriptionPlan; // Can be ObjectId string or populated object
  joiningDate: string;
  feePaid: boolean; // Changed from feeStatus to match backend schema
  isActive: boolean;
}

export interface SubscriptionPlan {
  _id: string;
  planName: string;
  duration: string;
  price: number;
  subscribers?: string[]; // Array of User ObjectIds
  status: boolean;
}

export interface SeatManagement {
  _id?: string;
  seatNumber: string;
  student: string | Student; // ObjectId reference or populated object
  plan: string | SubscriptionPlan; // ObjectId reference or populated object
  allocationDate: string;
  expirationDate: string;
  status: boolean;
}

export interface DashboardStats {
  totalStudents: number;
  availableSeats: number;
  expiringSoon: number;
  activeUsers: number;
  totalPlans: number;
}

export interface Seat {
  seatNumber: string;
  studentId?: string;
  studentName?: string;
  subscriptionPlan?: string;
  allocatedDate?: string;
  expiryDate?: string;
  status: "Available" | "Occupied" | "Maintenance";
}

export interface SeatManagementData {
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  maintenanceSeats: number;
  seats: Seat[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
