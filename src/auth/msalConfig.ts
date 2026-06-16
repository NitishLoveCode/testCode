



import { PublicClientApplication } from "@azure/msal-browser";

// export const msalConfig = {
//   auth: {
//     clientId: import.meta.env.VITE_CLIENT_ID,
//     authority: `https://login.microsoftonline.com/e4e34038-ea1f-4882-b6e8-ccd776459ca0`,
//     // redirectUri: window.location.origin + "/",
//     redirectUri: "https://customer-master-frontend-c9dgemf7bse4bmaz.centralindia-01.azurewebsites.net/",
//       // "https://customer-master-frontend-c9dgemf7bse4bmaz.centralindia-01.azurewebsites.net/",
   
//   },

//   cache: {
//     cacheLocation: "localStorage",
//   },
// };


export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}`,
   redirectUri: "https://customer-master-frontend-c9dgemf7bse4bmaz.centralindia-01.azurewebsites.net/",
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "localStorage",
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
};

export const msalInstance = new PublicClientApplication(msalConfig);




// import { PublicClientApplication } from "@azure/msal-browser";

// export const msalConfig = {
//   auth: {
//     clientId: import.meta.env.VITE_CLIENT_ID,
//     authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}`,
//     redirectUri:  "https://customer-master-frontend-c9dgemf7bse4bmaz.centralindia-01.azurewebsites.net/",
//   },
//   cache: {
//     cacheLocation: "localStorage",
//   },
// };

// export const loginRequest = {
//   scopes: ["User.Read"],
// };

// export const msalInstance = new PublicClientApplication(msalConfig);

// // initialize MSAL
// // await msalInstance.initialize();