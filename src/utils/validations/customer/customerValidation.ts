import { validateFile } from "../common/fileValidation";

export const validateCustomer = (data: any, file: File | null) => {
  const errors: Record<string, string> = {};

  // Company Name
  if (!data.companyName?.trim()) {
    errors.companyName = "Company Name is required";
  } else if (data.companyName.length > 200) {
    errors.companyName = "Max 200 characters allowed";
  }

  // Email
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = "Invalid email format";
    } else if (data.email.length > 255) {
      errors.email = "Email max 255 characters";
    }
  }

  // Phone
  if (data.phoneNo && data.phoneNo.length > 20) {
    errors.phoneNo = "Phone number max 20 characters";
  }

  // GSTIN
  if (data.gstin) {
  const gstRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  if (!gstRegex.test(data.gstin)) {
    errors.gstin = "Invalid GSTIN format";
  }
}

  // PAN
  if (data.pan) {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  if (!panRegex.test(data.pan)) {
    errors.pan = "Invalid PAN format";
  }
}

  // Aadhaar
  if (data.aadhaar && data.aadhaar.length !== 12) {
  errors.aadhaar = "Aadhaar must be exactly 12 digits";
}

  // Boolean check
  if (typeof data.isIndividual !== "boolean") {
  errors.isIndividual = "Must be true or false";
}

  // Individual validation
  if (data.isIndividual === true) {
    if (!data.firstName) errors.firstName = "First name required";
    if (!data.lastName) errors.lastName = "Last name required";
  }

  // ENUM validations
  const VALID_REG_TYPES = [
    "Regular",
    "Composition",
    "Overseas",
    "Unregistered",
  ];
  const VALID_TERMS = [
    "Net 15",
    "Net 30",
    "Net 45",
    "Net 60",
    "Due on Receipt",
  ];
  const VALID_CURRENCY = ["INR", "USD", "EUR", "GBP"];

  if (
    data.registrationType &&
    !VALID_REG_TYPES.includes(data.registrationType)
  ) {
    errors.registrationType = "Invalid registration type";
  }

  // if (data.paymentTerms && !VALID_TERMS.includes(data.paymentTerms)) {
  //   errors.paymentTerms = "Invalid payment terms";
  // }
  if (data.terms && !VALID_TERMS.includes(data.terms)) {
  errors.terms = "Invalid payment terms";
}

  if (data.currency && !VALID_CURRENCY.includes(data.currency)) {
    errors.currency = "Invalid currency";
  }

  // Pincode
  if (data.billingPincode && data.billingPincode.length > 10) {
    errors.billingPincode = "Max 10 characters allowed";
  }

  // File validation
  if (file) {
    const result = validateFile(file);
    if (!result.valid) {
      errors.file = result.message || "Invalid file";
    }
  }

  return errors;
};
