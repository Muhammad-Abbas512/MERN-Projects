import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api/auth",
  withCredentials: true,
});

export const loginUser = (data) => API.post("/login", data);
export const registerUser = (data) => API.post("/register", data);
export const logoutUser = () => API.get("/logout");
export const verifyEmail = (data) => API.post("/verify-email", data);

export default API;