"use client";
import { SessionProvider } from "next-auth/react";
import { Hex, Hash, OktoProvider, OktoClientConfig } from "@okto_web3/react-sdk";
import React from "react";
import { Session } from "next-auth";
 
const config = {
    environment: (process.env.NEXT_PUBLIC_ENVIRONMENT || 'sandbox') as OktoClientConfig["environment"],
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