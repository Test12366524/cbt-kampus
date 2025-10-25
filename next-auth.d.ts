import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      token: string;
      roles: {
        id: number;
        name: string;
      }[];
    } & DefaultSession["user"];
  }

  interface User {
    id: number;
    token: string;
    roles: {
      id: number;
      name: string;
    }[];
  }
}