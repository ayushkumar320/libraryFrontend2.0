export interface Student {
  _id: string;
  fullName: string;
  email: string;
  age: number;
  adharNumber: string;
  address: string;
  seatNumber: string;
  subscriptionPlan: string;
  joiningDate: string;
  expiryDate: string;
  feeStatus: "Paid" | "Pending" | "Overdue";
  isActive: boolean;
}

export interface SubscriptionPlan {
  _id: string;
  planName: string;
  duration: string;
  price: number;
  subscribers?: string[];
  status: boolean;
}

export interface DashboardStats {
  totalStudents: number;
  availableSeats: number;
  expiringSubscriptions: number;
  activeStudents: number;
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

export interface SeatManagement {
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
