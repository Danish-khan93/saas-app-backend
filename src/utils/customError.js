export class ErrorResponse extends Error {
  constructor(message, code = 400, errors = null) {
    super(message);

    this.status = "error";
    this.code = code;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}
