import { ENV } from "../utils";
const { BASE_PATH, API_ROUTES } = ENV;

export class Password {
  async resetPassword(data) {
    const response = await fetch(`${ENV.BASE_API}${API_ROUTES.RESETPASSWORD}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response;
    console.log(response);
  }

  async changePassword(data) {
    const response = await fetch(`${ENV.BASE_API}${API_ROUTES.changePassword}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response;
    console.log(response);
  }

}
export const password = new Password();
