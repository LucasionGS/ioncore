import { ClientUser, RoleAttributes, UserAttributes } from "@shared/models"


namespace BaseApi {
  const baseUrl = `${window.location.protocol}//${window.location.host}/api`;
  const __user = window.localStorage.getItem("user");
  let user: ClientUser | null = __user ? JSON.parse(__user) : null;
  let token: string | null = window.localStorage.getItem("user_token") || null;
  export function setUser(data: { user: ClientUser, token: string } | null) {
    if (data) {
      user = data.user;
      token = data.token;
      window.localStorage.setItem("user", JSON.stringify(user));
      window.localStorage.setItem("user_token", token);
    } else {
      user = null;
      token = null;
      window.localStorage.removeItem("user");
      window.localStorage.removeItem("user_token");
    }
  }

  export function getUser() {
    return user;
  }

  export function getToken() {
    return token;
  }

  export function getHeaders() {
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
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
        ...getHeaders(),
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

  const isDeepEqual = (object1: Record<any, any>, object2: Record<any, any>) => {

    const objKeys1 = Object.keys(object1);
    const objKeys2 = Object.keys(object2);

    if (objKeys1.length !== objKeys2.length) return false;

    for (var key of objKeys1) {
      const value1 = object1[key];
      const value2 = object2[key];

      const isObjects = isObject(value1) && isObject(value2);

      if ((isObjects && !isDeepEqual(value1, value2)) ||
        (!isObjects && value1 !== value2)
      ) {
        return false;
      }
    }
    return true;
  };

  const isObject = (object: any) => {
    return object != null && typeof object === "object";
  };

  // Refresh the user data
  export async function refreshUser() {
    if (!user) {
      return;
    }
    const res = await GET("/user/me");
    if (res.ok) {
      const { user: newUser, token } = await res.json();

      const oldImportant = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        roles: user.roles,
      }
      const newImportant = {
        id: newUser.id,
        username: newUser.username,
        isAdmin: newUser.isAdmin,
        roles: newUser.roles,
      }

      // Check if the user has changed, if not, don't update
      if (isDeepEqual(oldImportant, newImportant)) return;

      setUser({
        user: newUser,
        token
      });
      // Refresh the page
      window.location.reload();
    } else {
      setUser(null);
    }
  }

  refreshUser();
}

export default BaseApi;