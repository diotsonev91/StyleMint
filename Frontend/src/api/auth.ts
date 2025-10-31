import API from "./config";

// ==================== Interfaces ====================

export interface AuthResponse {
  token: string; // This is just a message like "Login successful"
}

export interface UserDTO {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

// ==================== API Functions ====================

/**
 * Register a new user
 * Backend returns UserDTO, cookies are NOT set (user must login after registration)
 */
export async function register(
  email: string,
  password: string,
  displayName: string
): Promise<UserDTO> {
  const res = await API.post<UserDTO>("/auth/register", {
    email,
    password,
    displayName,
  });
  return res.data;
}

/**
 * Login user
 * Backend sets HttpOnly cookies (SM_ACCESS and SM_REFRESH)
 * No need to manually handle tokens - browser automatically sends cookies
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await API.post<AuthResponse>(
    "/auth/login",
    { email, password },
    { withCredentials: true } // CRITICAL: This allows cookies to be set
  );
  return res.data;
}

/**
 * Refresh access token using refresh token cookie
 * Backend reads SM_REFRESH cookie and returns new SM_ACCESS cookie
 */
export async function refreshToken(): Promise<AuthResponse> {
  const res = await API.post<AuthResponse>(
    "/auth/refresh",
    {},
    { withCredentials: true } // CRITICAL: Sends cookies with request
  );
  return res.data;
}

/**
 * Logout user
 * Backend clears both SM_ACCESS and SM_REFRESH cookies
 */
export async function logout(): Promise<AuthResponse> {
  const res = await API.post<AuthResponse>(
    "/auth/logout",
    {},
    { withCredentials: true } // CRITICAL: Sends cookies with request
  );
  return res.data;
}

/**
 * Get current authenticated user
 * Returns user data if authenticated, throws 401 if not
 */
export async function getCurrentUser(): Promise<UserDTO> {
  const res = await API.get<UserDTO>("/auth/me", { withCredentials: true });
  return res.data;
}

/**
 * Check if user is authenticated
 * Since tokens are in HttpOnly cookies, we can't access them from JavaScript
 * This function attempts to call the /auth/me endpoint to verify authentication
 */
export async function checkAuth(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    return false;
  }
}