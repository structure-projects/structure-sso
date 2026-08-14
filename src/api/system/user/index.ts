import {client} from '@structure-projects/gateway-client';
import { UserInfo } from "./types";

export async function getUserInfoApi(): Promise<{ data: UserInfo }> {
  const response = await client.request({
    url: "/user/api/users/current",
    method: "get"
  });
  return { data: response.data as UserInfo };
}