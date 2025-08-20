import axios from "axios";
import { baseUrl } from "../environment.dev";

export function loginAPICall(loginModel) {
  // Adjust path/casing to match your backend exactly
  return axios.post(baseUrl + "api/v1/auth/login", loginModel);
}
