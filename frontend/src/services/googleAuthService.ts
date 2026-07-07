const API_URL = "http://localhost:3000/auth";

interface GoogleLoginResponse {
    message: string;
    token: string;
    user: {
        id: string;
        email: string;
        role: string;
    };
}

export async function googleLogin(
    idToken: string
): Promise<GoogleLoginResponse> {

    const response = await fetch(`${API_URL}/google`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            idToken,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
}