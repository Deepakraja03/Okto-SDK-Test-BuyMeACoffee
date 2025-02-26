# Okto SDK V2 Integration with Next.js

This guide will walk you through the steps to integrate the Okto SDK V2 with a Next.js application. By the end of this guide, you will have a fully functional Next.js app that integrates Okto for wallet management and user operations, along with Google OAuth for authentication.

## Prerequisites

Before getting started, ensure you have the following:

- **Node.js (v18+) and npm/pnpm/yarn**: [Download Node.js](https://nodejs.org/)
- **Okto API Keys**: You need your `NEXT_PUBLIC_CLIENT_PRIVATE_KEY` and `NEXT_PUBLIC_CLIENT_SWA`. Obtain these from the [Okto Dashboard](https://dashboard.okto.xyz/).
- **Google OAuth Credentials**: Create OAuth 2.0 credentials in the [Google Cloud Console](https://console.cloud.google.com/) to get your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- **Auth Secret**: NextAuth requires a secret for signing tokens. Generate one by running:

  ```bash
  openssl rand -base64 32
  ```

## 1. Create Your Next.js App

If you already have a Next.js app, you can skip this step and proceed directly to the next step to start integrating Okto.

Let's start by creating a brand new Next.js app! Open your terminal and run these commands:

```bash
npx create-next-app@latest my-okto-app
cd my-okto-app
```

## 2. Install Dependencies

Your Next.js app needs the Okto SDK and NextAuth to work. Let's install them! Run the command below for the package manager of your choice:

```bash
npm install @okto_web3/react-sdk@latest next-auth
```

## 3. Set Up Environment Variables

Create a `.env` file in your project root and add the following environment variables:

```env
NEXT_PUBLIC_CLIENT_PRIVATE_KEY=YOUR_OKTO_CLIENT_PRIVATE_KEY
NEXT_PUBLIC_CLIENT_SWA=YOUR_OKTO_CLIENT_SWA
NEXT_PUBLIC_ENVIRONMENT=sandbox # or production

AUTH_SECRET=YOUR_AUTH_SECRET # Generate using: openssl rand -base64 32

# Google OAuth credentials (Required only if using Google Sign-In)
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

## 4. Set Up the Okto Provider

Create a provider component to initialize the Okto SDK and authentication context. Create a file at `app/components/providers.tsx` with the following code:

```tsx
"use client";
import { SessionProvider } from "next-auth/react";
import { Hex, Hash, OktoProvider } from "@okto_web3/react-sdk";
import React from "react";

function AppProvider({ children, session }) {
    return (
        <SessionProvider session={session}>
            <OktoProvider
                config={{
                    environment: "sandbox",
                    clientPrivateKey: process.env.NEXT_PUBLIC_CLIENT_PRIVATE_KEY as Hash,
                    clientSWA: process.env.NEXT_PUBLIC_CLIENT_SWA as Hex,
                }}
            >
                {children}
            </OktoProvider>
        </SessionProvider>
    );
}

export default AppProvider;
```

## 5. Configure Google Authentication

Set up NextAuth using Google as the provider. Create the file at `app/api/auth/[...nextauth]/route.ts`:

```ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({ // Configure Google Provider
      clientId: process.env.GOOGLE_CLIENT_ID!, // From .env
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!, // From .env
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account) {
        token.id_token = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      //@ts-ignore
      session.id_token = token.id_token;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

## 6. Set Up Root Layout

Update your root layout to include the `AppProvider` so that the authentication and Okto context are available throughout your app. Modify `app/layout.tsx` as follows:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppProvider from "./components/providers";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Okto React SDK with Google Auth",
  description: "Next.js app integrated with Okto SDK and Google Authentication",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider session={session}>{children}</AppProvider>
      </body>
    </html>
  );
}
```

## 7. Create a Sample Login Page (`page.tsx`)

Let's build a simple page to test out authentication and basic Okto operations. You will create two components—`LoginButton` and `GetButton`—and update your home page.

### a. Create the Login Button Component

This component will trigger Google authentication. Create the file `app/components/LoginButton.tsx`:

```tsx
"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export function LoginButton() {
    const { data: session } = useSession(); // Get session data

    const handleLogin = () => {
        signIn("google");   // Trigger Google sign-in
    };

    return (
        <button
            className={`border border-transparent rounded px-4 py-2 transition-colors ${
                session
                ? "bg-blue-500 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-700 text-white"
            }`}
            onClick={handleLogin}
        >
            Authenticate
        </button>
    );
}
```

### b. Create the Get Button Component

This component is designed to call a function (such as logging out or fetching account details) and display the result in a modal.

Create the file `app/components/GetButton.tsx`:

```tsx
"use client";
import React, { useState } from "react";
import { useOkto } from "@okto_web3/react-sdk";

interface GetButtonProps {
    title: string;
    apiFn: any;
}

const GetButton: React.FC<GetButtonProps> = ({ title, apiFn }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [resultData, setResultData] = useState("");
    const oktoClient = useOkto();

    const handleButtonClick = () => {
        apiFn(oktoClient)
        .then((result: any) => {
            console.log(`${title}:`, result);
            const resultData = JSON.stringify(result, null, 2);
            setResultData(resultData !== "null" ? resultData : "No result");
            setModalVisible(true);
        })
        .catch((error: any) => {
            console.error(`${title} error:`, error);
            setResultData(`error: ${error}`);
            setModalVisible(true);
        });
    };

    const handleClose = () => setModalVisible(false);

    return (
        <div className="text-center text-white">
            <button
                className="px-4 py-2 w-full bg-blue-500 text-white rounded"
                onClick={handleButtonClick}
            >
                {title}
            </button>

            {modalVisible && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-black rounded-lg w-11/12 max-w-2xl p-6">
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                            <h2 className="text-lg font-semibold">{title} Result</h2>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={handleClose}
                            >
                                ×
                            </button>
                        </div>
                        <div className="text-left text-white max-h-96 overflow-y-auto">
                            <pre className="whitespace-pre-wrap break-words text-white">
                                {resultData}
                            </pre>
                        </div>
                        <div className="mt-4 text-right">
                            <button
                                className="px-4 py-2 bg-gray-500 text-white rounded"
                                onClick={handleClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GetButton;
```

### c. Update the App Home Page

Integrate both buttons on your home page.

Replace the content of `app/page.tsx` with:

```tsx
"use client";
import React, { useEffect, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { LoginButton } from "@/app/components/LoginButton";
import GetButton from "@/app/components/GetButton";
import { getAccount, useOkto } from '@okto_web3/react-sdk';

export default function Home() {
    const { data: session } = useSession();
    const oktoClient = useOkto();

    //@ts-ignore
    const idToken = useMemo(() => (session ? session.id_token : null), [session]);

    async function handleAuthenticate(): Promise<any> {
        if (!idToken) {
            return { result: false, error: "No google login" };
        }
        const user = await oktoClient.loginUsingOAuth({
            idToken: idToken,
            provider: 'google',
        });
        console.log("Authentication Success", user);
        return JSON.stringify(user);
    }

    async function handleLogout() {
        try {
            signOut();
            return { result: "logout success" };
        } catch (error:any) {
            return { result: "logout failed" };
        }
    }

    useEffect(()=>{
        if(idToken){
            handleAuthenticate();
        }
    }, [idToken])

    return (
        <main className="flex min-h-screen flex-col items-center space-y-6 p-12 bg-violet-200">
            <div className="text-black font-bold text-3xl mb-8">Template App</div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-lg mt-8">
                <LoginButton />
                <GetButton title="Okto Log out" apiFn={handleLogout} />
                <GetButton title="getAccount" apiFn={getAccount} />
            </div>
        </main>
    );
}
```

## 8. Run Your dApp

It's time to see your work in action. Inside the `my-okto-app` directory, run the appropriate command based on your package manager:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`. You should see your "Template App" with buttons to:

- Authenticate using Google.
- Log out.
- Retrieve your account details with the `getAccount` function.

## Trying Out a User Operation

Let's implement a token transfer on Base Testnet Sepolia to understand how user operations work in Okto.

### 1. Get Your Wallet Address

```ts
import { getAccount } from "@okto_web3/react-sdk";

const accounts = await getAccount(oktoClient);
const polygonAccount = accounts.data.find(
    account => account.network_name === "BASE_TESTNET"
);
console.log("Your Polygon Amoy address:", polygonAccount.address);
```

### 2. Fund Your Wallet

Before transferring tokens, fund your wallet using the [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia).

### 3. Review Network Information

Consult the [Network Information Guide](https://docs.okto.xyz/) to ensure you have the correct CAIP-2 chain identifiers.

### 4. Implement Token Transfer

Create a new component called `TokenTransfer.tsx` to handle a token transfer:

```tsx
"use client";

import { useOkto } from "@okto_web3/react-sdk";
import { tokenTransfer } from "@okto_web3/react-sdk/abstracted";
import { useState } from "react";

export function TokenTransfer() {
    const oktoClient = useOkto();
    const [status, setStatus] = useState("");

    async function handleTransfer() {
        try {
            const transferParams = {
                amount: BigInt("1000000000000000000"), // 1 Base Sepolia (18 decimals)
                recipient: "RECIPIENT_ADDRESS",
                token: "", // Empty string for native token
                caip2Id: "eip155:80002" // Base Sepolia Testnet chain ID
            };
            const userOp = await tokenTransfer(oktoClient, transferParams);
            setStatus(`Transfer userop created! Result: ${userOp}`);

            //sign the userop
            const signedUserop = await oktoClient.signUserop(userOp);

            //execute the userop
            const txHash = await oktoClient.executeUserop(signedUserop);

            setStatus(`Transfer executed! Result: ${txHash}`);
        } catch (error) {
            console.error("Transfer failed:", error);
            setStatus(`Transfer failed: ${error.message}`);
        }
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Token Transfer</h2>
            <button 
                onClick={handleTransfer}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Send 1 BASE
            </button>
            <p className="mt-4 text-gray-600">{status}</p>
        </div>
    );
}
```

### 5. Add the Component to Your Home Page

Update your `app/page.tsx` to include the new `TokenTransfer` component:

```tsx
// Add to your imports
import { TokenTransfer } from "@/app/components/TokenTransfer";

// Add inside your grid div
    <div className="col-span-2">
        <TokenTransfer />
    </div>
```

### 6. Test the Token Transfer

1. Run your dApp, open `http://localhost:3000`, and sign in with Google.
2. Then, navigate to the page where your `Token Transfer` component is displayed and click on the `Send 1 BASE` button.
3. A modal will appear showing the transfer status (e.g., "Transfer executed! Result: …").

### 7. Verify The Transfer

Once complete, verify its success by:

- Checking your updated balance using the `getPortfolio` method.
- Viewing the transaction details on the [Base Sepolia Explorer](https://sepolia.basescan.org/).

## Congratulations!

You have successfully integrated the Okto SDK with your Next.js app and executed your first user operation.

---
