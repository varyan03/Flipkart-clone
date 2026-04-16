/**
 * Sends a standardized success response.
 * 
 * @param {Object} res - Express response object
 * @param {any} data - Data to send in the response
 * @param {string} [message] - Optional success message
 * @param {number} [statusCode=200] - HTTP status code
 */
function sendSuccess(res, data, message = undefined, statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message })
  });
}

/**
 * Sends a standardized error response.
 * 
 * @param {Object} res - Express response object
 * @param {string|Error} error - Error message or actual Error object
 * @param {number} [statusCode=400] - HTTP status code
 */
function sendError(res, error, statusCode = 400) {
  res.status(statusCode).json({
    success: false,
    error: typeof error === 'string' ? error : error.message
  });
}

/**
 * Custom error class for operational errors.
 * 
 * @param {string} message - Error description
 * @param {number} statusCode - HTTP status code associated with the error
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { sendSuccess, sendError, AppError };
