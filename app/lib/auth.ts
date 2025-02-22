import { Account, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

// Define the NextAuth options
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account", // Ensure the user is always asked to select an account
        },
      },
    }),
  ],
  pages: {
    signIn: "/login", // Optional: Set your custom sign-in page
  },
  callbacks: {
    async session({ session, token } : { session: Session, token: JWT }) {
      // Add the token to the session
      if (token?.id_token) {
        session.id_token = token.id_token as string;
      }
      return session;
    },
    async jwt({ token, account } : { token: JWT, account: Account }) {
      // Store the id_token in the JWT when the user signs in
      if (account?.id_token) {
        token.id_token = account.id_token;
      }
      return token;
    },
  },
};