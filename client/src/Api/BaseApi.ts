import { RoleAttributes, UserAttributes } from "@shared/models"


namespace BaseApi {
  const baseUrl = `${window.location.protocol}//${window.location.host}/api`;
  let user: UserAttributes | null = null;
  let token: string | null = null;
  export function setUser(data: { user: UserAttributes, token: string } | null) {
    if (data) {
      user = data.user;
      token = data.token;
    } else {
      user = null;
      token = null;
    }
  }

  export function getHeaders() {
    return {
      "Content-Type": "application/json",
    };
  }

  export type QueryType = string | number | boolean;

  /**
   * 
   * @param path Path to fetch from. Relative to the base API path (e.g. `/api`). To fetch from `/api/user`, pass "`/user`" as the path.
   * @param init Options to pass to `fetch`. Default options are passed automatically such as authentication headers.
   * @returns 
   */
  export async function fetch(path: string, init: RequestInit | null = {}): Promise<Response> {
    return await window.fetch(`${baseUrl}/${path}`, {
      ...(init || {}),
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      credentials: "include",
    });
  }

  export async function GET(path: string, init: RequestInit | null = {}, query?: Record<string, QueryType | QueryType[]>): Promise<Response> {
    if (query) {
      const queryStr = Object.entries(query).map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map((v) => `${key}=${v}`).join("&");
        } else {
          return `${key}=${value}`;
        }
      }).join("&");
      path += `?${queryStr}`;
    }
    return await fetch(path, {
      method: "GET",
      ...(init || {}),
    });
  }

  export async function POST(path: string, init: RequestInit | null = {}, jsonBody?: any): Promise<Response> {
    return await fetch(path, {
      method: "POST",
      ...(init || {}),
      body: (jsonBody ? JSON.stringify(jsonBody) : init?.body),
    });
  }

  export async function PUT(path: string, init: RequestInit | null = {}, jsonBody?: any): Promise<Response> {
    return await POST(path, {
      method: "PUT",
      ...(init || {}),
    }, jsonBody);
  }

  export async function PATCH(path: string, init: RequestInit | null = {}, jsonBody?: any): Promise<Response> {
    return await POST(path, {
      method: "PATCH",
      ...(init || {}),
    }, jsonBody);
  }

  export async function POSTFormData(path: string, init: RequestInit | null = {}, formData?: FormData): Promise<Response> {
    return await fetch(path, {
      method: "POST",
      ...(init || {}),
      body: (formData ? formData : init?.body),
    });
  }
}

export default BaseApi;