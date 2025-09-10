import { PublicClientApplication } from "@azure/msal-browser";

// MSAL Configuration
const msalConfig = {
  auth: {
    clientId: "882b0135-bd0b-4ce6-8bef-c4f66ad3d0cc", // Replace with your Azure AD App's Client ID
    authority:
      "https://login.microsoftonline.com/534253fc-dfb6-462f-b5ca-cbe81939f5ee", // Replace with your Azure AD Tenant ID
    redirectUri: "http://localhost:3000/", // Replace with your redirect URI
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (!containsPii) console.log(`[MSAL] ${message}`);
      },
      logLevel: 2, // Error = 0, Info = 2, Verbose = 3
    },
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

// Function to clear all authentication state
export const clearAllAuthState = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("userData");

    // Clear MSAL cache
    if (msalInstance) {
      msalInstance.clearCache();
    }
  } catch (error) {
    console.error("Error clearing auth state:", error);
  }
};

// Initialize MSAL instance
export const initializeMsal = async () => {
  try {
    await msalInstance.initialize();
    return true;
  } catch (error) {
    console.error("MSAL initialization error:", error);
    return false;
  }
};
