export const debugToken = (token: string): void => {
  console.log("=== TOKEN DEBUG ===");
  console.log("Token:", token ? `${token.substring(0, 50)}...` : "null");
  console.log("Is valid JWT:", isValidJWT(token));
  console.log("Is expired:", isTokenExpired(token));
  if (token) {
    const payload = getTokenPayload(token);
    console.log("Token payload:", payload);
    if (payload?.exp) {
      const expDate = new Date(payload.exp * 1000);
      console.log("Expires at:", expDate.toISOString());
      console.log(
        "Time until expiry:",
        Math.round((payload.exp * 1000 - Date.now()) / 1000 / 60),
        "minutes"
      );
    }
  }
  console.log("===================");
};

// Utility functions for JWT token handling
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If we can't parse the token, consider it expired
  }
};

export const getTokenPayload = (token: string): any => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (error) {
    return null;
  }
};

export const isValidJWT = (token: string): boolean => {
  try {
    const parts = token.split(".");
    return parts.length === 3 && parts.every((part) => part.length > 0);
  } catch (error) {
    return false;
  }
};
