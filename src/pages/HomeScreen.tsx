import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";

interface HomeScreenProps {
  onLogout: () => void;
  onContinue?: () => void;
}

export default function HomeScreen({ onLogout, onContinue }: HomeScreenProps) {
  const { instance, accounts } = useMsal();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Sign out from Microsoft (optional - can be popup or redirect)
    instance.logoutPopup({
      postLogoutRedirectUri: window.location.origin,
    }).then(() => {
      onLogout();
    }).catch((error) => {
      console.error("Logout error:", error);
      // Even if Microsoft logout fails, clear local session
      onLogout();
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Welcome to Customer Master Portal! 👋
              </h1>
              <p className="text-slate-600">
                You have successfully logged in
              </p>
            </div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl shadow-lg">
              🎉
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">
                User Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Name:</span>
                  <span className="font-medium text-slate-800">
                    {user.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Email:</span>
                  <span className="font-medium text-slate-800">
                    {user.email || accounts[0]?.username || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Role:</span>
                  <span className="font-medium text-blue-600">
                    {user.role || "User"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Account Info from MSAL */}
          {accounts.length > 0 && (
            <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-100">
              <h3 className="text-sm font-semibold text-green-900 mb-3">
                Microsoft Account
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Username:</span>
                  <span className="font-medium text-slate-800">
                    {accounts[0].username}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Name:</span>
                  <span className="font-medium text-slate-800">
                    {accounts[0].name || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onContinue && (
              <button
                onClick={onContinue}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold transition duration-300 flex items-center justify-center gap-2 shadow-md"
              >
                <span>🚀</span>
                Continue to Dashboard
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-semibold transition duration-300 flex items-center justify-center gap-2 shadow-md"
            >
              <span>🚪</span>
              Logout
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            Next Steps
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              <span>Navigate to Dashboard to view your overview</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              <span>Create new customer or vendor records</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              <span>Review pending approvals</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              <span>Manage your settings and preferences</span>
            </li>
          </ul>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          © 2026 Celebal Technologies Pvt. Ltd. • All rights reserved
        </p>
      </div>
    </div>
  );
}
