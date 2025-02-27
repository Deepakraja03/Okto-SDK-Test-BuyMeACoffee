declare module "next-auth" {
  interface Session {
    id_token: string; // add the id_token property
  }
}