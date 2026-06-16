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
          console.log("ID Token:", response.idToken);
          console.log("Account email:", response.account.username);
          
          setLoading(true);
          
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
        console.error("Error response:", err.response);
        
        // Extract backend error message
        let errorMessage = "Authentication failed";
        
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response?.status === 403) {
          errorMessage = "Access denied. Your account may not be authorized. Please contact the administrator.";
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
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
      console.log("ID Token:", response.idToken);
      console.log("Account email:", response.account.username);
      
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
      console.error("Error response:", err.response);
      
      // Extract backend error message
      let errorMessage = "Login failed";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 403) {
        errorMessage = "Access denied. Your account may not be authorized. Please contact the administrator.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
          <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-red-500 text-lg">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700 mb-1">Authentication Error</p>
                <p className="text-sm text-red-600">{error}</p>
                {error.includes("403") || error.includes("Access denied") || error.includes("not be authorized") ? (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    <p className="font-semibold mb-1">💡 Common causes:</p>
                    <ul className="list-disc ml-4 space-y-0.5">
                      <li>Your email is not registered in the system</li>
                      <li>Your account needs to be activated by an administrator</li>
                      <li>You need to be added to the authorized users list</li>
                    </ul>
                    <p className="mt-2">Check the browser console (F12) for more details including your email address.</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {accounts.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-700 mb-1">
              Microsoft Account Detected:
            </p>
            <p className="text-xs text-blue-600">
              {accounts[0].username}
            </p>
            <p className="text-xs text-blue-500 mt-1">
              {accounts[0].name || "No name available"}
            </p>
          </div>
        )}

        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-xs text-slate-600 text-center">
            <span className="font-semibold">Having issues?</span> Open browser console (F12) to see detailed logs
          </p>
        </div>

        <p className="text-xs text-center text-slate-400 mt-6">
          © 2026 Celebal Technologies Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}
