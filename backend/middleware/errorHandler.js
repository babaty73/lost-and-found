export function notFound(req, res) {
  res.status(404).json({ message: "Route not found." });
}

/**
 * Centralized error handler. Never leaks stack traces or internal error
 * detail to the client in production; always logs the real error server-side
 * so it isn't silently lost either.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error(err);

  let status = err.statusCode || 500;
  let message = err.message || "Something went wrong.";

  // Mongoose validation errors -> 400 with a readable message.
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(" ");
  }

  // Duplicate-key errors (e.g. duplicate email, duplicate claim) -> 409.
  if (err.code === 11000) {
    status = 409;
    message = "This record already exists.";
  }

  // Malformed Mongo ObjectId in a route param -> 400, not a raw 500.
  if (err.name === "CastError") {
    status = 400;
    message = "Invalid identifier.";
  }

  if (status === 500 && process.env.NODE_ENV === "production") {
    message = "Something went wrong. Please try again later.";
  }

  res.status(status).json({ message });
}
