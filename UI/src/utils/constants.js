
const SERVER_IP = import.meta.env.VITE_DEV_API_URL;
const API_VERSION = import.meta.env.VITE_API_VERSION;

export const ENV = {
  BASE_PATH: SERVER_IP,
  BASE_API: `${SERVER_IP}/${API_VERSION}`,
  API_ROUTES: {
    SIGNIN: "/authentication/signin",
    SIGNUP: "/authentication/signup",
    VERIFY: "/authentication/verify",
    RESEND: "/authentication/resend",
    RESETPASSWORD: "/password/reset",
    CHANGEPASSWORD: "/password/change",
  },
};

export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  RESET_PASSWORD: "/password/reset",
  VERIFY: "/verify",
  DASHBOARD: "/dashboard",
};

