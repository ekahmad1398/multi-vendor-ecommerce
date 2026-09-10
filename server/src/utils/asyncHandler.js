// Lets route controllers throw errors without repeating try/catch in every route.
export default (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
