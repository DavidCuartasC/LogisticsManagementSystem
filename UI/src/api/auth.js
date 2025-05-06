import { ENV } from "../utils";
const { BASE_PATH, API_ROUTES } = ENV;

export class Auth {
  async signIn(data) {
    const response = await fetch(`${ENV.BASE_API}${API_ROUTES.SIGNIN}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });    
    console.log(response);
    return response;
  }

  async signUp(data) {
    const response = await fetch(`${ENV.BASE_API}${API_ROUTES.SIGNUP}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });    
    console.log(response);
    return response;
  }

  async verifyCode(data) {
    const response = await fetch(`${ENV.BASE_API}${API_ROUTES.VERIFY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });    
    console.log(response);
    return response;
  }

  async resendCode(data) {
    const response = await fetch(`${ENV.BASE_API}${API_ROUTES.RESEND}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    console.log(response);
    return response;
  }
}
export const auth = new Auth();
