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
    status?: "active" | "inactive";
  }
  
  export interface UpdateUserInput {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    status?: "active" | "inactive";
  }

  export interface PaginationMeta {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  }