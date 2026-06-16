import React, { useState, useEffect } from "react";
import { getStatus } from "@/utils/statusHelper";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  XCircle,
  UploadCloud,
  FileText,
  X,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { createVendor, updateVendor } from "@/api";
import { validateVendor } from "@/utils/validations/vendor/vendorValidation";

interface NewVendorProps {
  currentUserRole?: string;
}

export default function NewVendor({ currentUserRole = "" }: NewVendorProps) {
  const [formData, setFormData] = useState({
    payableAccount: "",
    celebalEntity: "",
    vendorCategory: "",
    type: "",
    companyName: "",
    tradeName: "",
    category: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNo: "",
    representativeEmail: "",
    billingCountry: "",
    billingAddress1: "",
    billingAddress2: "",
    billingCity: "",
    billingState: "",
    billingPincode: "",
    gstin: "",
    taxRegistrationCountry: "",
    taxRegistrationState: "",
    taxRegistrationNumber: "",
    registrationType: "Regular",
    panAvailability: "Yes",
    pan: "",
    terms: "Net 30",
    currency: "INR",
    bankAccountNumber: "",
    ifscCode: "",
    bankName: "",
    swiftCode: "",
    msme: "No",
    msmeCategory: "",
    msmeCertificateNumber: "",
    majorActivity: "",
    pfNumber: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gstnStatus, setGstnStatus] = useState<
    "idle" | "valid" | "invalid" | "api_verified" | "api_error"
  >("idle");
  const [gstnMessage, setGstnMessage] = useState("");
  const [gstnVerifying, setGstnVerifying] = useState(false);
  const [emailModalContent, setEmailModalContent] = useState<string | null>(
    null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  //   upload file logic
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadedFile(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    // setFormData((prev) => ({ ...prev, [name]: value }));
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  //FUNCTIONS TO VERIFY GSTN N0.
  const handleGstinChange = (value: string) => {
    const upper = value.toUpperCase();

    setFormData((prev) => ({
      ...prev,
      gstin: upper,
    }));

    setErrors((prev) => ({
      ...prev,
      gstin: "",
    }));

    setGstnStatus("idle");
    setGstnMessage("");

    if (upper.length < 15) {
      setGstnStatus("idle");
      setGstnMessage("");
    }

    if (upper.length === 15) {
      const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

      if (regex.test(upper)) {
        setGstnStatus("valid");

        setGstnMessage(
          "Format valid — click Verify to confirm with GST portal.",
        );

        setFormData((prev) => ({
          ...prev,
          pan: upper.substring(2, 12),
        }));
      } else {
        setGstnStatus("invalid");

        setGstnMessage("Invalid GSTIN format. Must be 15 characters.");
      }
    }
  };

  const verifyGSTNWithPortal = async () => {
    const gstin = formData.gstin.toUpperCase().trim();
    setGstnVerifying(true);
    setGstnMessage("Verifying with GST portal...");
    try {
      const res = await fetch(
        `https://toolkit.finobuddy.com/api/gstin/${gstin}`,
        { headers: { Accept: "application/json" } },
      );
      const data = await res.json();
      if (
        res.ok &&
        (data.status === "Active" || data.sts === "Active" || data.stjCd)
      ) {
        const legalName = data.legalName || data.lgnm || "";
        const tradeName = data.tradeName || data.tradeNam || "";
        setGstnStatus("api_verified");
        setGstnMessage(
          `✅ Verified: ${legalName}${tradeName ? " (Trade: " + tradeName + ")" : ""} — Active`,
        );
        setFormData((prev) => ({
          ...prev,

          pan: gstin.substring(2, 12),

          ...(legalName && {
            companyName: legalName,
          }),

          ...(tradeName && {
            tradeName: tradeName,
          }),
        }));
      } else {
        setGstnStatus("api_error");
        setGstnMessage(
          data.message || "GSTN not found or inactive on GST portal.",
        );
      }
    } catch {
      setGstnStatus("api_error");
      setGstnMessage(
        "Could not reach GST portal. Use the portal button to verify manually.",
      );
    } finally {
      setGstnVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // VALIDATION
    const validationErrors = validateVendor(formData);
    console.log("Validation Errors:", validationErrors); // 👈 move here

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    setErrors({});

    try {
      const editingData = localStorage.getItem("editingApproval");

      if (editingData) {
        const parsed = JSON.parse(editingData);

        //  CALL UPDATE API
        // await updateVendor(parsed.id, {
        await updateVendor(parsed.VendorId, {
          payableAccount: formData.payableAccount,
          celebalEntity: formData.celebalEntity,
          vendorCategory: formData.vendorCategory,
          type: formData.type,

          companyName: formData.companyName,
          tradeName: formData.tradeName,

          category: formData.category,

          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,

          email: formData.email,
          phoneNo: formData.phoneNo,
          representativeEmail: formData.representativeEmail,

          billingCountry: formData.billingCountry,
          billingAddress1: formData.billingAddress1,
          billingAddress2: formData.billingAddress2,
          billingCity: formData.billingCity,
          billingState: formData.billingState,
          billingPincode: formData.billingPincode,

          gstin: formData.gstin,

          taxRegistrationCountry: formData.taxRegistrationCountry,
          taxRegistrationState: formData.taxRegistrationState,
          taxRegistrationNumber: formData.taxRegistrationNumber,

          registrationType: formData.registrationType,

          panAvailability: formData.panAvailability === "Yes",

          pan: formData.pan,

          terms: formData.terms,

          currency: formData.currency,

          bankAccountNumber: formData.bankAccountNumber,

          ifscCode: formData.ifscCode,

          bankName: formData.bankName,

          swiftCode: formData.swiftCode,

          msme: formData.msme === "Yes",

          msmeCategory: formData.msmeCategory,

          msmeCertificateNumber:
            formData.msme === "Yes" ? formData.msmeCertificateNumber : "",

          majorActivity: formData.majorActivity,

          pfNumber: formData.pfNumber,
        });

        localStorage.removeItem("editingApproval");

        alert("Vendor updated successfully");
      } else {
        // Vendor always goes directly to Admin's approval tab (regardless of requestor/admin role)
        const user = localStorage.getItem("user");
        const parsedUser = user ? JSON.parse(user) : null;
        const role = parsedUser?.role || currentUserRole;

        const payload = {
          payableAccount: formData.payableAccount,
          celebalEntity: formData.celebalEntity,
          vendorCategory: formData.vendorCategory,
          type: formData.type,

          // IMPORTANT MAPPING
          companyName: formData.companyName,
          tradeName: formData.tradeName,

          category: formData.category,

          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,

          email: formData.email,
          phoneNo: formData.phoneNo,
          representativeEmail: formData.representativeEmail,

          billingCountry: formData.billingCountry,
          billingAddress1: formData.billingAddress1,
          billingAddress2: formData.billingAddress2,

          // IMPORTANT
          billingCity: formData.billingCity,

          billingState: formData.billingState,
          billingPincode: formData.billingPincode,

          gstin: formData.gstin,

          // IMPORTANT MAPPING
          taxRegistrationCountry: formData.taxRegistrationCountry,
          taxRegistrationState: formData.taxRegistrationState,
          taxRegistrationNumber: formData.taxRegistrationNumber,

          registrationType: formData.registrationType,

          panAvailability: formData.panAvailability === "Yes",

          pan: formData.pan,

          // IMPORTANT MAPPING
          terms: formData.terms,

          currency: formData.currency,

          // IMPORTANT MAPPING
          bankAccountNumber: formData.bankAccountNumber,

          ifscCode: formData.ifscCode,

          bankName: formData.bankName,

          swiftCode: formData.swiftCode,

          msme: formData.msme === "Yes",

          msmeCategory: formData.msmeCategory,

          // IMPORTANT MAPPING
          msmeCertificateNumber:
            formData.msme === "Yes" ? formData.msmeCertificateNumber : "",

          majorActivity: formData.majorActivity,

          pfNumber: formData.pfNumber,

          submittedByRole: role,

          initialStage: "Admin",
          status: getStatus(role, "submit", "Vendor"),
        };

        // const status = getStatus(role, "submit", "Vendor");
        // // CALL CREATE API
        // await createVendor({
        //   ...payload,
        //   status,
        // });
        await createVendor(payload);

        alert("Vendor submitted — sent to Admin for approval.");
      }

      // redirect after success
      window.location.hash = "approvals";
    } catch (error: any) {
      console.error("API ERROR:", error);

      const backendErrors = error?.response?.data?.errors;

      if (backendErrors && Array.isArray(backendErrors)) {
        const errorMap: Record<string, string> = {};

        // Backend field -> frontend field mapping
        //    const fieldMap: Record<string, string> = {
        //   companyName: "companyName",
        //   tradeName: "tradeName",
        //   gstin: "gstn",

        //   terms: "paymentTerms",

        //   bankAccountNumber: "bankAccountNo",
        //   ifscCode: "bankIfscCode",

        //   taxRegistrationCountry: "taxRegCountry",
        //   taxRegistrationState: "taxRegState",
        //   taxRegistrationNumber: "taxRegNo",

        //   msmeCertificateNumber: "msmeCertificateNo",
        // };

        backendErrors.forEach((err: any) => {
          // const frontendField = fieldMap[err.field] || err.field;

          // errorMap[frontendField] = err.message;
          errorMap[err.field] = err.message;
        });

        // show below fields
        setErrors(errorMap);
        setIsSubmitting(false);
        return;
      }

      // duplicate / general backend errors
      const backendMessage =
        error?.response?.data?.message || "Something went wrong";

      alert(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

//  useEffect(() => {
//   const editingData = localStorage.getItem("editingApproval");

//   if (editingData) {
//     const parsed = JSON.parse(editingData);

//     if (parsed.entityType === "Vendor") {
//       setFormData((prev) => ({
//         ...prev,

//         payableAccount: parsed.formData.payableAccount || "",

//         celebalEntity: parsed.formData.celebalEntity || "",

//         vendorCategory: parsed.formData.vendorCategory || "",

//         type: parsed.formData.type || "",

//         companyName: parsed.formData.companyName || "",

//         tradeName: parsed.formData.tradeName || "",

//         category: parsed.formData.category || "",

//         firstName: parsed.formData.firstName || "",

//         middleName: parsed.formData.middleName || "",

//         lastName: parsed.formData.lastName || "",

//         email: parsed.formData.email || "",

//         phoneNo: parsed.formData.phoneNo || "",

//         representativeEmail:
//           parsed.formData.representativeEmail || "",

//         billingCountry:
//           parsed.formData.billingCountry || "",

//         billingAddress1:
//           parsed.formData.billingAddress1 || "",

//         billingAddress2:
//           parsed.formData.billingAddress2 || "",

//         billingCity:
//           parsed.formData.billingCity || "",

//         billingState:
//           parsed.formData.billingState || "",

//         billingPincode:
//           parsed.formData.billingPincode || "",

//         gstin: parsed.formData.gstin || "",

//         taxRegistrationCountry:
//           parsed.formData.taxRegistrationCountry || "",

//         taxRegistrationState:
//           parsed.formData.taxRegistrationState || "",

//         taxRegistrationNumber:
//           parsed.formData.taxRegistrationNumber || "",

//         registrationType:
//           parsed.formData.registrationType || "Regular",

//         panAvailability:
//           parsed.formData.panAvailability ? "Yes" : "No",

//         pan: parsed.formData.pan || "",

//         terms: parsed.formData.terms || "Net 30",

//         currency: parsed.formData.currency || "INR",

//         bankAccountNumber:
//           parsed.formData.bankAccountNumber || "",

//         ifscCode: parsed.formData.ifscCode || "",

//         bankName: parsed.formData.bankName || "",

//         swiftCode: parsed.formData.swiftCode || "",

//         msme: parsed.formData.msme ? "Yes" : "No",

//         msmeCategory:
//           parsed.formData.msmeCategory || "",

//         msmeCertificateNumber:
//           parsed.formData.msmeCertificateNumber || "",

//         majorActivity:
//           parsed.formData.majorActivity || "",

//         pfNumber: parsed.formData.pfNumber || "",
//       }));

//       setIsEditMode(true);
//     }
//   }
// }, []);

useEffect(() => {
  const editingData = localStorage.getItem("editingApproval");

  if (editingData) {
    const parsed = JSON.parse(editingData);

    setFormData((prev) => ({
      ...prev,

      payableAccount: parsed.PayableAccount || "",

      celebalEntity: parsed.CelebalEntity || "",

      vendorCategory: parsed.VendorCategory || "",

      type: parsed.Type || "",

      companyName: parsed.CompanyName || "",

      tradeName: parsed.TradeName || "",

      category: parsed.Category || "",

      firstName: parsed.FirstName || "",

      middleName: parsed.MiddleName || "",

      lastName: parsed.LastName || "",

      email: parsed.Email || "",

      phoneNo: parsed.PhoneNo || "",

      representativeEmail:
        parsed.RepresentativeEmail || "",

      billingCountry:
        parsed.BillingCountry || "",

      billingAddress1:
        parsed.BillingAddress1 || "",

      billingAddress2:
        parsed.BillingAddress2 || "",

      billingCity:
        parsed.BillingCity || "",

      billingState:
        parsed.BillingState || "",

      billingPincode:
        parsed.BillingPincode || "",

      gstin: parsed.GSTIN || "",

      taxRegistrationCountry:
        parsed.TaxRegistrationCountry || "",

      taxRegistrationState:
        parsed.TaxRegistrationState || "",

      taxRegistrationNumber:
        parsed.TaxRegistrationNumber || "",

      registrationType:
        parsed.RegistrationType || "Regular",

      panAvailability:
        parsed.PANAvailability ? "Yes" : "No",

      pan: parsed.PAN || "",

      terms: parsed.Terms || "Net 30",

      currency: parsed.Currency || "INR",

      bankAccountNumber:
        parsed.BankAccountNumber || "",

      ifscCode: parsed.IFSCCode || "",

      bankName: parsed.BankName || "",

      swiftCode: parsed.SwiftCode || "",

      msme: parsed.MSME ? "Yes" : "No",

      msmeCategory:
        parsed.MSMECategory || "",

      msmeCertificateNumber:
        parsed.MSMECertificateNumber || "",

      majorActivity:
        parsed.MajorActivity || "",

      pfNumber: parsed.PFNumber || "",
    }));

    setIsEditMode(true);
  }
}, []);

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEditMode ? "Edit Vendor" : "New Vendor"}
        </h1>
        <p className="text-slate-500">
          Capture data and manually validate via GST Portal
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm mb-4">
            Please fix the highlighted errors before submitting.
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Vendor Details</CardTitle>
            <CardDescription>
              Enter the basic information for the new vendor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* General Details */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
                General Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Payable Account
                  </label>
                  <Input
                    name="payableAccount"
                    value={formData.payableAccount}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Celebal Entity
                  </label>
                  <Input
                    name="celebalEntity"
                    value={formData.celebalEntity}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Vendor Category
                  </label>
                  <Input
                    name="vendorCategory"
                    value={formData.vendorCategory}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Type
                  </label>
                  <Input
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Company Name (Tally) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-xs">{errors.companyName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Trade Name (GST Portal)
                  </label>
                  <Input
                    name="tradeName"
                    value={formData.tradeName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Category
                  </label>
                  <Input
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
                Contact Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    First Name
                  </label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Middle Name
                  </label>
                  <Input
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Last Name
                  </label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Email Id
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Phone No
                  </label>
                  <Input
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleInputChange}
                  />
                  {errors.phoneNo && (
                    <p className="text-red-500 text-xs">{errors.phoneNo}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Representative Email ID
                  </label>
                  <Input
                    name="representativeEmail"
                    type="email"
                    value={formData.representativeEmail}
                    onChange={handleInputChange}
                  />
                  {errors.representativeEmail && (
                    <p className="text-red-500 text-xs">
                      {errors.representativeEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Billing & Tax Details */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
                Billing & Tax Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Billing Country
                  </label>
                  <Input
                    name="billingCountry"
                    value={formData.billingCountry}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Billing Address 1
                  </label>
                  <Input
                    name="billingAddress1"
                    value={formData.billingAddress1}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Billing Address 2
                  </label>
                  <Input
                    name="billingAddress2"
                    value={formData.billingAddress2}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Billing City
                  </label>
                  <Input
                    name="billingCity"
                    value={formData.billingCity}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Billing State
                  </label>
                  <Input
                    name="billingState"
                    value={formData.billingState}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Billing Pincode
                  </label>
                  <Input
                    name="billingPincode"
                    value={formData.billingPincode}
                    onChange={handleInputChange}
                  />
                  {errors.billingPincode && (
                    <p className="text-red-500 text-xs">
                      {errors.billingPincode}
                    </p>
                  )}
                </div>
                {/* <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Billing GSTN
                  </label>
                  <Input
                    name="gstn"
                    value={formData.gstn}
                    onChange={handleInputChange}
                    className="uppercase"
                    maxLength={15}
                  />
                </div> */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex justify-between items-center">
                    Billing GSTN
                    <span className="flex items-center gap-1">
                      {gstnStatus === "api_verified" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      {gstnStatus === "valid" && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      )}
                      {(gstnStatus === "invalid" ||
                        gstnStatus === "api_error") && (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      name="gstin"
                      value={formData.gstin}
                      onChange={(e) => handleGstinChange(e.target.value)}
                      className="uppercase flex-1"
                      maxLength={15}
                      placeholder="e.g. 22AAAAA0000A1Z5"
                    />

                    <Button
                      type="button"
                      variant={
                        gstnStatus === "api_verified" ? "default" : "outline"
                      }
                      disabled={
                        gstnStatus === "idle" ||
                        gstnStatus === "invalid" ||
                        gstnVerifying
                      }
                      onClick={verifyGSTNWithPortal}
                      className={
                        gstnStatus === "api_verified"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : ""
                      }
                    >
                      {gstnVerifying
                        ? "Checking..."
                        : gstnStatus === "api_verified"
                          ? "✅ Verified"
                          : "Verify"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (formData.gstin)
                          navigator.clipboard.writeText(formData.gstin);
                        window.open(
                          "https://services.gst.gov.in/services/searchtp",
                          "_blank",
                        );
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  {errors.gstin && (
                    <p className="text-red-500 text-xs">{errors.gstin}</p>
                  )}

                  {gstnMessage && (
                    <p
                      className={`text-xs mt-1 ${
                        gstnStatus === "api_verified"
                          ? "text-emerald-600 font-medium"
                          : gstnStatus === "valid"
                            ? "text-amber-600"
                            : "text-rose-600"
                      }`}
                    >
                      {gstnMessage}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Tax Registration Country
                  </label>
                  <Input
                    name="taxRegistrationCountry"
                    value={formData.taxRegistrationCountry}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Tax Registration State
                  </label>
                  <Input
                    name="taxRegistrationState"
                    value={formData.taxRegistrationState}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Tax Registration No
                  </label>
                  <Input
                    name="taxRegistrationNumber"
                    value={formData.taxRegistrationNumber}
                    onChange={handleInputChange}
                  />
                  {errors.taxRegistrationNumber && (
                    <p className="text-red-500 text-xs">
                      {errors.taxRegistrationNumber}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Registration Type
                  </label>
                  <select
                    name="registrationType"
                    value={formData.registrationType}
                    onChange={handleInputChange}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Composition">Composition</option>
                    <option value="Overseas">Overseas</option>
                    <option value="Unregistered">Unregistered</option>
                  </select>
                  {errors.registrationType && (
                    <p className="text-red-500 text-xs">
                      {errors.registrationType}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    PAN Availability
                  </label>
                  <select
                    name="panAvailability"
                    value={formData.panAvailability}
                    onChange={handleInputChange}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.panAvailability && (
                    <p className="text-red-500 text-xs">
                      {errors.panAvailability}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    PAN No
                     {formData.panAvailability === "Yes" && (
    <span className="text-red-500">*</span>
  )}
                  </label>
                  <Input
                    name="pan"
                    value={formData.pan}
                    onChange={handleInputChange}
                    className="uppercase"
                    maxLength={10}
                  />
                  {errors.pan && (
                    <p className="text-red-500 text-xs">{errors.pan}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial & Bank Details */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
                Financial & Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Terms
                  </label>
                  <Input
                    name="terms"
                    value={formData.terms}
                    onChange={handleInputChange}
                  />
                  {errors.terms && (
                    <p className="text-red-500 text-xs">{errors.terms}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  {errors.currency && (
                    <p className="text-red-500 text-xs">{errors.currency}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Bank Account No
                  </label>
                  <Input
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleInputChange}
                  />
                  {errors.bankAccountNumber && (
                    <p className="text-red-500 text-xs">
                      {errors.bankAccountNumber}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Bank IFSC Code
                  </label>
                  <Input
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleInputChange}
                  />
                  {errors.ifscCode && (
                    <p className="text-red-500 text-xs">{errors.ifscCode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Bank Name
                  </label>
                  <Input
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                  />
                  {errors.bankName && (
                    <p className="text-red-500 text-xs">{errors.bankName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Swift Code
                  </label>
                  <Input
                    name="swiftCode"
                    value={formData.swiftCode}
                    onChange={handleInputChange}
                  />
                  {errors.swiftCode && (
                    <p className="text-red-500 text-xs">{errors.swiftCode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
                Additional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    MSME
                  </label>
                  <select
                    name="msme"
                    value={formData.msme}
                    onChange={handleInputChange}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.msme && (
                    <p className="text-red-500 text-xs">{errors.msme}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    MSME Category
                  </label>
                  <Input
                    name="msmeCategory"
                    value={formData.msmeCategory}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    MSME Certificate Number
                    {formData.msme === "Yes" && (
                   <span className="text-red-500">*</span>
                   )}
                  </label>
                  <Input
                    name="msmeCertificateNumber"
                    value={formData.msmeCertificateNumber}
                    onChange={handleInputChange}
                  />
                  {errors.msmeCertificateNumber && (
                    <p className="text-red-500 text-xs">
                      {errors.msmeCertificateNumber}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Major Activity
                  </label>
                  <Input
                    name="majorActivity"
                    value={formData.majorActivity}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    PF Number
                  </label>
                  <Input
                    name="pfNumber"
                    value={formData.pfNumber}
                    onChange={handleInputChange}
                  />
                  {errors.pfNumber && (
                    <p className="text-red-500 text-xs">{errors.pfNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* File Upload */}
            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                File Upload
              </label>

              {!uploadedFile ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-all group">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <p className="text-sm text-slate-500 group-hover:text-slate-700">
                      <span className="font-medium text-blue-600">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-slate-400">
                      PDF, PNG, JPG, DOCX up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.docx,.doc"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-white shadow-sm">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="w-7 h-7 rounded-full hover:bg-rose-50 flex items-center justify-center transition-colors group"
                  >
                    <X className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
                  </button>
                </div>
              )}
            </div>
          </CardContent>

          <div className="p-6 pt-0 flex justify-end gap-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Submitting..."
                : isEditMode
                  ? "Update Vendor"
                  : "Submit for Approval"}
            </Button>
          </div>
        </Card>
      </form>

      {/* Email Modal */}
      {emailModalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-slate-800">
                  Simulated Email Sent
                </h3>
                <p className="text-sm text-slate-500">
                  This is what the approver would receive in their inbox.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEmailModalContent(null)}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            <div
              className="p-6 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: emailModalContent }}
            />
            <div className="p-4 border-t bg-slate-50 flex justify-end">
              <Button onClick={() => setEmailModalContent(null)}>
                Close Simulation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
