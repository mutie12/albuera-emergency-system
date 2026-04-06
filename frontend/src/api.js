import axios from "axios";

const api = axios.create({
  baseURL: "https://albuera-ems-backend.onrender.com/api",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.status, error.response?.data);
    
    // Handle 401 errors only if user is logged in
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem("token");
      // Only redirect to login if user actually has a token (is logged in)
      if (token && token !== "undefined" && token !== "null") {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("userId");
        // Only redirect if not on login/register page
        if (!window.location.pathname.includes("/login") && 
            !window.location.pathname.includes("/register") &&
            !window.location.pathname === "/") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Helper method for handling API responses
api.handleResponse = (response) => {
  return response.data;
};

// Helper method for safe data access
api.getData = (response) => {
  return response?.data || response || [];
};

export default api;
