import axios from "axios";
import { baseUrl } from "../environment.dev";

export function registerAPICall(registerModel) {
  // Add/rename fields if your backend needs more (e.g., userName, phone, etc.)
  return axios.post(baseUrl + "api/v1/auth/register", registerModel);
}
