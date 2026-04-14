function sendSuccess(res, data, message = undefined, statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message })
  });
}

function sendError(res, error, statusCode = 400) {
  res.status(statusCode).json({
    success: false,
    error: typeof error === 'string' ? error : error.message
  });
}

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { sendSuccess, sendError, AppError };
