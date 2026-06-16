import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, UserPlus, Trash2, Edit } from "lucide-react";
import { createUser, deleteUser, getUsers, updateUser } from "@/api";

type UserType = {
  UserId: number;
  FullName: string;
  Email: string;
  RoleId: number;
  Role: string;
  Status: string;
  CreatedAt: string;
  UpdatedAt: string;
  CreatedByName: string | null;
};

export default function Users() {
  const [users, setUsers] = useState<UserType[]>([]);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    roleId: 3,
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const roleMap: Record<number, string> = {
        1: "Admin",
        2: "Approver",
        3: "Requestor",
      };

     const payload: any = {
  fullName: newUser.name,
  email: newUser.email,
  role: roleMap[newUser.roleId],
};

if (newUser.password.trim()) {
  payload.password = newUser.password;
}

if (editingId === null && !newUser.password.trim()) {
  payload.password = "12345678";
}

      if (editingId !== null) {
        const updatedUser = await updateUser(editingId, payload);

        setUsers((prev) =>
          prev.map((u) => (u.UserId === editingId ? updatedUser : u)),
        );

        alert("User Updated Successfully");
      } else {
        const createdUser = await createUser(payload);

        setUsers((prev) => [...prev, createdUser]);

        alert("User Added Successfully");
      }

      setNewUser({
        name: "",
        email: "",
        password: "",
        roleId: 3,
      });

      setEditingId(null);
    } catch (err: any) {
  console.error(err);

  const errorMessage =
    err?.response?.data?.errors?.[0]?.message ||
    err?.response?.data?.message ||
    "Something went wrong";

  alert(errorMessage);
}
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();

      console.log("API USERS:", res); // 👈 MUST check this

      if (Array.isArray(res)) {
        setUsers(res);
      } else {
        console.warn("Users is not array:", res);
        setUsers([]); // ✅ fallback
      }
    } catch (err) {
      console.error("fetchUsers error:", err);
      setUsers([]); // ✅ prevent crash
      alert("Failed to load users");
    }
  };

  const removeUser = async (id: number) => {
    try {
      await deleteUser(id);

      // ✅ update UI instantly (no refetch)
      setUsers((prev) => prev.filter((u) => u.UserId !== id));

      alert("User deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  const roleReverseMap: Record<string, number> = {
    Admin: 1,
    Approver: 2,
    Requestor: 3,
  };

  const editUser = (user: UserType) => {
    setNewUser({
      name: user.FullName,
      email: user.Email,
      password: "",
      roleId: roleReverseMap[user.Role], // ✅ FIX
    });

    setEditingId(user.UserId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          User Management & RBAC
        </h1>
        <p className="text-slate-500">
          Manage access control, roles, and permissions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
            <CardDescription>
              Provision access for a new team member.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <Input
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="john@celebaltech.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>

                <Input
                  type="password"
                  value={newUser.password}
                  minLength={8}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      password: e.target.value,
                    })
                  }
                  placeholder={
                    editingId
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                  required={!editingId}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Role
                </label>
                <select
                  value={newUser.roleId}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      roleId: Number(e.target.value),
                    })
                  }
                >
                  <option value={1}>Admin (Full Access)</option>
                  <option value={2}>Approver (Review & Sync)</option>
                  <option value={3}>Requestor (Create Only)</option>
                </select>
              </div>
              <Button type="submit" className="w-full mt-2">
                <UserPlus className="w-4 h-4 mr-2" />
                {editingId ? "Update User" : "Add User"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>
              Current users and their assigned roles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(users) &&
                    users.map((user) => (
                      <tr
                        key={user.UserId}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">
                            {user.FullName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {user.Email}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <Badge>{user.Role}</Badge>
                        </td>

                        <td className="px-4 py-3">
                          <Badge
                            className={
                              user.Status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }
                          >
                            {user.Status === "Active" ? "Active" : "Inactive"}
                          </Badge>
                        </td>

                        {/* <td className="px-4 py-3 text-right">
                        {user.CreatedByName || "-"}
                      </td> */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => editUser(user)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Are you sure you want to delete this user?",
                                  )
                                ) {
                                  removeUser(user.UserId);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
