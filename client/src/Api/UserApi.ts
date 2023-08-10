import React from "react";
import BaseApi from "./BaseApi";
import { RoleAttributes, ClientUser, RoleAttributesObject } from "@shared/models"

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
   * 
   * Returns a list of users.
   * @admin
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

  /**
   * @admin
   */
  export async function updateUser(user: ClientUser) {
    return BaseApi.PUT("/user/" + user.id, null, user).then(async res => {
      if (!res.ok) {
        throw new Error((await res.json()).message || res.statusText);
      }

      return res.json() as Promise<{
        user: ClientUser;
      }>;
    }).then(data => {
      return data.user;
    });
  }

  /**
   * @admin
   */
  export async function updateRole(role: RoleAttributesObject) {
    return BaseApi.PUT("/user/roles/" + role.id, null, role).then(async res => {
      if (!res.ok) {
        throw new Error((await res.json()).message || res.statusText);
      }

      return res.json() as Promise<{
        role: RoleAttributesObject;
      }>;
    }).then(data => {
      return data.role;
    });
  }

  /**
   * Get a list of available roles.
   * @admin
   */
  export async function getAvailableRoles() {
    return BaseApi.GET("/user/roles").then(async res => {
      if (!res.ok) {
        throw new Error((await res.json()).message || res.statusText);
      }

      return res.json() as Promise<{
        roles: RoleAttributesObject[];
      }>;
    }).then(data => {
      return data.roles;
    });
  }

  /**
   * React hook for getting a list of available roles.
   * @admin
   */
  export function useRoles() {
    const [roles, setRoles] = React.useState<RoleAttributesObject[] | null>(null);

    React.useEffect(() => {
      getAvailableRoles().then(setRoles);
    });

    return roles;
  }
}

export default UserApi;