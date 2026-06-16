export type ApprovalRequest = {
  id: string;
  entityType: "Customer" | "Vendor";

  currentStage: "Approver" | "Admin" | "Completed" | "Rejected";
  status: "Pending" | "Approved" | "Rejected" ;
  submittedBy: string;
  formData: any;
  rejectedBy?: string;
  rejectionReason?: string;

};

const STORAGE_KEY = "approvalRequests";

export const getApprovalRequests = (): ApprovalRequest[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveApprovalRequests = (data: ApprovalRequest[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const addApprovalRequest = (request: ApprovalRequest) => {
  const existing = getApprovalRequests();
  saveApprovalRequests([request, ...existing]);
};

export const updateApprovalRequest = (
  id: string,
  updatedData: Partial<ApprovalRequest>
) => {
  const existing = getApprovalRequests();

  const updated = existing.map((item) =>
    item.id === id ? { ...item, ...updatedData } : item
  );

  saveApprovalRequests(updated);
};

