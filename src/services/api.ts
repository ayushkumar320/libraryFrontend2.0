const BASE_URL =
  "https://project-beta-backend-library-manage.vercel.app/api/admin";

import {
  DashboardStats,
  Student,
  SubscriptionPlan,
  SeatManagementData,
  Seat,
  ApiResponse,
} from "../types/api";

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem("adminToken");
  const cleanToken = token?.trim(); // Remove any whitespace
  console.log(
    "API: Getting token from localStorage:",
    cleanToken
      ? `Token present (${cleanToken.substring(0, 20)}...)`
      : "No token found"
  );
  return cleanToken;
};

// API request helper
let didHandleUnauthorized = false;

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();

  const authHeaders = token
    ? {
        Authorization: `Bearer ${token}`,
        // Possible alternate header names some middleware might require
        "x-auth-token": token,
        token: token,
      }
    : {};

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(options.headers as Record<string, string>),
    } as Record<string, string>,
  };

  console.log(
    `API: ${options.method || "GET"} ${endpoint} | token:`,
    token ? "present" : "missing"
  );

  const response = await fetch(BASE_URL + endpoint, config);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", response.status, errorText);

    // Handle specific error cases
    if (response.status === 401) {
      if (!didHandleUnauthorized) {
        didHandleUnauthorized = true;
        localStorage.removeItem("adminToken");
        console.warn("API: 401 received, token cleared from storage");
      }
      throw new Error("Unauthorized - please login again");
    }

    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

export const adminApi = {
  // Auth
  login: (credentials: {email: string; password: string}) =>
    apiRequest<{token: string}>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  // Dashboard - returns data directly
  getDashboardStats: () =>
    apiRequest<DashboardStats & {message: string}>("/dashboard"),

  // Students - returns array directly
  getUsers: () => apiRequest<Student[]>("/users"),
  registerUser: (userData: any) =>
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

  // Subscription Plans - returns array directly
  getSubscriptionPlans: () => apiRequest<SubscriptionPlan[]>("/subscriptions"),
  createSubscriptionPlan: (planData: any) =>
    apiRequest<ApiResponse<SubscriptionPlan>>("/subscription", {
      method: "POST",
      body: JSON.stringify(planData),
    }),
  updateSubscriptionPlan: (planData: Partial<SubscriptionPlan>) =>
    apiRequest<ApiResponse<SubscriptionPlan>>("/subscription", {
      method: "PUT",
      body: JSON.stringify(planData),
    }),
  // Subscription Ending - returns custom format
  getSubscriptionEndingPlan: () =>
    apiRequest<{message: string; count: number; users: Student[]}>(
      "/subscription-ending"
    ),

  // Seat Management - returns data directly
  getSeatManagement: () => apiRequest<SeatManagementData>("/seats"),
  getAvailableSeats: () => apiRequest<Seat[]>("/seats/available"),
  getSeatInfo: (seatNumber: string) => apiRequest<Seat>(`/seat/${seatNumber}`),
  addSeat: (seatData: any) =>
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
