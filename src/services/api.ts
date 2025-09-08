const BASE_URL =
  "https://project-beta-backend-library-manage.vercel.app/api/admin";

import {
  DashboardStats,
  Student,
  SubscriptionPlan,
  SeatManagement,
  Seat,
  ApiResponse,
} from "../types/api";

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem("adminToken");

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && {Authorization: `Bearer ${token}`}),
      ...options.headers,
    },
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

export const adminApi = {
  // Auth
  login: (credentials: {email: string; password: string}) =>
    apiRequest<ApiResponse<{token: string}>>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  // Dashboard
  getDashboardStats: () =>
    apiRequest<ApiResponse<DashboardStats>>("/dashboard"),

  // Students
  getUsers: () => apiRequest<ApiResponse<Student[]>>("/users"),
  registerUser: (userData: Student) =>
    apiRequest<ApiResponse<Student>>("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
  updateStudent: (adharNumber: string, data: Partial<Student>) =>
    apiRequest<ApiResponse<Student>>(`/student/${adharNumber}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteStudent: (adharNumber: string) =>
    apiRequest<ApiResponse<{message: string}>>(`/student/${adharNumber}`, {
      method: "DELETE",
    }),

  // Subscription Plans
  getSubscriptionPlans: () =>
    apiRequest<ApiResponse<SubscriptionPlan[]>>("/subscriptions"),
  createSubscriptionPlan: (planData: SubscriptionPlan) =>
    apiRequest<ApiResponse<SubscriptionPlan>>("/subscription", {
      method: "POST",
      body: JSON.stringify(planData),
    }),
  updateSubscriptionPlan: (planData: Partial<SubscriptionPlan>) =>
    apiRequest<ApiResponse<SubscriptionPlan>>("/subscription", {
      method: "PUT",
      body: JSON.stringify(planData),
    }),
  getSubscriptionEndingPlan: () =>
    apiRequest<ApiResponse<Student[]>>("/subscription-ending"),

  // Seat Management
  getSeatManagement: () => apiRequest<ApiResponse<SeatManagement>>("/seats"),
  getAvailableSeats: () => apiRequest<ApiResponse<Seat[]>>("/seats/available"),
  getSeatInfo: (seatNumber: string) =>
    apiRequest<ApiResponse<Seat>>(`/seat/${seatNumber}`),
  addSeat: (seatData: Seat) =>
    apiRequest<ApiResponse<Seat>>("/seat", {
      method: "POST",
      body: JSON.stringify(seatData),
    }),
  updateSeat: (seatNumber: string, data: Partial<Seat>) =>
    apiRequest<ApiResponse<Seat>>(`/seat/${seatNumber}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  cleanupInvalidSeats: () =>
    apiRequest<ApiResponse<{message: string}>>("/seats/cleanup"),
};
