import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as jwt from "jsonwebtoken";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type UserPayload = {
  sub: string;
  role: string;
};
export function isAdmin(token: string, roles: string[]): boolean {
  const _token = token.split(" ")[1];
  if (!_token) {
    return false;
  }

  const decodeToken = jwt.verify(
    _token,
    process.env.JWT_SECRET!
  ) as UserPayload;

  if (!decodeToken || !decodeToken.sub) {
    return false;
  }

  if (!roles.includes(decodeToken.role)) {
    return false;
  }

  return true;
}
