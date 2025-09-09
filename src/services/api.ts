// Resolve BASE_URL with priority: env var -> same-origin relative -> local dev fallback
let BASE_URL = (import.meta as any).env?.VITE_API_BASE?.replace(/\/$/, "");
if (!BASE_URL) {
  if (import.meta.env.DEV) {
    // Assume local backend default port if not provided
    BASE_URL =
      "https://project-beta-backend-library-manage.vercel.app/api/admin";
  } else {
    // Production relative (assumes reverse proxy /api/admin)
    BASE_URL = "/api/admin";
  }
}
if (import.meta.env.DEV) console.log("API: Using BASE_URL =", BASE_URL);

import {
  DashboardStats,
  Student,
  SubscriptionPlan,
  SeatManagementData,
  SeatManagementApiResponse,
  ExpiringUser,
} from "../types/api";

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem("adminToken");
  const cleanToken = token?.trim(); // Remove any whitespace
  if (import.meta.env.DEV) {
    console.log(
      "API: Getting token from localStorage:",
      cleanToken
        ? `Token present (${cleanToken.substring(0, 20)}...)`
        : "No token found"
    );
  }
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

  if (import.meta.env.DEV) {
    console.log(
      `API: ${options.method || "GET"} ${endpoint} | token:`,
      token ? "present" : "missing",
      "| Full URL:",
      BASE_URL + endpoint
    );
  }

  let response: Response;
  try {
    response = await fetch(BASE_URL + endpoint, config);
  } catch (e) {
    // Network / CORS / DNS errors land here
    if (e instanceof TypeError && e.message === "Failed to fetch") {
      throw new Error(
        `NETWORK_ERROR: Unable to reach backend at ${BASE_URL}${endpoint}. Check server running, CORS, and HTTPS.`
      );
    }
    throw e;
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error Details:", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      errorText: errorText,
    });

    // Handle specific error cases
    if (response.status === 401) {
      console.error("API: 401 Unauthorized on endpoint:", endpoint);
      // Only clear token if we're not on login endpoint
      if (!endpoint.includes("/login") && !didHandleUnauthorized) {
        didHandleUnauthorized = true;
        localStorage.removeItem("adminToken");
        if (import.meta.env.DEV) {
          console.warn(
            "API: 401 received, token cleared, redirecting to login"
          );
        }
        // Redirect to login after short tick
        setTimeout(() => {
          window.location.replace("/login");
          didHandleUnauthorized = false; // Reset flag after redirect
        }, 100);
      }
      throw new Error("Unauthorized - please login again");
    }

    if (response.status === 500) {
      throw new Error(
        `HTTP_500: Backend server error - ${
          errorText || "Internal server error"
        }. Check backend logs for details.`
      );
    }

    throw new Error(
      `HTTP_${response.status}: ${errorText || "Request failed"}`
    );
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
    apiRequest<{message: string}>("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
  updateStudent: (adharNumber: string, data: Partial<Student>) =>
    apiRequest<{name: string; adharNumber: number; message: string}>(
      `/student/${adharNumber}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    ),
  deleteStudent: (adharNumber: string) =>
    apiRequest<{message: string}>(`/student/${adharNumber}`, {
      method: "DELETE",
    }),

  // Subscription Plans - returns array directly
  getSubscriptionPlans: () => apiRequest<SubscriptionPlan[]>("/subscriptions"),
  createSubscriptionPlan: (planData: any) =>
    apiRequest<{message: string; planName: string}>("/subscription", {
      method: "POST",
      body: JSON.stringify(planData),
    }),
  updateSubscriptionPlan: (planData: Partial<SubscriptionPlan>) =>
    apiRequest<{message: string; planName: string}>("/subscription", {
      method: "PUT",
      body: JSON.stringify(planData),
    }),
  deleteSubscriptionPlan: (planId: string) =>
    apiRequest<{message: string; planName: string}>(`/subscription/${planId}`, {
      method: "DELETE",
    }),
  // Subscription Ending - returns custom format
  getSubscriptionEndingPlan: () =>
    apiRequest<{message: string; count: number; users: ExpiringUser[]}>(
      "/subscription-ending"
    ),

  // Seat Management - transform backend response into SeatManagementData
  getSeatManagement: async (): Promise<SeatManagementData> => {
    const raw = await apiRequest<SeatManagementApiResponse>("/seats");
    return {
      totalSeats: raw.statistics.totalSeats,
      occupiedSeats: raw.statistics.occupiedSeats,
      availableSeats: raw.statistics.availableSeats,
      seats: raw.seats.map((s) => ({
        seatNumber: s.seatNumber,
        studentName: s.student === "Available" ? undefined : s.student,
        subscriptionPlan: s.plan === "-" ? undefined : s.plan,
        allocatedDate: s.joiningDate !== "-" ? s.joiningDate : undefined,
        expiryDate: s.expirationDate !== "-" ? s.expirationDate : undefined,
        status: s.status,
      })),
    };
  },
  getAvailableSeats: () =>
    apiRequest<{message: string; availableSeats: string[]}>("/seats/available"),
  getSeatInfo: (seatNumber: string) =>
    apiRequest<{
      seatNumber: string;
      section: string;
      status: string;
      student: any;
    }>(`/seat/${seatNumber}`),
  addSeat: (seatData: any) =>
    apiRequest<{
      message: string;
      seatNumber: string;
      section: string;
      student: string;
      plan: string;
    }>("/seat", {
      method: "POST",
      body: JSON.stringify(seatData),
    }),
  updateSeat: (seatNumber: string, data: any) =>
    apiRequest<{
      message: string;
      seatNumber: string;
      status: string;
      student: string;
      plan: string;
      feePaid: boolean;
      joiningDate: string;
    }>(`/seat/${seatNumber}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  cleanupInvalidSeats: () =>
    apiRequest<{message: string; invalidSeats?: any[]}>("/seats/cleanup"),
};
