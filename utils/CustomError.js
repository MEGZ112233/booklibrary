class CustomError extends Error {
    constructor(message , statusCode = -1) {
      super(message);
      this.statusCode = statusCode;
    }
}
module.exports = CustomError;