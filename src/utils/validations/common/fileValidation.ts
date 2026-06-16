export const validateFile = (file: File | null) => {
  if (!file) return { valid: false, message: "No file selected" };

  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: "Only PDF, PNG, JPG, DOC, DOCX allowed",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      message: "File must be less than 10MB",
    };
  }

  return { valid: true };
};
