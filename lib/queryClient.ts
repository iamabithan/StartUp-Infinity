import { useAuth } from "../client/src/context/auth-context";

export async function apiRequest(
  method: string,
  path: string,
  data?: any,
  options?: RequestInit
): Promise<Response> {
  const { user } = useAuth();
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  
  const headers = new Headers(options?.headers);
  headers.set('Content-Type', 'application/json');
  
  if (user?.token) {
    headers.set('Authorization', `Bearer ${user.token}`);
  }

  // Add user ID to GET requests that require it
  let finalPath = path;
  if (method === 'GET' && path.includes('${user.id}') && user?.id) {
    finalPath = path.replace('${user.id}', user.id);
  }

  const response = await fetch(`${baseUrl}${finalPath}`, {
    ...options,
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response;
}
