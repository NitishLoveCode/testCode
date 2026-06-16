
import axiosInstance from "./axiosInstance";

export const loginUser = async (payload: any) => {
  const response = await axiosInstance.post("/api/auth/login", payload);
  return response.data;
};

export const microsoftLogin = async (payload: any) => {
  const response = await axiosInstance.post(
    "/api/auth/microsoft-login",
    payload
  );

  return response.data;
};