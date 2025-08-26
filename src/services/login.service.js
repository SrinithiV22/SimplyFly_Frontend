import axios from "axios";

const API_BASE_URL = 'http://localhost:5148/api/v1';

export function loginAPICall(loginModel) {
  return axios.post(`${API_BASE_URL}/auth/login`, loginModel);
}

export function registerAPICall(registerModel) {
  return axios.post(`${API_BASE_URL}/auth/register`, registerModel);
}
