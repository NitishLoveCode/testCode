



// import { LayoutDashboard, UserPlus, CheckSquare, Users as UsersIcon, Settings, Shield, Building2, XCircle } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Page } from "@/App";

// interface SidebarProps {
//   currentPage: Page;
//   setCurrentPage: (page: Page) => void;
//   currentUserRole: string;
// }

// export default function Sidebar({ currentPage, setCurrentPage, currentUserRole }: SidebarProps) {
//   const navItems = [
//     { id: "dashboard",    label: "Dashboard",        icon: LayoutDashboard, roles: ["Admin", "Approver", "Requestor"], public: false },
//     { id: "new-customer", label: "New Customer",     icon: UserPlus,        roles: ["Admin", "Requestor"],             public: true  },
//     { id: "new-vendor",   label: "New Vendor",       icon: Building2,       roles: ["Admin", "Requestor"],             public: true  },
//     { id: "approvals",    label: "Approvals",        icon: CheckSquare,     roles: ["Admin", "Approver"],              public: false },
//     { id: "rejected",     label: "Rejected",         icon: XCircle,         roles: ["Admin", "Approver", "Requestor"], public: false },
//     { id: "list",         label: "Customer Master",  icon: UsersIcon,       roles: ["Admin", "Approver", "Requestor"], public: false },
//     { id: "users",        label: "User Management",  icon: Shield,          roles: ["Admin"],                          public: false },
//   ];

//   const visibleNavItems = navItems.filter(item => item.roles.includes(currentUserRole));

//   const getShareableUrl = (pageId: string) =>
//     `${window.location.origin}${window.location.pathname}#${pageId}`;

//   return (
//     <div className="w-64 bg-white border-r border-slate-100 flex flex-col shadow-sm">

//       {/* Logo */}
//       <div className="px-5 py-6 border-b border-slate-100">
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-blue-200">
//             N
//           </div>
//           <div>
//             <p className="font-bold text-slate-800 text-sm leading-tight">NetSuite Sync</p>
//             <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Customer Master</p>
//           </div>
//         </div>
//       </div>

//       {/* Nav label */}
//       <div className="px-5 pt-5 pb-2">
//         <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-300">Navigation</p>
//       </div>

//       {/* Nav Items */}
//       <nav className="flex-1 px-3 space-y-0.5">
//         {visibleNavItems.map((item) => {
//           const Icon = item.icon;
//           const isActive = currentPage === item.id;
//           return (
//             <div key={item.id} className="group relative">
//               <button
//                 // onClick={() => setCurrentPage(item.id as Page)}
//                 onClick={() => {
//   // ✅ CLEAR edit state when opening fresh form
//   if (item.id === "new-customer" || item.id === "new-vendor") {
//     localStorage.removeItem("editingApproval");
//   }

//   setCurrentPage(item.id as Page);
// }}
//                 className={cn(
//                   "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
//                   isActive
//                     ? item.id === "new-vendor"
//                       ? "bg-purple-600 text-white shadow-md shadow-purple-200"
//                       : item.id === "rejected"
//                         ? "bg-rose-600 text-white shadow-md shadow-rose-200"
//                         : "bg-blue-600 text-white shadow-md shadow-blue-200"
//                     : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
//                 )}
//               >
//                 <Icon className="w-4 h-4 flex-shrink-0" />
//                 <span className="flex-1 text-left">{item.label}</span>
//                 {item.public && !isActive && (
//                   <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600 leading-none">
//                     PUBLIC
//                   </span>
//                 )}
//                 {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white/60" />}
//               </button>

//               {/* Shareable URL tooltip on hover */}
//               {item.public && (
//                 <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 hidden group-hover:block">
//                   <div className="bg-slate-800 text-white text-[10px] rounded-lg px-3 py-2 shadow-xl w-52 leading-relaxed">
//                     <p className="font-semibold mb-1">🔗 Shareable Link</p>
//                     <p className="text-slate-300 break-all font-mono">{getShareableUrl(item.id)}</p>
//                     <p className="text-slate-400 mt-1">Opens without login</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </nav>

//       {/* Settings + Role pill */}
//       <div className="p-3 border-t border-slate-100 space-y-1">
//         <button
//           onClick={() => setCurrentPage("settings")}
//           className={cn(
//             "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
//             currentPage === "settings"
//               ? "bg-blue-600 text-white shadow-md shadow-blue-200"
//               : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
//           )}
//         >
//           <Settings className="w-4 h-4" />
//           Settings
//         </button>

//         <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1">
//           <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
//             {currentUserRole[0]}
//           </div>
//           <div>
//             <p className="text-xs font-semibold text-slate-700">Viewing as</p>
//             <p className="text-[11px] text-slate-400">{currentUserRole}</p>
//           </div>
//           <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
//         </div>
//       </div>
//     </div>
//   );
// }







import { LayoutDashboard, UserPlus, CheckSquare, Users as UsersIcon, Settings, Shield, Building2, XCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Page } from "@/App";

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  currentUserRole: string;
  onLogout?: () => void;
}

export default function Sidebar({ currentPage, setCurrentPage, currentUserRole, onLogout }: SidebarProps) {
  const navItems = [
    { id: "dashboard",    label: "Dashboard",        icon: LayoutDashboard, roles: ["Admin", "Approver", "Requestor"], public: false },
    { id: "new-customer", label: "New Customer",     icon: UserPlus,        roles: ["Admin", "Requestor"],             public: true  },
    { id: "new-vendor",   label: "New Vendor",       icon: Building2,       roles: ["Admin", "Requestor"],             public: true  },
    { id: "approvals",    label: "Approvals",        icon: CheckSquare,     roles: ["Admin", "Approver"],              public: false }, // Requestor excluded intentionally
    { id: "rejected",     label: "Rejected",         icon: XCircle,         roles: ["Admin", "Approver", "Requestor"], public: false },
    { id: "list",         label: "Customer Master",  icon: UsersIcon,       roles: ["Admin", "Approver"],              public: false },
    { id: "users",        label: "User Management",  icon: Shield,          roles: ["Admin"],                          public: false },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(currentUserRole));

  const getShareableUrl = (pageId: string) =>
    `${window.location.origin}${window.location.pathname}#${pageId}`;

  return (
    <div className="w-64 bg-white border-r border-slate-100 flex flex-col shadow-sm">

      {/* Logo */}
      <div className="px-5 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-blue-200">
            N
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">NetSuite Sync</p>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Customer Master</p>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-300">Navigation</p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <div key={item.id} className="group relative">
              <button
                // onClick={() => setCurrentPage(item.id as Page)}
                onClick={() => {
  // ✅ CLEAR edit state when opening fresh form
  if (item.id === "new-customer" || item.id === "new-vendor") {
    localStorage.removeItem("editingApproval");
  }

  setCurrentPage(item.id as Page);
}}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? item.id === "new-vendor"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                      : item.id === "rejected"
                        ? "bg-rose-600 text-white shadow-md shadow-rose-200"
                        : "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {/* {item.public && !isActive && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600 leading-none">
                    PUBLIC
                  </span>
                )} */}
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white/60" />}
              </button>

              {/* Shareable URL tooltip on hover */}
              {item.public && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 hidden group-hover:block">
                  <div className="bg-slate-800 text-white text-[10px] rounded-lg px-3 py-2 shadow-xl w-52 leading-relaxed">
                    <p className="font-semibold mb-1">🔗 Shareable Link</p>
                    <p className="text-slate-300 break-all font-mono">{getShareableUrl(item.id)}</p>
                    <p className="text-slate-400 mt-1">Opens without login</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Settings + Role pill */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <button
          onClick={() => setCurrentPage("settings")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
            currentPage === "settings"
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        )}

        <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
            {currentUserRole[0]}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">Viewing as</p>
            <p className="text-[11px] text-slate-400">{currentUserRole}</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
        </div>
      </div>
    </div>
  );
}
