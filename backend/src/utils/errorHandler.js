function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  // eslint-disable-next-line no-console
  console.error('Error Handler:', {
    status,
    message,
    path: req.path,
    method: req.method,
    stack: err.stack
  });
  if (status >= 500) {
    console.error('Full error:', err);
  }
  res.status(status).json({ 
    error: message,
    message: message, // Also include as 'message' for consistency
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = { errorHandler };


