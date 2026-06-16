import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {

    const url = error.config?.url || "";

   if (
  error.response?.status === 401 &&
  !url.includes("/api/auth/login") &&
  !url.includes("/api/auth/microsoft-login")
) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      alert("Session expired. Please log in again.");
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       window.location.hash = ""; // or redirect to login
//       alert("Session expired. Please log in again.");
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;