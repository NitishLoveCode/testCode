import axiosInstance from "./axiosInstance";


// ============================
// CUSTOMER VENDOR API
// =============================
// Create customer api
export const createCustomer = async (payload: any) => {
  try {
    const response = await axiosInstance.post("/api/customers", payload);
    return response.data;
  } catch (error) {
    console.error("Create Customer API Error:", error);
    throw error;
  }
};

// Update customer api (EDIT)  || REJECT BUTTON API ||APPROVE BUTTON API
export const updateCustomer = async (id: number, payload: any) => {
  try {
    const response = await axiosInstance.put(`/api/customers/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Update Customer API Error:", error);
    throw error;
  }
};
// export const updateCustomerStatus = async (
//   id: number | string,
//   payload: { status: string; reason?: string }
// ) => {
//   try {
//     const token = localStorage.getItem("token");

//     const response = await axiosInstance.put(
//       `/api/customers/${id}`,
//       payload,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     return response.data;
//   } catch (error) {
//     console.error("Update Customer Status API Error:", error);
//     throw error;
//   }
// };



// Create new Vendor API
export const createVendor = async (payload: any) => {
   try{
     const response = await axiosInstance.post("/api/vendors", payload);
   return response.data;
   }catch(error){
    console.log("Create Vendor API Error: ",error);
    throw error;
   }
};

// Update vendor api (EDIT)
export const updateVendor = async (id: number | string, payload: any) => {
  try {
    const response = await axiosInstance.put(`/api/vendors/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Update Vendor API Error:", error);
    throw error;
  }
};

// =============================
// APPROVALS TAB API
// =============================



// GET pending approvals for a role
export const getApprovals = async (role?: string) => {
  try {
    const token = localStorage.getItem("token");
    // const url = role ? `/api/approvals?role=${role}` : "/api/approvals";
    const url = "/api/approvals";

    const response = await axiosInstance.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Get Approvals API Error:", error);
    throw error;
  }
};


// export const approveRequest = async (id: number | string) => {
//   try {
//     const token = localStorage.getItem("token");

//     const response = await axiosInstance.put(
//       `/api/approvals/${id}/approve`,
//       {},
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     return response.data;
//   } catch (error) {
//     console.error("Approve Request API Error:", error);
//     throw error;
//   }
// };


// export const rejectRequest = async (id: number | string, reason: string) => {
//   try {
//     const token = localStorage.getItem("token");

//     const response = await axiosInstance.put(
//       `/api/approvals/${id}/reject`,
//       { reason },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     return response.data;
//   } catch (error) {
//     console.error("Reject Request API Error:", error);
//     throw error;
//   }
// };


// EDIT BUTTON GET API 
export const getCustomerById = async (id: number | string) => {
  try {
    const response = await axiosInstance.get(`/api/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get Customer By ID API Error:", error);
    throw error;
  }
};

export const getVendorById = async (id: number | string) => {
  try {
    const response = await axiosInstance.get(`/api/vendors/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get Vendor By ID API Error:", error);
    throw error;
  }
};