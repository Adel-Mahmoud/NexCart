import http from "../../../shared/services/http";
import { LoginPayload, RegisterPayload, AuthResponse } from "../types/auth.types";

export const login = async (data: LoginPayload): Promise<AuthResponse> => {
  const res = await http.post("/auth/login", data);
  return res.data;
};

export const register = async (data: RegisterPayload) => {
  const response = await http.post("/auth/register", {
    ...data,
    password_confirmation: data.password,
  });

  return response.data;
};
export const getMe = async () => {
  const res = await http.get("/auth/me");
  return res.data;
};

export const logout = async () => {
  const res = await http.post("/auth/logout");
  return res.data;
};