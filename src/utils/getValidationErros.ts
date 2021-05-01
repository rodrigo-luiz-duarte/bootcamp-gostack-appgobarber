import { ValidationError } from "yup";

interface FormValidationErrors {
  [key: string]: string;
}

export default function getValidationErros(
  error: ValidationError
): FormValidationErrors {
  const validationErros: FormValidationErrors = {};

  error.inner.forEach((e) => {
    if (e && e.path) {
      validationErros[e.path] = e.message;
    }
  });

  return validationErros;
}
