// App:

// Calls API
// Stores token
// Moves to dashboard

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import NewCustomer from "@/pages/NewCustomer";
import Approvals from "@/pages/Approvals";
import CustomerList from "@/pages/CustomerList";
import Settings from "@/pages/Settings";
import Users from "@/pages/Users";
import NewVendor from "./pages/NewVendor";
import Rejected from "./pages/Rejected";
// import { loginUser } from "./api";
import Login from "./pages/Login";

export type Page =
  | "dashboard"
  | "new-customer"
  | "new-vendor"
  | "new"
  | "approvals"
  | "rejected"
  | "list"
  | "settings"
  | "users";

const PUBLIC_PAGES: Page[] = ["new-customer", "new-vendor"];

function getPageFromHash(): Page {
  const hash = window.location.hash.replace("#", "").trim();
  const validPages: Page[] = [
    "dashboard",
    "new-customer",
    "new-vendor",
    "new",
    "approvals",
    "rejected",
    "list",
    "settings",
    "users",
  ];
  if (validPages.includes(hash as Page)) return hash as Page;
  return "dashboard";
}

export default function App() {
  
  const [currentPage, setCurrentPage] = useState<Page>(getPageFromHash);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // Modal state for role-switch login prompt
  // const [switchModal, setSwitchModal] = useState<{
  //   targetRole: string;
  //   email: string;
  //   password: string;
  //   loading: boolean;
  //   error: string;
  // } | null>(null);

  // ── helpers ──────────────────────────────────────────────────────────────

  /** Read the per-role token cache stored in localStorage */
  // const getTokenMap = (): Record<string, { token: string; user: any }> => {
  //   try {
  //     return JSON.parse(localStorage.getItem("tokenMap") || "{}");
  //   } catch {
  //     return {};
  //   }
  // };

  /** Activate a role: swap token + user in localStorage and update state */
  // const activateRole = (role: string) => {
  //   const map = getTokenMap();
  //   const entry = map[role];
  //   if (!entry) return false;
  //   localStorage.setItem("token", entry.token);
  //   localStorage.setItem("user", JSON.stringify(entry.user));
  //   setCurrentUserRole(role);
  //   return true;
  // };

  // ── initial login ─────────────────────────────────────────────────────────

  // const handleLogin = async () => {
  //   try {
  //     const res = await loginUser(loginForm);
  //     const { token, user } = res;

  //     // Store in token map keyed by role
  //     const map = getTokenMap();
  //     map[user.role] = { token, user };
  //     localStorage.setItem("tokenMap", JSON.stringify(map));

  //     localStorage.setItem("token", token);
  //     localStorage.setItem("user", JSON.stringify(user));

  //     setCurrentUserRole(user.role);
  //     setIsLoggedIn(true);
  //   } catch (error) {
  //     alert("Login failed");
  //   }
  // };

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      const parsedUser = JSON.parse(user);
      setCurrentUserRole(parsedUser.role);
      setIsLoggedIn(true);
    }
  }, []);

  // ── role switching ────────────────────────────────────────────────────────
  // const handleRoleSwitch = (newRole: string) => {
  //   if (newRole === currentUserRole) return;

  //   // If we already have a token for this role, switch instantly
  //   if (activateRole(newRole)) {
  //     setCurrentPage("dashboard");
  //     return;
  //   }

  //   // Otherwise open the login modal for that role
  //   const emailHints: Record<string, string> = {
  //     Admin: "admin@celebaltech.com",
  //     Approver: "finance@celebaltech.com",
  //     Requestor: "sales@celebaltech.com",
  //   };
  //   setSwitchModal({
  //     targetRole: newRole,
  //     email: emailHints[newRole] ?? "",
  //     password: "",
  //     loading: false,
  //     error: "",
  //   });
  // };

  // const handleSwitchModalLogin = async () => {
  //   if (!switchModal) return;
  //   setSwitchModal((m) => m && { ...m, loading: true, error: "" });

  //   try {
  //     const res = await loginUser({
  //       email: switchModal.email,
  //       password: switchModal.password,
  //     });
  //     const { token, user } = res;

  //     // Cache this role's token
  //     const map = getTokenMap();
  //     map[user.role] = { token, user };
  //     localStorage.setItem("tokenMap", JSON.stringify(map));

  //     // Activate
  //     localStorage.setItem("token", token);
  //     localStorage.setItem("user", JSON.stringify(user));
  //     setCurrentUserRole(user.role);
  //     setCurrentPage("dashboard");
  //     setSwitchModal(null);
  //   } catch {
  //     setSwitchModal(
  //       (m) =>
  //         m && {
  //           ...m,
  //           loading: false,
  //           error: "Login failed — check credentials.",
  //         },
  //     );
  //   }
  // };

  useEffect(() => {
    window.location.hash = currentPage;
  }, [currentPage]);

  useEffect(() => {
    const handleHashChange = () => setCurrentPage(getPageFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const isPublicPage = PUBLIC_PAGES.includes(currentPage);

  // if (!isLoggedIn) {
  //   return (
  //     <div className="h-screen flex justify-center items-center bg-slate-100">
  //       <div className="bg-white p-6 rounded-xl shadow w-96 space-y-4">
  //         <h2 className="text-xl font-bold">Login</h2>

  //         <input
  //           placeholder="Email"
  //           className="border w-full p-2 rounded"
  //           onChange={(e) =>
  //             setLoginForm({
  //               ...loginForm,
  //               email: e.target.value,
  //             })
  //           }
  //         />

  //         <input
  //           type="password"
  //           placeholder="Password"
  //           className="border w-full p-2 rounded"
  //           onChange={(e) =>
  //             setLoginForm({
  //               ...loginForm,
  //               password: e.target.value,
  //             })
  //           }
  //         />

  //         <button
  //           onClick={handleLogin}
  //           className="w-full bg-blue-600 text-white p-2 rounded"
  //         >
  //           Login
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }
  if (!isLoggedIn) {
  return (
    <Login
      onLogin={(user: any) => {
        setCurrentUserRole(user.role);
        setIsLoggedIn(true);
      }}
    />
  );
}

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentUserRole={currentUserRole}
      />
      <main className="flex-1 overflow-y-auto p-8 flex flex-col">
        {/* {!isPublicPage && (
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm text-sm">
              <span className="text-slate-500">Viewing as:</span>
              <select
                value={currentUserRole}
               
                onChange={(e) => handleRoleSwitch(e.target.value)}
                className="font-medium text-blue-600 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="Admin">Admin</option>
                <option value="Approver">Approver</option>
                <option value="Requestor">Requestor</option>
              </select>
            </div>
          </div>
        )} */}

        <div className="flex-1">
         

          {currentPage === "dashboard" && <Dashboard />}
          {currentPage === "new-customer" && (
            <NewCustomer currentUserRole={currentUserRole} />
          )}
          {currentPage === "new-vendor" && (
            <NewVendor currentUserRole={currentUserRole} />
          )}
          {/* {currentPage === "approvals" && <Approvals />} */}
          {currentPage === "approvals" && (
            <Approvals currentUserRole={currentUserRole} />
          )}
          {currentPage === "rejected" && (
            <Rejected currentUserRole={currentUserRole} />
          )}
          {currentPage === "list" && <CustomerList />}
          {currentPage === "settings" && <Settings />}
          {currentPage === "users" && <Users />}
        </div>

        <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
          Build by Celebal Finance Team with Love ❤️
        </footer>
      </main>

      {/* ── Role-switch login modal ───────────────────────────────────── */}
      {/* {switchModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-96 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Sign in as{" "}
              <span className="text-blue-600">{switchModal.targetRole}</span>
            </h2>
            <p className="text-sm text-slate-500">
              A separate token is needed for this role. Enter that account's
              credentials.
            </p>

            {switchModal.error && (
              <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded px-3 py-2">
                {switchModal.error}
              </p>
            )}

            <input
              className="border w-full p-2 rounded text-sm"
              placeholder="Email"
              value={switchModal.email}
              onChange={(e) =>
                setSwitchModal((m) => m && { ...m, email: e.target.value })
              }
            />
            <input
              type="password"
              className="border w-full p-2 rounded text-sm"
              placeholder="Password"
              value={switchModal.password}
              onChange={(e) =>
                setSwitchModal((m) => m && { ...m, password: e.target.value })
              }
              onKeyDown={(e) => e.key === "Enter" && handleSwitchModalLogin()}
            />

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setSwitchModal(null)}
                className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm hover:bg-slate-50"
                disabled={switchModal.loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSwitchModalLogin}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
                disabled={switchModal.loading}
              >
                {switchModal.loading ? "Signing in…" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      )} */}

    </div>
  );
}





