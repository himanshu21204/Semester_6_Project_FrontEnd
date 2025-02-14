import { jwtDecode } from "jwt-decode";
// export const getJWT = () => sessionStorage.getItem("jwt");
// export const getSession = () => sessionStorage.getItem("UserName");
// export const getSessionUser = () => sessionStorage.getItem("User");
export const getJWTFromSession = () => sessionStorage.getItem("jwt")
export const decodeJwt = (token) => {
    try {
        const decoded = jwtDecode(token); // Decodes the JWT
        // console.log("Decoded JWT:", decoded); // Properly logs the decoded object
        return JSON.stringify(decoded);
    } catch (error) {
        console.error("Error decoding JWT:", error.message); // Log error
        throw new Error("Invalid JWT Token");
    }
};
export const decodeJwtID = (token) => {
    try {
        const decoded = jwtDecode(token);
        // console.log("Decoded JWT:", decoded);
        return decoded.UserId;
    } catch (error) {
        console.error("Error decoding JWT:", error.message);
        throw new Error("Invalid JWT Token");
    }
};