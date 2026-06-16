import axiosInstance from "./axiosInstance";

export const getUsers = async () => {
  const response = await axiosInstance.get("/api/users");
  return response.data.data;
};

export const createUser = async (payload:any) => {
  const response = await axiosInstance.post("/api/users", payload);
  return response.data.data;
};

export const updateUser = async (id: number, payload: any) => {
  const response = await axiosInstance.put(`/api/users/${id}`, payload);
  return response.data.data;
};

export const deleteUser = async (id: number) => {
  const response = await axiosInstance.delete(`/api/users/${id}`);
  return response.data;
};