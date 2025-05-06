const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isPasswordStrong = (password) => password.length >= 6;

module.exports = {
  isEmailValid,
  isPasswordStrong,
};
