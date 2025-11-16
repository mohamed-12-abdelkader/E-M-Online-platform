import axios from "axios";

const baseUrl = axios.create({
  baseURL: "https://api.e-monline.online"
});

// Response interceptor to handle token expiration globally
baseUrl.interceptors.response.use(
  (response) => {
    // If the request succeeds, return the response
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      const apiMessage = error?.response?.data?.message;
      
      // Check if it's a session expired error
      if (apiMessage === "Session expired or replaced" || 
          apiMessage?.includes('expired') ||
          apiMessage?.includes('انتهت') ||
          apiMessage?.includes('غير صالح')) {
        // Clear local storage
        try {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          localStorage.removeItem("examAnswers");
          localStorage.removeItem("examTimeLeft");
        } catch (e) {
          console.error("Error clearing localStorage:", e);
        }
        
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          // Store the error message in the error response so components can handle it
          error.sessionExpired = true;
        }
      }
    }
    
    // Return the error so components can still handle it
    return Promise.reject(error);
  }
);

export default baseUrl;