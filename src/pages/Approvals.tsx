import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { getApprovals, getCustomerById, getVendorById, updateCustomer ,updateVendor,} from "@/api";
// import { getStatus } from "@/utils/statusHelper";


type ActionState = {
  id: string | number;
  type: "approve" | "reject";
} | null;

type Props = {
  currentUserRole: string;
};

export default function Approvals({ currentUserRole }: Props) {
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actioning, setActioning] = useState<ActionState>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    if (!currentUserRole) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getApprovals();
      const rawData = res.data || [];

      // TRANSFORM BACKEND → UI FORMAT
      const formatted = rawData.map((item: any) => ({
        id: item.RecordId,
        entityType: item.Source,
        status: item.Status,
        currentStage: item.Status,
        submittedBy: item.SubmittedByEmail,
        submittedByRole: item.SubmittedByRole,
       formData: {
  companyName: item.CompanyName || "",
  tradeName: item.TradeName || "",
  gstin: item.GSTIN || "",
  pan: item.PAN || "",
  currency: item.Currency || "INR",
  paymentTerms: item.Terms || "Net 30",
  registrationType: item.RegistrationType || "Regular",
  city: item.BillingCity || "",
  billingState: item.BillingState || "",
  email: item.Email || "",
  phoneNo: item.PhoneNo || "",
},
      }));

      // ROLE-BASED FILTERING
      let filtered = formatted;

      if (currentUserRole === "Admin") {
  filtered = formatted.filter(
    (item: any) =>
      item.status === "Pending" ||
      item.status === "Pending_from_Admin"
  );
} else if (currentUserRole === "Approver") {
        filtered = formatted.filter(
          (item: any) =>
            item.entityType === "Customer" &&
            item.status === "Pending_from_Approver",
        );
      } else {
        filtered = [];
      }

      setPendingApprovals(filtered);
    } catch (err) {
      console.error("Failed to fetch approvals:", err);
      setError("Failed to load approvals. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentUserRole]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);


const handleApprove = async (item: any) => {
  setActioning({ id: item.id, type: "approve" });

  try {
    if (item.entityType === "Customer") {
      await updateCustomer(item.id, {
        action: "approve",
      });
    } else {
      await updateVendor(item.id, {
        action: "approve",
      });
    }

    setPendingApprovals((prev) =>
      prev.filter((r) => r.id !== item.id)
    );

    if (currentUserRole === "Approver") {
      alert(
        "Customer approved — forwarded to Admin for final approval."
      );
    } else {
      alert(
        `${item.formData?.companyName || item.entityType || "Request"} approved successfully.`
      );
    }
  } catch (err) {
    console.error("Approve failed:", err);
    alert("Approval failed. Please try again.");
    fetchApprovals();
  } finally {
    setActioning(null);
  }
};


const handleReject = async (item: any) => {
  const name =
    item.formData?.companyName ||
    item.formData?.companyNameTally ||
    String(item.id);

  const reason = window.prompt(
    `Reason for rejecting "${name}"?`
  );

  if (reason === null) return;

  setActioning({ id: item.id, type: "reject" });

  try {
    if (item.entityType === "Customer") {
      await updateCustomer(item.id, {
        action: "reject",
        rejectionReason:
          reason.trim() || "No reason provided",
      });
    } else {
      await updateVendor(item.id, {
        action: "reject",
        rejectionReason:
          reason.trim() || "No reason provided",
      });
    }

    setPendingApprovals((prev) =>
      prev.filter((r) => r.id !== item.id)
    );

    alert("Request rejected successfully.");
  } catch (err) {
    console.error("Reject failed:", err);
    alert("Rejection failed. Please try again.");
    fetchApprovals();
  } finally {
    setActioning(null);
  }
};

  // const handleEdit = (item: any) => {
  //   localStorage.setItem("editingApproval", JSON.stringify(item));
  //   if (item.entityType === "Customer") {
  //     window.location.hash = "new-customer";
  //   } else {
  //     window.location.hash = "new-vendor";
  //   }
  // };

  const handleEdit = async (item: any) => {
  try {
    let response;

    if (item.entityType === "Customer") {
      response = await getCustomerById(item.id);
    } else {
      response = await getVendorById(item.id);
    }

    console.log("FULL EDIT DATA:", response);

    // VERY IMPORTANT
    // storing ONLY response.data
    localStorage.setItem(
      "editingApproval",
      JSON.stringify(response.data)
    );

    if (item.entityType === "Customer") {
      window.location.hash = "new-customer";
    } else {
      window.location.hash = "new-vendor";
    }
  } catch (error) {
    console.error("Edit fetch failed:", error);
    alert("Unable to fetch full data");
  }
};

  // Per-item, per-action helpers
  const isApproving = (id: any) =>
    actioning?.id === id && actioning.type === "approve";
  const isRejecting = (id: any) =>
    actioning?.id === id && actioning.type === "reject";
  const isBusy = (id: any) => actioning?.id === id;

  const pageTitle = "Pending Approvals";
  const pageDesc =
    currentUserRole === "Approver"
      ? "Review new customer requests submitted by Requestors"
      : "Review and approve all pending customer & vendor requests";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
        <p className="text-slate-500">{pageDesc}</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchApprovals}
            className="font-medium underline ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading approvals…</span>
        </div>
      )}

      {!loading && (
        <div className="space-y-4">
          {pendingApprovals.map((req) => (
            <Card key={`${req.entityType}-${req.id}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  {/* ── Left: info ── */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {req.formData?.companyName ||
                          req.formData?.companyNameTally ||
                          "—"}
                      </h3>
                      <Badge variant="outline">{req.id}</Badge>
                      <Badge
                        className={`border-transparent ${
                          req.status === "Approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : req.status?.includes("Rejected")
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {req.status ?? "Pending"}
                      </Badge>
                      {req.entityType && (
                        <Badge className="bg-slate-100 text-slate-600 border-transparent text-xs">
                          {req.entityType}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 mb-1">GSTN</p>
                        <p className="font-medium text-slate-900">
                          {req.formData?.gstin || req.formData?.gstn || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">PAN</p>
                        <p className="font-medium text-slate-900">
                          {req.formData?.pan || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Currency</p>
                        <p className="font-medium text-slate-900">
                          {req.formData?.currency || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Submitted By</p>
                        <p className="font-medium text-slate-900">
                          {req.submittedBy || req.createdBy || "—"}
                        </p>
                      </div>
                    </div>

                    {req.currentStage && (
                      <p className="text-xs text-slate-400">
                        Stage:{" "}
                        <span className="font-medium text-slate-600">
                          {req.currentStage}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* ── Right: actions ── */}
                  <div className="flex items-center gap-3 md:border-l md:pl-6 border-slate-200">
                    <Button
                      variant="outline"
                      size="sm"
                      title="Edit Form"
                      onClick={() => handleEdit(req)}
                      disabled={isBusy(req.id)}
                    >
                      Edit
                    </Button>

                    {currentUserRole !== "Requestor" && (
                      <>
                        {/* ── Reject button ── */}
                        <Button
                          variant="destructive"
                          size="icon"
                          title="Reject"
                          disabled={isBusy(req.id)}
                          onClick={() => handleReject(req)}
                        >
                          {isRejecting(req.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </Button>

                        {/* ── Approve button ── */}
                        <Button
                          variant="default"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          title="Approve"
                          onClick={() => handleApprove(req)}
                          disabled={isBusy(req.id)}
                        >
                          {isApproving(req.id) ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          {isApproving(req.id) ? "Processing…" : "Approve"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {pendingApprovals.length === 0 && !error && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <Check className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium text-slate-900">
                All caught up!
              </h3>
              <p className="text-slate-500">
                No pending approvals at the moment.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
