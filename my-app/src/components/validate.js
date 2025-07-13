export const validate = (data, type) => {
  const errors = {};

  // Email Validation
  if (!data.email) {
    errors.email = "Email is required!";
  } else if (
    !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      String(data.email).toLowerCase()
    )
  ) {
    errors.email = "Invalid email address!";
  }

  // Password Validation (with at least one uppercase, one symbol, and one number)
  if (!data.password) {
    errors.password = "Password is required!";
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters!";
  } else if (!/[A-Z]/.test(data.password)) {
    errors.password = "Password must contain at least one uppercase letter!";
  } else if (!/[0-9]/.test(data.password)) {
    errors.password = "Password must contain at least one number!";
  } else if (!/[!@#_$%^&*(),.?":{}|<>]/.test(data.password)) {
    errors.password = "Password must contain at least one symbol!";
  }

  if (!data.bankName) {
    errors.bankName = "Bank Name is required";
  }

  const cardNumber = data.cardNumber;
  if (!cardNumber) {
    errors.cardNumber = "Card number is required";
  } else if (cardNumber.length != 19) {
    errors.cardNumber = "Card number must be at least 16 characters long";
  }

  // If this is the sign-up form
  if (type == "signUp") {
    // Name Validation
    if (!data.name.trim()) {
      errors.name = "Name is required!";
    }

    if (!data.userName.trim()) {
      errors.userName = "Name is required!";
    }

    if (!data.surName.trim()) {
      errors.surName = "Name is required!";
    }

    // Confirm Password Validation
    if (!data.confirmPassword) {
      errors.confirmPassword = "Please confirm your password!";
    } else if (data.confirmPassword != data.password) {
      errors.confirmPassword = "Passwords do not match!";
    }

    // Checkbox Validation (IsAccepted)
    if (!data.IsAccepted) {
      errors.IsAccepted = "You must accept the terms!";
    }
  }

  return errors;
};
