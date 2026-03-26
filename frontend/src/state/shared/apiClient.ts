import { API_BASE_URL, ROUTES } from "../../config/api";
import { authStorage } from "./authStorage";

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

type ApiErrorPayload = {
  message?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const parseError = async (response: Response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const json = (await response.json()) as ApiErrorPayload;
    return json.message || `Ошибка запроса: ${response.status}`;
  }

  const text = await response.text();
  return text || `Ошибка запроса: ${response.status}`;
};

const refreshAccessToken = async () => {
  const refreshToken = authStorage.getRefreshToken();

  if (!refreshToken) {
    authStorage.clear();
    return null;
  }

  const response = await fetch(`${API_BASE_URL}${ROUTES.auth.refresh}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    authStorage.clear();
    return null;
  }

  const payload = (await response.json()) as {
    accessToken: string;
    refreshToken: string;
  };

  authStorage.saveTokens(payload);
  return payload.accessToken;
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}) => {
  const { skipAuth = false, headers, ...rest } = options;
  const requestHeaders = new Headers(headers || {});

  if (!skipAuth) {
    const accessToken = authStorage.getAccessToken();

    if (accessToken) {
      requestHeaders.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
  });

  if (!skipAuth && (response.status === 401 || response.status === 403)) {
    const freshToken = await refreshAccessToken();

    if (freshToken) {
      requestHeaders.set("Authorization", `Bearer ${freshToken}`);
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...rest,
        headers: requestHeaders,
      });
    }
  }

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const toFormData = (payload: Record<string, FormDataEntryValue | undefined | null>) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  return formData;
};
