// import request from "@/utils/request";

import {client} from '@structure-projects/gateway-client';
import {
  UserInfo,
  UserDetail,
  UserQuery,
  UserPageVO,
  UserForm,
  UserPageResult,
  PageQuery
} from "./types";

/**
 * 登录成功后获取用户信息（昵称、头像、权限集合和角色集合）
 */
export async function getUserInfoApi(): Promise<{ data: UserInfo }> {
  const response = await client.request({
    url: "/api/user/profile",
    method: "get"
  });
  return { data: response.data as UserInfo };
}

export async function getUserDetailApi(): Promise<{ data: UserDetail }> {
  const response = await client.request({
    url: "/api/users/currentUserDetail",
    method: "get"
  });
  return { data: response.data as UserDetail };
}

export async function changeCurrent(data: UserDetail): Promise<void> {
  await client.request({
    url: "/api/users/changeCurrent",
    method: "put",
    data: data
  });
}

/**
 * 获取用户分页数据
 *
 * @param queryParams
 */
export async function getUserPage(
  queryParams?: PageQuery<UserQuery>
): Promise<{ data: UserPageResult }> {
  const response = await client.request({
    url: "/api/users/list/" + queryParams?.page + "/" + queryParams?.pageSize,
    method: "get",
    params: queryParams?.params
  });
  return { data: response.data as UserPageResult };
}
/**
 * 获取用户详情
 *
 * @param id
 */
export async function getUserById(id: number): Promise<{ data: UserDetail }> {
  const response = await client.request({
    url: "/api/users/get/" + id,
    method: "get"
  });
  return { data: response.data as UserDetail };
}

/**
 * 启用用户
 *
 * @param id
 */
export async function enableUser(id: number): Promise<void> {
  await client.request({
    url: "/api/users/enable/" + id,
    method: "put"
  });
}

/**
 * 停用用户
 *
 * @param id
 */
export async function disableUser(id: number): Promise<void> {
  await client.request({
    url: "/api/users/disable/" + id,
    method: "put"
  });
}

/**
 * 锁定用户
 *
 * @param id
 */
export async function lockUser(id: number): Promise<void> {
  await client.request({
    url: "/api/users/lock/" + id,
    method: "put"
  });
}

/**
 * 解锁用户
 *
 * @param id
 */
export async function unlockUser(id: number): Promise<void> {
  await client.request({
    url: "/api/users/unlock/" + id,
    method: "put"
  });
}

/**
 * 添加用户
 *
 * @param data
 */
export async function addUser(data: UserForm): Promise<void> {
  await client.request({
    url: "/api/users",
    method: "post",
    data: data
  });
}

/**
 * 更新用户
 *
 * @param id
 * @param data
 */
export async function updateUser(id: number, data: UserForm): Promise<void> {
  await client.request({
    url: "/api/users/" + id,
    method: "put",
    data: data
  });
}

/**
 * 批量删除用户，多个以英文逗号(,)分割
 *
 * @param ids
 */
export async function deleteUser(ids: string): Promise<void> {
  await client.request({
    url: "/api/users/" + ids,
    method: "delete"
  });
}

/**
 * 修改用户密码
 *
 * @param id
 * @param password
 */
export async function updateUserPassword(id: number, password: string): Promise<void> {
  await client.request({
    url: "/api/users/resetPassword",
    method: "put",
    data: {
      userId: id,
      password: password
    }
  });
}

/**
 * 分配角色
 *
 * @param roleIds 角色ID集合
 * @param userId 用户ID
 */
export async function assigningRole(roleIds: number[], userId: number): Promise<void> {
  await client.request({
    url: "/api/users/assigningRole",
    method: "put",
    data: {
      roleIds: roleIds,
      userId: userId
    }
  });
}
