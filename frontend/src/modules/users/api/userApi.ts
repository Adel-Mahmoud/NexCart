import http from "../../../shared/services/http";
import { User, CreateUserInput, UpdateUserInput, PaginationMeta } from "../types/user.types";

export const getUsers = async (page = 1, search = "", status = "all"): Promise<{ data: User[]; meta: PaginationMeta }> => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: "2",
    ...(search && { search }),
    ...(status !== "all" && { status }),
  });
  
  const response = await http.get(`/users?${params}`);
  
  return {
    data: response.data.data,
    meta: response.data.meta 
  };
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