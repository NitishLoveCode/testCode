import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { microsoftLogin } from "@/api/authApi";
import { loginRequest } from "@/auth/msalConfig";

interface LoginTestProps {
  onLogin: (user: any) => void;
}

export default function LoginTest({ onLogin }: LoginTestProps) {
  const { instance, accounts } = useMsal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



    console.log("LoginTest rendered. Accounts:", accounts);
    console.log("lllllllllllllll")



  // Handle redirect response when user returns from Microsoft login
  useEffect(() => {
    const handleRedirectResponse = async () => {
      try {
        const response = await instance.handleRedirectPromise();
        
        if (response) {
          console.log("Redirect response received:", response);
          
          // Set the active account
          instance.setActiveAccount(response.account);
          
          // Call your backend with the idToken
          const res = await microsoftLogin({
            idToken: response.idToken,
          });
          
          console.log("Backend response:", res);
          
          // Store token and user
          localStorage.setItem("token", res.token);
          localStorage.setItem("user", JSON.stringify(res.user));
          
          // Trigger login callback
          onLogin(res.user);
        }
      } catch (err: any) {
        console.error("Redirect handling error:", err);
        setError(err?.errorMessage || "Authentication failed");
        setLoading(false);
      }
    };

    handleRedirectResponse();
  }, [instance, onLogin]);

  const handleMicrosoftLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      console.log("Starting Microsoft login...");
      
      // Option 1: Use popup (simpler, no redirect)
      const response = await instance.loginPopup(loginRequest);
      
      console.log("Login response:", response);
      
      // Set the active account
      instance.setActiveAccount(response.account);
      
      // Call your backend with the idToken
      const res = await microsoftLogin({
        idToken: response.idToken,
      });
      
      console.log("Backend response:", res);
      
      // Store token and user
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      
      // Trigger login callback
      onLogin(res.user);
      
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.errorMessage || err?.message || "Login failed");
      setLoading(false);
    }
  };

  const handleMicrosoftLoginRedirect = () => {
    setError(null);
    setLoading(true);
    
    console.log("Starting Microsoft redirect login...");
    
    // Option 2: Use redirect (better UX, but requires handleRedirectPromise)
    instance.loginRedirect(loginRequest).catch((err: any) => {
      console.error("Redirect error:", err);
      setError(err?.errorMessage || "Redirect failed");
      setLoading(false);
    });
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-[400px] bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
            🔐
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mt-4">
            Customer Master Portal
          </h1>

          <p className="text-slate-500 text-center mt-2 text-sm">
            Sign in using your Celebal Technologies Microsoft account to
            continue.
          </p>
        </div>

        {/* Popup Login Button (Recommended) */}
        <button
          onClick={handleMicrosoftLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-[#0078D4] hover:bg-[#106EBE] disabled:bg-slate-400 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition duration-300 mb-3"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
            alt="Microsoft"
            className="w-5 h-5 bg-white rounded-sm p-[2px]"
          />
          {loading ? "Signing in..." : "Sign in with Popup"}
        </button>

        {/* Redirect Login Button (Alternative) */}
        <button
          onClick={handleMicrosoftLoginRedirect}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition duration-300"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
            alt="Microsoft"
            className="w-5 h-5 bg-white rounded-sm p-[2px]"
          />
          {loading ? "Redirecting..." : "Sign in with Redirect"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {accounts.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-600 text-center">
              Logged in as: {accounts[0].username}
            </p>
          </div>
        )}

        <p className="text-xs text-center text-slate-400 mt-6">
          © 2026 Celebal Technologies Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}
