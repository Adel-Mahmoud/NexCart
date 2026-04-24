export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    status: "active" | "inactive";
  }
  
  export interface CreateUserInput {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }
  
  export interface UpdateUserInput {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    status?: "active" | "inactive";
  }