import axiosInstance from "./axiosInstance";

export const getRejectedRequests = async (role: string) => {
  try {
    const response = await axiosInstance.get("/api/rejections", {
      params: { role }, // send role to backend
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching rejected requests:", error);
    throw error;
  }
};