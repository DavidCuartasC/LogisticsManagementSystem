export const validateLoginForm = ({ email, password }) => {
    const errors = {};
  
    if (!email) {
      errors.email = "Email is required!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email format";
    }
  
    if (!password) {
      errors.password = "Password is required!";
    }
  
    return errors;
  };
  