import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XCircle, Loader2, RotateCcw } from "lucide-react";
import { getRejectedRequests } from "@/api/rejectionsApi";

type Props = {
  currentUserRole: string;
};

export default function Rejected({ currentUserRole }: Props) {
  const [rejectedList, setRejectedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRejected = useCallback(async () => {
    if (!currentUserRole) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRejectedRequests(currentUserRole);

      // const rawData = data.data || (Array.isArray(data) ? data : []);
      const rawData = Array.isArray(data?.data) ? data.data : [];

      console.log("Rejected API response:", data);

      const mapped = rawData.map((item: any) => ({
        id: item.RecordId,
        entityType: item.Source,
        status: item.Status,
        submittedBy: item.CreatedByEmail, // ✅ FIXED
        rejectedBy: item.RejectedBy,
        rejectionReason: item.Reason || "No reason provided",

        formData: {
          companyName: item.CompanyName,
          gstin: item.GSTIN,
          pan: item.PAN,
          currency: item.Currency,
        },
      }));

      setRejectedList(mapped);
    } catch (err) {
      console.error("Failed to fetch rejected requests:", err);
      setError("Failed to load rejected requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentUserRole]);

  useEffect(() => {
    fetchRejected();
  }, [fetchRejected]);

  const handleResubmit = (item: any) => {
    localStorage.setItem("editingApproval", JSON.stringify(item));
    if (item.entityType === "Customer") {
      window.location.hash = "new-customer";
    } else {
      window.location.hash = "new-vendor";
    }
  };

  // Role-specific descriptions
  const getRoleDescription = () => {
    if (currentUserRole === "Approver") return "Requests you have rejected";
    if (currentUserRole === "Admin")
      return "Requests rejected by you or by an Approver";
    return "Your requests that were rejected by an Approver or Admin";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Rejected Requests</h1>
        <p className="text-slate-500">{getRoleDescription()}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchRejected}
            className="font-medium underline ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading rejected requests…</span>
        </div>
      )}

      {/* Cards */}
      {!loading && (
        <div className="space-y-4">
          {rejectedList.map((req) => (
            <Card key={req.id} className="border-rose-200">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  {/* Left: details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {req.formData?.companyName ||
                          req.formData?.companyNameTally ||
                          "—"}
                      </h3>
                      <Badge variant="outline">{req.id}</Badge>
                      <Badge className="bg-rose-100 text-rose-700 border-transparent">
                        Rejected
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
                        <p className="text-slate-500 mb-1">Entity Type</p>
                        <p className="font-medium text-slate-900">
                          {req.entityType || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Submitted By</p>
                        <p className="font-medium text-slate-900">
                          {req.submittedBy || req.createdBy || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Rejection details */}
                    <div className="bg-rose-50 rounded-lg px-4 py-3 space-y-1">
                      <p className="text-sm text-rose-700">
                        <span className="font-semibold">Rejected by:</span>{" "}
                        {req.rejectedBy || "—"}
                      </p>
                      <p className="text-sm text-rose-600">
                        <span className="font-semibold">Reason:</span>{" "}
                        {req.rejectionReason || "No reason provided"}
                      </p>
                    </div>
                  </div>

                  {/* Right: action */}
                  <div className="flex items-center gap-3 md:border-l md:pl-6 border-slate-200">
                    {/* Requestor can resubmit; Admin/Approver can only view */}
                    {currentUserRole === "Requestor" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleResubmit(req)}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Resubmit
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        No action required
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {rejectedList.length === 0 && !error && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <XCircle className="w-12 h-12 text-rose-300 mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-medium text-slate-900">
                No rejected requests
              </h3>
              <p className="text-slate-500">Nothing has been rejected yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


