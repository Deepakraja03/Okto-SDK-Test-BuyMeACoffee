"use client";
import { SessionProvider } from "next-auth/react";
import { Hex, Hash, OktoProvider } from "@okto_web3/react-sdk";
import React from "react";
import { Session } from "next-auth";

type Env = 'staging' | 'sandbox';

const config = {
    environment: (process.env.NEXT_PUBLIC_ENVIRONMENT || 'sandbox') as Env,
    clientPrivateKey: process.env.NEXT_PUBLIC_CLIENT_PRIVATE_KEY as Hash,
    clientSWA: process.env.NEXT_PUBLIC_CLIENT_SWA as Hex,
};
 
interface AppProviderProps {
    children: React.ReactNode;
    session: Session | null;
}
function AppProvider({ children, session } : AppProviderProps) {
return (
    <SessionProvider session={session}>
    <OktoProvider config={config}>
        {children}
    </OktoProvider>
    </SessionProvider>
);
}
 
export default AppProvider;