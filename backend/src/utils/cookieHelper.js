/**
 * Security-hardened cookie configuration helper
 */
const getSecureCookieOptions = (customOptions = {}) => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true, // Prevent client-side JS access (XSS mitigation)
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF mitigation
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days default
    ...customOptions,
  };
};

/**
 * Helper to set a hardened cookie on Express res
 */
const setSecureCookie = (res, name, value, customOptions = {}) => {
  const options = getSecureCookieOptions(customOptions);
  res.cookie(name, value, options);
};

/**
 * Helper to safely clear a cookie
 */
const clearSecureCookie = (res, name, customOptions = {}) => {
  const options = getSecureCookieOptions({ maxAge: 0, ...customOptions });
  res.clearCookie(name, options);
};

module.exports = {
  getSecureCookieOptions,
  setSecureCookie,
  clearSecureCookie,
};
