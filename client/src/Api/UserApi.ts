import BaseApi from "./BaseApi";
import { RoleAttributes, ClientUser } from "@shared/models"

namespace UserApi {
  export async function login(username: string, password: string) {
    return BaseApi.POST("/user/login", null, { username, password }).then(async res => {
      if (!res.ok) {
        throw new Error((await res.json()).message || res.statusText);
      }

      return res.json() as Promise<{
        user: ClientUser;
        token: string;
      }>;
    }).then(data => {
      BaseApi.setUser(data);
      return data;
    });
  }

  export async function register(username: string, password: string) {
    return BaseApi.POST("/user/register", null, { username, password }).then(async res => {
      if (!res.ok) {
        throw new Error((await res.json()).message || res.statusText);
      }

      return res.json() as Promise<{
        user: ClientUser;
        token: string;
      }>;
    }).then(data => {
      BaseApi.setUser(data);
      return data;
    });
  }

  /**
   * Must be an admin to use this function.
   * 
   * Returns a list of users.
   */
  export async function getUsers() {
    return BaseApi.GET("/user").then(async res => {
      if (!res.ok) {
        throw new Error((await res.json()).message || res.statusText);
      }

      return res.json() as Promise<{
        users: ClientUser[];
      }>;
    }).then(data => {
      return data.users;
    });
  }
}

export default UserApi;