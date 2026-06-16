import { useMsal } from "@azure/msal-react";
import { microsoftLogin } from "@/api/authApi";
import { loginRequest } from "@/auth/msalConfig";

export default function Login({ onLogin }: any) {
  const { instance } = useMsal();
  console.log(instance);


  const handleMicrosoftLogin = async () => {
    try {
      console.log("STEP 1");

      /*  const response = await instance.loginPopup(loginRequest); */
      const response:any = await instance.loginRedirect(loginRequest);

      // const response = await instance.loginPopup(loginRequest);

        console.log("STEP 2 - account:", response);
        console.log("STEP 2 - account:", response.account);

      instance.setActiveAccount(response.account); // add this
      console.log("Account:", response.account);
      console.log("IdToken:", response.idToken);

      console.log("STEP 2", response);

      console.log("STEP 3", response.idToken);

      const res = await microsoftLogin({
        idToken: response.idToken,
      });

      console.log("STEP 4", res);

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      console.log("STEP 5");

      onLogin(res.user);
    } catch (err: any) {
      console.log("LOGIN ERROR", err);
      console.log("errorCode:", err?.errorCode);
      console.log("errorMessage:", err?.errorMessage);
      console.log("name:", err?.name);
    }
  };

  return (

    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-[400px] bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
            🔐
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mt-4">
            Customer Master Portal.
          </h1>

          <p className="text-slate-500 text-center mt-2 text-sm">
            Sign in using your Celebal Technologies Microsoft account to
            continue.
          </p>
        </div>

        <button
          onClick={handleMicrosoftLogin}
          className="w-full flex items-center justify-center gap-3 bg-[#0078D4] hover:bg-[#106EBE] text-white py-3 rounded-xl font-semibold transition duration-300"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
            alt="Microsoft"
            className="w-5 h-5 bg-white rounded-sm p-[2px]"
          />
          Sign in with Microsoft
        </button>

        <p className="text-xs text-center text-slate-400 mt-6">
          © 2026 Celebal Technologies Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}



// import { useMsal } from "@azure/msal-react";
// import { microsoftLogin } from "@/api/authApi";
// import { loginRequest } from "@/auth/msalConfig";
// import { useState } from "react";

// interface LoginProps {
//   onLogin: (user: any) => void;
// }

// export default function Login({ onLogin }: LoginProps) {
//   const { instance } = useMsal();
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);

//   const handleMicrosoftLogin = () => {
//     setErrorMsg(null);
//     setLoading(true);

//     console.log("STEP 1 - opening popup");

//     instance
//       .loginPopup(loginRequest)
//       .then((response) => {
//         console.log("STEP 2 - popup resolved:", response);

//         instance.setActiveAccount(response.account);

//         console.log("STEP 3 - calling backend with idToken");

//         return microsoftLogin({ idToken: response.idToken });
//       })
//       .then((res) => {
//         console.log("STEP 4 - backend response:", res);

//         localStorage.setItem("token", res.token);
//         localStorage.setItem("user", JSON.stringify(res.user));

//         console.log("STEP 5 - calling onLogin");

//         onLogin(res.user);
//       })
//       .catch((err) => {
//         console.error("LOGIN ERROR:", err);
//         console.error("name:", err?.name);
//         console.error("errorCode:", err?.errorCode);
//         console.error("errorMessage:", err?.errorMessage);

//         setErrorMsg(
//           err?.errorMessage || err?.message || "Microsoft login failed"
//         );
//       })
//       .finally(() => {
//         console.log("FINALLY - flow settled");
//         setLoading(false);
//       });
//   };

//   return (
//     <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
//       <div className="w-[400px] bg-white rounded-2xl shadow-2xl p-8">
//         <div className="flex flex-col items-center mb-6">
//           <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
//             🔐
//           </div>

//           <h1 className="text-2xl font-bold text-slate-800 mt-4">
//             Customer Master Portal
//           </h1>

//           <p className="text-slate-500 text-center mt-2 text-sm">
//             Sign in using your Celebal Technologies Microsoft account to
//             continue.
//           </p>
//         </div>

//         <button
//           onClick={handleMicrosoftLogin}
//           disabled={loading}
//           className="w-full flex items-center justify-center gap-3 bg-[#0078D4] hover:bg-[#106EBE] disabled:bg-slate-400 text-white py-3 rounded-xl font-semibold transition duration-300"
//         >
//           <img
//             src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
//             alt="Microsoft"
//             className="w-5 h-5 bg-white rounded-sm p-[2px]"
//           />
//           {loading ? "Signing in..." : "Sign in with Microsoft"}
//         </button>

//         {errorMsg && (
//           <p className="text-sm text-red-500 text-center mt-4">{errorMsg}</p>
//         )}

//         <p className="text-xs text-center text-slate-400 mt-6">
//           © 2026 Celebal Technologies Pvt. Ltd.
//         </p>
//       </div>
//     </div>
//   );
// }
