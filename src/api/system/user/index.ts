import {client} from '@structure-projects/gateway-client';
import { UserInfo } from "./types";

export async function getUserInfoApi(): Promise<{ data: UserInfo }> {
  const response = await client.request({
    url: "/api/user/profile",
    method: "get"
  });
  return { data: response.data as UserInfo };
}