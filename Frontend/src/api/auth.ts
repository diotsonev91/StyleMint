import API from "./config";

export interface AuthResponse {
  token: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await API.post<AuthResponse>("/auth/login", { email, password });
  if (res.data.token) localStorage.setItem("token", res.data.token);
  return res.data;
}

export async function register(
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await API.post<AuthResponse>("/auth/register", {
    username,
    email,
    password,
  });
  return res.data;
}

export function logout(): void {
  localStorage.removeItem("token");
}
