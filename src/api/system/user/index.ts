import request from "@/utils/request";
import { AxiosPromise } from "axios";
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
export function getUserInfoApi(): AxiosPromise<UserInfo> {
  return request({
    url: "/api/user/profile",
    method: "get"
  });
}

export function getUserDetailApi(): AxiosPromise<UserDetail> {
  return request({
    url: "/api/users/currentUserDetail",
    method: "get"
  });
}

export function changeCurrent(data: UserDetail) {
  return request({
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
export function getUserPage(
  queryParams?: PageQuery<UserQuery>
): AxiosPromise<UserPageResult> {
  return request({
    url: "/api/users/list/" + queryParams?.page + "/" + queryParams?.pageSize,
    method: "get",
    params: queryParams?.params
  });
}
/**
 * 获取用户详情
 *
 * @param id
 */
export function getUserById(id: number): AxiosPromise<UserDetail> {
  return request({
    url: "/api/users/get/" + id,
    method: "get"
  });
}

/**
 * 启用用户
 *
 * @param id
 */
export function enableUser(id: number) {
  return request({
    url: "/api/users/enable/" + id,
    method: "put"
  });
}

/**
 * 停用用户
 *
 * @param id
 */
export function disableUser(id: number) {
  return request({
    url: "/api/users/disable/" + id,
    method: "put"
  });
}

/**
 * 锁定用户
 *
 * @param id
 */
export function lockUser(id: number) {
  return request({
    url: "/api/users/lock/" + id,
    method: "put"
  });
}

/**
 * 解锁用户
 *
 * @param id
 */
export function unlockUser(id: number) {
  return request({
    url: "/api/users/unlock/" + id,
    method: "put"
  });
}

/**
 * 添加用户
 *
 * @param data
 */
export function addUser(data: UserForm) {
  return request({
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
export function updateUser(id: number, data: UserForm) {
  return request({
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
export function deleteUser(ids: string) {
  return request({
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
export function updateUserPassword(id: number, password: string) {
  return request({
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
export function assigningRole(roleIds: number[], userId: number) {
  return request({
    url: "/api/users/assigningRole",
    method: "put",
    data: {
      roleIds: roleIds,
      userId: userId
    }
  });
}
