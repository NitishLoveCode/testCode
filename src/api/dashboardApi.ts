import axiosInstance from "./axiosInstance";

export const getDashboardData = async () => {
  try {
    const response = await axiosInstance.get("/api/dashboard");
    return response.data;
  } catch (error) {
    console.error("Dashboard API Error:", error);
    throw error;
  }
};
