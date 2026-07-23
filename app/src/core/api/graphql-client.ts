import { GraphQLClient } from "graphql-request";

function getApiUrl(): string {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("api_url");
    if (stored) return stored;
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/graphql";
}

function createClient(token?: string): GraphQLClient {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return new GraphQLClient(getApiUrl(), { headers });
}

let _token: string | null = null;

export function setAccessToken(token: string | null) {
  _token = token;
}

export function getAccessToken(): string | null {
  return _token;
}

export function gqlClient(): GraphQLClient {
  return createClient(_token ?? undefined);
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const query = `mutation ($refreshToken: String!) {
      refreshToken(refreshToken: $refreshToken) {
        accessToken
        refreshToken
      }
    }`;
    const client = createClient();
    const data = await client.request<{
      refreshToken: { accessToken: string; refreshToken: string };
    }>(query, { refreshToken });
    return data.refreshToken;
  } catch {
    return null;
  }
}
