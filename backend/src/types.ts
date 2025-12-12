import { Request } from "express";

export interface UserPayload {
  userId: string;
  phone: string;
}

export interface RequestWithUser extends Request {
  user: UserPayload;
}
