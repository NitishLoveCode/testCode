export const validateVendor = (data: any) => {
  const errors: Record<string, string> = {};

  if (!data.companyName?.trim()) {
    errors.companyName = "Company name is required";
  } else if (data.companyName.length > 200) {
    errors.companyName = "Max 200 characters allowed";
  }

  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = "Invalid email";
    }
  }

  if (data.representativeEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.representativeEmail)) {
      errors.representativeEmail = "Invalid representative email";
    }
  }

  if (data.phoneNo && data.phoneNo.length > 20) {
    errors.phoneNo = "Max 20 characters allowed";
  }

  if (data.gstin && data.gstin.length !== 15) {
    errors.gstin = "GSTIN must be exactly 15 characters";
  }

  if (data.panAvailability === "Yes" && (!data.pan || data.pan.length !== 10)) {
    errors.pan = "PAN must be exactly 10 characters";
  }

  if (data.msme === "Yes" && !data.msmeCertificateNumber) {
   errors.msmeCertificateNumber = "MSME certificate required";
  }

  // ENUMS
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

  if (data.terms && !VALID_TERMS.includes(data.terms)) {
    errors.paymentTerms = "Invalid payment terms";
  }

  if (data.currency && !VALID_CURRENCY.includes(data.currency)) {
    errors.currency = "Invalid currency";
  }

  if (data.billingPincode && data.billingPincode.length > 10) {
    errors.billingPincode = "Max 10 characters";
  }

  if (data.bankAccountNumber && data.bankAccountNumber.length > 30) {
  errors.bankAccountNumber = "Max 30 characters";
  }

  if (data.ifscCode && data.ifscCode.length > 20) {
   errors.ifscCode = "Max 20 characters";
  }

  if (data.swiftCode && data.swiftCode.length > 20) {
    errors.swiftCode = "Max 20 characters";
  }

  return errors;
};
