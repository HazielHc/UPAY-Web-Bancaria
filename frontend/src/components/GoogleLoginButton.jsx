import { GoogleLogin } from "@react-oauth/google";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

export function GoogleLoginButton() {
    const { loginWithGoogle } = useGoogleAuth();

    return (
        <GoogleLogin
            onSuccess={(credentialResponse) => {
                const credential = credentialResponse.credential;

                console.log("Credential:", credential);

                loginWithGoogle(credential);
            }}
            onError={() => {
                console.log("Error login Google");
            }}
        />
    );
}