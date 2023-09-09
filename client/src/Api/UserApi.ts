import React from "react";
import BaseApi from "./BaseApi";
import { RoleAttributes, ClientUser, RoleAttributesObject } from "@shared/models"
import { promiseUseHook } from "@ioncore/theme";

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

  export function logout(refresh = false) {
    BaseApi.setUser(null);
    if (refresh) {
      window.location.reload();
    }
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
   * Create a new role. If data is not provided, it will create a new role with default values.
   * @admin
   */
  export async function createRole(role: Partial<Omit<RoleAttributesObject, "id">> = {}) {
    return BaseApi.POST("/user/roles", null, role).then(async res => {
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
   * Update a role.
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
   * Delete a role.
   * @admin
   */
  export async function deleteRole(role: RoleAttributesObject) {
    return BaseApi.DELETE("/user/roles/" + role.id).then(async res => {
      if (!res.ok) {
        throw new Error((await res.json()).message || res.statusText);
      }
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
  export const useAvailableRoles = promiseUseHook(getAvailableRoles);

  /**
   * Get a list of a user's roles.
   * 
   * If no id is provided, it will return the current user's roles.
   */
  export async function getUserRoles(id: string = "me") {
    return BaseApi.GET(`/user/${id}/roles`).then(async res => {
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
   * Get a list of a user's permissions based on their roles.
   * 
   * If no id is provided, it will return the current user's permissions.
   */
  export async function getUserPermissions(id: string = "me") {
    return BaseApi.GET(`/user/${id}/permissions`).then(async res => {
      if (!res.ok) {
        throw new Error((await res.json()).message || res.statusText);
      }

      return res.json() as Promise<{
        permissions: string[];
      }>;
    }).then(data => {
      return data.permissions;
    });
  }

  /**
   * Check if the current user has a specific role by name.
   */
  export async function hasRole(role: RoleAttributes | RoleAttributesObject | string) {
    if (typeof role === "object") {
      role = role.name;
    }
    const roles = await getUserRoles();
    return roles.some(r => r.name === role);
  }

  /**
   * Check if the current user has a specific role.
   */
  export async function hasPermission(permission: string) {
    if (await hasRole("admin")) return true;
    const perms = await getUserPermissions();
    console.log(perms);
    
    return perms.some(r => r.toUpperCase() === permission.toUpperCase());
  }
}

export default UserApi;