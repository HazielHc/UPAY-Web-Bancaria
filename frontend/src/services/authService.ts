export const login = async (email: string, password: string) => {

    const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    localStorage.setItem("token", data.token);

    return data;
};

export const register = async (
    username: string,
    email: string,
    password: string
) => {

    const response = await fetch(
        "http://localhost:3000/register",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        }
    );

    const data = await response.json();

    if (!response.ok){
        throw new Error(data.message);
    }

    return data;
};