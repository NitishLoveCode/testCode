import React, { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  UploadCloud,
  FileText,
  X,
} from "lucide-react";
import { createCustomer, updateCustomer } from "@/api";
// import { XCircle, UploadCloud, FileText, X } from "lucide-react";
import { validateCustomer } from "@/utils/validations/customer/customerValidation";
import { validateFile } from "@/utils/validations/common/fileValidation";

interface NewCustomerProps {
  currentUserRole?: string;
}

export default function NewCustomer({
  currentUserRole = "",
}: NewCustomerProps) {
  const [formData, setFormData] = useState({
    companyName: "",
    tradeName: "",
    gstin: "",
    pan: "",
    registrationType: "Regular",
    currency: "INR",
    terms: "Net 30",
    email: "",
    coaCode: "",
    receivableAccount: "",
    customerCategory: "",
    isIndividual: false,
    billingAddress3: "",
    city: "",
    aadhaar: "",
    type: "",
    celebalEntity: "",
    firstName: "",
    middleName: "",
    lastName: "",
    phoneNo: "",
    billingCountry: "",
    billingAddress1: "",
    billingAddress2: "",
    billingState: "",
    billingPincode: "",
    taxRegistrationCountry: "",
    taxRegistrationState: "",
    taxRegistrationNumber: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "validating" | "valid" | "invalid" | "api_verified" | "api_error"
  >("idle");
  const [validationMessage, setValidationMessage] = useState("");
  const [isManuallyVerified, setIsManuallyVerified] = useState(false);
  const [gstnVerifying, setGstnVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailModalContent, setEmailModalContent] = useState<string | null>(
    null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // upload file logic
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    const result = validateFile(file);

    if (!result.valid) {
      setErrors((prev) => ({
        ...prev,
        file: result.message || "Invalid file",
      }));
      return;
    }

    // clear error if valid
    setErrors((prev) => ({
      ...prev,
      file: "",
    }));

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

    setFormData((prev) => ({
      ...prev,
      [name]: name === "isIndividual" ? value === "true" : value,
    }));

    //  CLEAR ERROR FOR THAT FIELD
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    if (name === "gstin") {
      setIsManuallyVerified(false);
    }
  };

  const handleGstnChange = (value: string) => {
    const upper = value.toUpperCase();

    setFormData((prev) => ({
      ...prev,
      gstin: upper,
    }));

    // ✅ clear error
    setErrors((prev) => ({
      ...prev,
      gstin: "",
    }));

    setValidationStatus("idle");
    setValidationMessage("");
    setIsManuallyVerified(false);

    if (upper.length === 15) {
      validateGSTN(upper);
    }
  };

  const validateGSTN = (gstn: string) => {
    const gstnRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (gstnRegex.test(gstn)) {
      setValidationStatus("valid");
      setValidationMessage(
        "Format valid — click Verify to confirm with GST portal.",
      );
      const extractedPan = gstn.substring(2, 12);
      setFormData((prev) => ({ ...prev, pan: extractedPan }));
    } else {
      setValidationStatus("invalid");
      setValidationMessage(
        "Invalid GSTN format. Must be 15 characters (e.g. 22AAAAA0000A1Z5).",
      );
    }
  };

  const verifyGSTNWithPortal = async () => {
    const gstin = formData.gstin.toUpperCase().trim();
    setGstnVerifying(true);
    setValidationMessage("Verifying with GST portal...");
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
        const regType = data.registrationType || data.dty || "";
        setValidationStatus("api_verified");
        setValidationMessage(
          ` Verified: ${legalName}${tradeName ? " (Trade: " + tradeName + ")" : ""} — ${data.status || data.sts || "Active"}`,
        );
        setFormData((prev) => ({
          ...prev,
          pan: gstin.substring(2, 12),
          ...(legalName && { companyName: legalName }),
          ...(tradeName && { tradeName }),
          ...(regType && { registrationType: regType }),
        }));
        setIsManuallyVerified(true);
      } else {
        setValidationStatus("api_error");
        setValidationMessage(
          data.message || "GSTN not found or inactive on GST portal.",
        );
      }
    } catch {
      setValidationStatus("api_error");
      setValidationMessage(
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
    const validationErrors = validateCustomer(formData, uploadedFile);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    // clear errors if valid
    setErrors({});

    try {
      const editingData = localStorage.getItem("editingApproval");

      if (editingData) {
        // EDIT MODE — call PUT API
        const parsed = JSON.parse(editingData);
        // await updateCustomer(parsed.id, formData);
        // await updateCustomer(parsed.id, {
        //   companyName: formData.companyName,
        //   tradeName: formData.tradeName,
        //   gstin: formData.gstin,
        //   pan: formData.pan,

        //   terms: formData.terms,

        //   taxRegistrationCountry: formData.taxRegistrationCountry,
        //   taxRegistrationState: formData.taxRegistrationState,
        //   taxRegistrationNumber: formData.taxRegistrationNumber,

        //   aadhaar: formData.aadhaar,

        //   registrationType: formData.registrationType,
        //   currency: formData.currency,

        //   city: formData.city,
        //   billingState: formData.billingState,

        //   email: formData.email,
        //   phoneNo: formData.phoneNo,

        //   isIndividual: formData.isIndividual,
        // });
        
        // await updateCustomer(parsed.id, {
        await updateCustomer(parsed.CustomerId, {
  companyName: formData.companyName,
  tradeName: formData.tradeName,
  gstin: formData.gstin,
  pan: formData.pan,

  registrationType: formData.registrationType,
  currency: formData.currency,
  terms: formData.terms,

  email: formData.email,
  phoneNo: formData.phoneNo,

  coaCode: formData.coaCode,
  receivableAccount: formData.receivableAccount,
  customerCategory: formData.customerCategory,
  celebalEntity: formData.celebalEntity,

  type: formData.type,

  isIndividual: formData.isIndividual,

  firstName: formData.firstName,
  middleName: formData.middleName,
  lastName: formData.lastName,

  aadhaar: formData.aadhaar,

  billingCountry: formData.billingCountry,
  billingAddress1: formData.billingAddress1,
  billingAddress2: formData.billingAddress2,
  billingAddress3: formData.billingAddress3,
  city: formData.city,
  billingState: formData.billingState,
  billingPincode: formData.billingPincode,

  taxRegistrationCountry:
    formData.taxRegistrationCountry,

  taxRegistrationState:
    formData.taxRegistrationState,

  taxRegistrationNumber:
    formData.taxRegistrationNumber,
});
        localStorage.removeItem("editingApproval");
        alert("Customer updated successfully");
        window.location.hash = "approvals";
      } else {
        // CREATE MODE — determine stage based on role
        // Admin → goes directly to Admin's approval tab
        // Requestor → goes to Approver's approval tab first
        const user = localStorage.getItem("user");
        const parsedUser = user ? JSON.parse(user) : null;
        const role = parsedUser?.role || currentUserRole;

        const payload = Object.fromEntries(
          Object.entries({
            companyName: formData.companyName,
            tradeName: formData.tradeName,
            gstin: formData.gstin,
            pan: formData.pan,

            terms: formData.terms,

            taxRegistrationCountry: formData.taxRegistrationCountry,
            taxRegistrationState: formData.taxRegistrationState,
            taxRegistrationNumber: formData.taxRegistrationNumber,

            aadhaar: formData.aadhaar,

            registrationType: formData.registrationType,
            currency: formData.currency,

            city: formData.city,
            billingState: formData.billingState,

            email: formData.email,
            phoneNo: formData.phoneNo,

            type: formData.type,
            coaCode: formData.coaCode,
            receivableAccount: formData.receivableAccount,
            celebalEntity: formData.celebalEntity,
            customerCategory: formData.customerCategory,

            isIndividual: formData.isIndividual,

            firstName: formData.firstName,
            middleName: formData.middleName,
            lastName: formData.lastName,

            billingCountry: formData.billingCountry,
            billingAddress1: formData.billingAddress1,
            billingAddress2: formData.billingAddress2,
            billingAddress3: formData.billingAddress3,

            billingPincode: formData.billingPincode,

            submittedByRole: role,
            initialStage: role === "Admin" ? "Admin" : "Approver",
          }).filter(
            ([_, value]) =>
              value !== "" && value !== null && value !== undefined,
          ),
        );

        const status = getStatus(role, "submit", "Customer");

        await createCustomer({
          ...payload,
          status,
        });

        alert(
          role === "Admin"
            ? "Customer submitted — moved to Admin Approvals."
            : "Customer submitted — sent to Approver for review.",
        );
        window.location.hash = "approvals";
      }
    } catch (error: any) {
      console.error("FULL ERROR:", error);
      console.log("BACKEND RESPONSE:", error?.response);

      // Backend validation errors
      const backendErrors = error?.response?.data?.errors;

      if (Array.isArray(backendErrors)) {
        const formattedErrors: Record<string, string> = {};

        // backend -> frontend mapping
        const fieldMap: Record<string, string> = {
          aadhaar: "aadhaar",
          terms: "terms",
          taxRegistrationCountry: "taxRegistrationCountry",
          taxRegistrationState: "taxRegistrationState",
          taxRegistrationNumber: "taxRegistrationNumber",
        };

        backendErrors.forEach((err: any) => {
          const frontendField = fieldMap[err.field] || err.field;

          formattedErrors[frontendField] = err.message;
        });

        setErrors(formattedErrors);

        return;
      }

      // General backend error
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Internal Server Error";

      alert(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

//  useEffect(() => {
//   const editingData = localStorage.getItem("editingApproval");

//   if (editingData) {
//     const parsed = JSON.parse(editingData);

//     if (parsed.entityType === "Customer") {
//       setFormData((prev) => ({
//         ...prev,

//         companyName: parsed.formData.companyName || "",
//         tradeName: parsed.formData.tradeName || "",
//         gstin: parsed.formData.gstin || "",
//         pan: parsed.formData.pan || "",

//         registrationType:
//           parsed.formData.registrationType || "Regular",

//         currency: parsed.formData.currency || "INR",

//         terms: parsed.formData.terms || "Net 30",

//         email: parsed.formData.email || "",

//         coaCode: parsed.formData.coaCode || "",

//         receivableAccount:
//           parsed.formData.receivableAccount || "",

//         customerCategory:
//           parsed.formData.customerCategory || "",

//         isIndividual:
//           parsed.formData.isIndividual || false,

//         billingAddress3:
//           parsed.formData.billingAddress3 || "",

//         city: parsed.formData.city || "",

//         aadhaar: parsed.formData.aadhaar || "",

//         type: parsed.formData.type || "",

//         celebalEntity:
//           parsed.formData.celebalEntity || "",

//         firstName: parsed.formData.firstName || "",

//         middleName: parsed.formData.middleName || "",

//         lastName: parsed.formData.lastName || "",

//         phoneNo: parsed.formData.phoneNo || "",

//         billingCountry:
//           parsed.formData.billingCountry || "",

//         billingAddress1:
//           parsed.formData.billingAddress1 || "",

//         billingAddress2:
//           parsed.formData.billingAddress2 || "",

//         billingState:
//           parsed.formData.billingState || "",

//         billingPincode:
//           parsed.formData.billingPincode || "",

//         taxRegistrationCountry:
//           parsed.formData.taxRegistrationCountry || "",

//         taxRegistrationState:
//           parsed.formData.taxRegistrationState || "",

//         taxRegistrationNumber:
//           parsed.formData.taxRegistrationNumber || "",
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

      companyName: parsed.CompanyName || "",
      tradeName: parsed.TradeName || "",
      gstin: parsed.GSTIN || "",
      pan: parsed.PAN || "",

      registrationType:
        parsed.RegistrationType || "Regular",

      currency: parsed.Currency || "INR",

      terms: parsed.Terms || "Net 30",

      email: parsed.Email || "",

      coaCode: parsed.COACode || "",

      receivableAccount:
        parsed.ReceivableAccount || "",

      customerCategory:
        parsed.CustomerCategory || "",

      isIndividual:
        parsed.IsIndividual || false,

      billingAddress3:
        parsed.BillingAddress3 || "",

      city: parsed.City || "",

      aadhaar: parsed.Aadhaar || "",

      type: parsed.Type || "",

      celebalEntity:
        parsed.CelebalEntity || "",

      firstName: parsed.FirstName || "",

      middleName: parsed.MiddleName || "",

      lastName: parsed.LastName || "",

      phoneNo: parsed.PhoneNo || "",

      billingCountry:
        parsed.BillingCountry || "",

      billingAddress1:
        parsed.BillingAddress1 || "",

      billingAddress2:
        parsed.BillingAddress2 || "",

      billingState:
        parsed.BillingState || "",

      billingPincode:
        parsed.BillingPincode || "",

      taxRegistrationCountry:
        parsed.TaxRegistrationCountry || "",

      taxRegistrationState:
        parsed.TaxRegistrationState || "",

      taxRegistrationNumber:
        parsed.TaxRegistrationNumber || "",
    }));

    setIsEditMode(true);
  }
}, []);

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEditMode ? "Edit Customer" : "New Customer"}
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
            <CardTitle>Customer Details</CardTitle>
            <CardDescription>
              Enter the basic information for the new customer.
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
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-xs">{errors.companyName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Trade Name
                  </label>
                  <Input
                    name="tradeName"
                    value={formData.tradeName}
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
                    COA Code
                  </label>
                  <Input
                    name="coaCode"
                    value={formData.coaCode}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Receivable Account
                  </label>
                  <Input
                    name="receivableAccount"
                    value={formData.receivableAccount}
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
                    Customer Category
                  </label>
                  <Input
                    name="customerCategory"
                    value={formData.customerCategory}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Is Individual
                  </label>
                  <select
                    name="isIndividual"
                    value={String(formData.isIndividual)}
                    onChange={handleInputChange}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
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
                    {formData.isIndividual && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs">{errors.firstName}</p>
                  )}
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
                    {formData.isIndividual && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs">{errors.lastName}</p>
                  )}
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
                    Address 3
                  </label>
                  <Input
                    name="billingAddress3"
                    value={formData.billingAddress3}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    City
                  </label>
                  <Input
                    name="city"
                    value={formData.city}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex justify-between items-center">
                    Billing GSTN
                    <span className="flex items-center gap-1">
                      {validationStatus === "api_verified" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      {validationStatus === "valid" && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      )}
                      {(validationStatus === "invalid" ||
                        validationStatus === "api_error") && (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      name="gstin"
                      value={formData.gstin}
                      onChange={(e) => handleGstnChange(e.target.value)}
                      placeholder="e.g. 22AAAAA0000A1Z5"
                      maxLength={15}
                      className="uppercase flex-1"
                    />

                    <Button
                      type="button"
                      variant={
                        validationStatus === "api_verified"
                          ? "default"
                          : "outline"
                      }
                      disabled={
                        validationStatus === "idle" ||
                        validationStatus === "invalid" ||
                        gstnVerifying
                      }
                      onClick={verifyGSTNWithPortal}
                      className={
                        validationStatus === "api_verified"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : ""
                      }
                    >
                      {gstnVerifying
                        ? "Checking..."
                        : validationStatus === "api_verified"
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
                      title="Open GST Portal manually"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>

                  {errors.gstin && (
                    <p className="text-red-500 text-xs">{errors.gstin}</p>
                  )}

                  {validationMessage && (
                    <p
                      className={`text-xs mt-1 ${
                        validationStatus === "api_verified"
                          ? "text-emerald-600 font-medium"
                          : validationStatus === "valid"
                            ? "text-amber-600"
                            : "text-rose-600"
                      }`}
                    >
                      {validationMessage}
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
                    Tax Registration Number
                  </label>
                  <Input
                    name="taxRegistrationNumber"
                    value={formData.taxRegistrationNumber}
                    onChange={handleInputChange}
                  />
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
                  <label className="text-sm font-medium text-slate-700 flex justify-between">
                    PAN No
                    {formData.pan && (
                      <Badge variant="secondary" className="text-[10px]">
                        Auto-extracted
                      </Badge>
                    )}
                  </label>
                  <Input
                    name="pan"
                    value={formData.pan}
                    onChange={handleInputChange}
                    placeholder="10 Character PAN"
                    maxLength={10}
                    className="uppercase"
                  />
                  {errors.pan && (
                    <p className="text-red-500 text-xs">{errors.pan}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Aadhar No
                  </label>
                  <Input
                    name="aadhaar"
                    value={formData.aadhaar}
                    onChange={handleInputChange}
                  />
                 {errors.aadhaar && (
  <p className="text-red-500 text-xs">{errors.aadhaar}</p>
)}
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
                Financial Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Terms
                  </label>
                  <select
                    name="terms"
                    value={formData.terms}
                    onChange={handleInputChange}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                  </select>
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
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    {/* <option value="CAD">CAD - Canadian Dollar</option> */}
                    {/* <option value="AUD">AUD - Australian Dollar</option> */}
                    {/* <option value="SGD">SGD - Singapore Dollar</option> */}
                    {/* <option value="AED">AED - UAE Dirham</option> */}
                  </select>
                  {errors.currency && (
                    <p className="text-red-500 text-xs">{errors.currency}</p>
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

              {errors.file && (
                <p className="text-red-500 text-xs mt-1">{errors.file}</p>
              )}
            </div>
          </CardContent>

          <div className="p-6 pt-0 flex justify-end gap-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button
              type="submit"
              // disabled={
              //   isSubmitting ||
              //   validationStatus === "invalid" ||
              //   validationStatus === "api_error" ||
              //   (validationStatus === "valid" && !isManuallyVerified)
              // }
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Submitting..."
                : isEditMode
                  ? "Update Customer"
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
