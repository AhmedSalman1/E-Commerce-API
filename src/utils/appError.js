export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // differentiate between operational errors and programming errors

    // cleaner stack trace starting from the point where the error was instantiated
    Error.captureStackTrace(this, this.constructor);
  }
}
