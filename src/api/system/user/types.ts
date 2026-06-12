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