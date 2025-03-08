// src/app/types/auth.types.ts
export interface User {
    _id: string;
    username: string;
    email: string;
    fullName: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    data?: {
      user?: User;
      accessToken?: string;
      refreshToken?: string;
    };
    message: string;
  }
  
  export interface LoginCredentials {
    email?: string;
    username?: string;
    password: string;
  }
  
  export interface RegisterCredentials {
    username: string;
    email: string;
    fullName: string;
    password: string;
  }