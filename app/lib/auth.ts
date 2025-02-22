import { NextAuthOptions, Account, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

// Extend the Session type to include id_token
declare module "next-auth" {
  interface Session {
    id_token: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      session.id_token = typeof token.id_token === "string" ? token.id_token : "";
      return session;
    },    
    async jwt({ token, account }: { token: JWT; account?: Account | null }) {
      if (account?.id_token && typeof account.id_token === "string") {
        token.id_token = account.id_token;
      } else {
        token.id_token = "";
      }
      return token;
    }    
  },
};