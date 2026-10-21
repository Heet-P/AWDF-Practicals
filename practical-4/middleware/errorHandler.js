// Four arguments tell Express this is an error-handling middleware.
// The stack trace is logged on the server but never sent to the client.
module.exports = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong' });
};
