export const Response = class {
  constructor(status, message, result, code) {
    this.status = status;
    this.message = message;
    this.result = result;
    this.code = code;
  }
};


