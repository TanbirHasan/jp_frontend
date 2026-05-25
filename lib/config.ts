const LOCAL_API_BASE_URL = "http://localhost:5000/api/v1";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/u, "");
}

export function getApiBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL for production build.");
  }

  return LOCAL_API_BASE_URL;
}

export function getWebSocketUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_WS_URL?.trim();

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  const apiUrl = new URL(getApiBaseUrl());
  apiUrl.protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
  apiUrl.pathname = "";
  apiUrl.search = "";
  apiUrl.hash = "";

  return trimTrailingSlash(apiUrl.toString());
}
