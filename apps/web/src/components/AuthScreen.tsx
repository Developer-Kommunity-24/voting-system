import { SignIn } from "@clerk/react";

export default function AuthScreen() {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100dvh" }}>
            <SignIn fallbackRedirectUrl={typeof window !== 'undefined' ? window.location.href : '/'} signUpFallbackRedirectUrl={typeof window !== 'undefined' ? window.location.href : '/'} />
        </div>
    );
}
