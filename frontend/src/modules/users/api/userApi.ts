import http from "../../../shared/services/http";
import { User, CreateUserInput, UpdateUserInput } from "../types/user.types";

export const getUsers = async (): Promise<User[]> => {
  const response = await http.get("/users");
  return response.data.data;
};

export const getUser = async (id: number): Promise<User> => {
  const response = await http.get(`/users/${id}`);
  return response.data.data;
};

export const createUser = async (
  data: CreateUserInput
): Promise<User> => {
  const response = await http.post("/users", data);
  return response.data.data;
};

export const updateUser = async (
  id: number,
  data: UpdateUserInput
): Promise<User> => {
  const response = await http.put(`/users/${id}`, data);
  return response.data.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await http.delete(`/users/${id}`);
};