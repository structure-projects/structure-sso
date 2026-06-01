export interface OptionType {
  label?: string;
  value?: string;
}

/**
 * 登录用户信息
 */
export interface UserInfo {
  userId?: number;
  username?: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  remark?: string;
  roles: string[];
  perms: string[];
}

/**
 * 用户查询对象类型
 */
export interface UserQuery {
  keywords?: string;
  enabled?: number;
  unlocked?: number;
  unexpired?: number;
}

/**
 * 用户分页对象
 */
export interface UserPageVO {
  /**
   * 用户头像地址
   */
  avatar?: string;
  /**
   * 创建时间
   */
  createTime?: Date;

  /**
   * 用户邮箱
   */
  email?: string;
  /**
   * 性别
   */
  sex?: string;
  /**
   * 用户ID
   */
  id?: number;
  /**
   * 手机号
   */
  phone?: string;
  /**
   * 用户昵称
   */
  nickname?: string;
  /**
   * 角色名称，多个使用英文逗号(,)分割
   */
  roleNames?: string;
  /**
   * 用户状态(1:启用;0:禁用)
   */
  status?: number;
  /**
   * 用户名
   */
  username?: string;

  /**
   * 操作人
   */
  operator?: string;

  /**
   * 是否启用
   */
  enabled?: boolean;

  /**
   * 是否锁定
   */
  unlocked?: boolean;

  /**
   * 是否过期
   */
  unexpired?: boolean;
}

/**
 * 用户表单类型
 */
export interface UserForm {
  /**
   * 用户头像
   */
  avatar?: string;

  /**
   * 邮箱
   */
  email?: string;

  /**
   * 用户ID
   */
  id?: number;

  /**
   * 手机号
   */
  phone?: string;
  /**
   * 昵称
   */
  nickname?: string;
  /**
   * 角色ID集合
   */
  roleIds?: number[];

  /**
   * 用户名
   */
  username?: string;

  /**
   * 性别
   */
  sex?: string;
}

export interface UserDetail {
  id?: number;
  username?: string;
  nickname?: string;
  avatar?: string;
  role?: OptionType[];
  sex?: string;
  intro?: string;
  phone?: string;
  email?: string;
}

export interface PageQuery<T = any> {
  page?: number;
  pageSize?: number;
  params?: T;
}

export interface PageResult<T = any> {
  list?: T;
  total?: number;
}

export type UserPageResult = PageResult<UserPageVO[]>;
