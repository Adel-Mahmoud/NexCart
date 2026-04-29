export const authService = {
    setSession(token: string, user: any) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
  
    getUser() {
      return JSON.parse(localStorage.getItem("user") || "null");
    },
  
    getToken() {
      return localStorage.getItem("token");
    },
  
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };