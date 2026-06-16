export const getStatus = (
  role: string,
  action: "submit" | "approve" | "reject",
  entityType?: "Customer" | "Vendor"
) => {
  // ───────── SUBMIT ─────────
  if (action === "submit") {
    if (role === "Admin") return "Pending";

    if (role === "Requestor") {
      if (entityType === "Vendor") return "Pending"; // direct to admin
      return "Pending_from_Approver"; // customer
    }
  }

  // ───────── APPROVE ─────────
  if (action === "approve") {
    if (role === "Admin") return "Approved";
    if (role === "Approver") return "Pending_from_Admin";
  }

  // ───────── REJECT ─────────
  if (action === "reject") {
    if (role === "Admin") return "Rejected";
    if (role === "Approver") return "Rejected_from_Approver";
  }

  return "";
};