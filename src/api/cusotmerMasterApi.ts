import axiosInstance from "./axiosInstance";

export const getApprovedCustomers = async () => {
  try {
    const response = await axiosInstance.get(`/api/master`);
    return response.data;
  } catch (error) {
    console.error("Get Approved Customers API Error:", error);
    throw error;
  }
};
