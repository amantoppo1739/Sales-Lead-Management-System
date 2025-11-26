"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUsers,
  createUser,
  updateUser,
  deactivateUser,
  fetchReferenceData,
} from "../../../lib/api-client";
import { useAuthStore } from "../../../store/auth-store";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Sales Manager" },
  { value: "sales_rep", label: "Sales Rep" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "all", label: "All" },
];

const TEAM_UNASSIGNED_VALUE = "none";

const DEFAULT_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  role: "sales_rep",
  team_id: TEAM_UNASSIGNED_VALUE,
  timezone: "Asia/Kolkata",
  is_active: true,
  password: "",
};

export default function UsersPage() {
  const userRole = useAuthStore((state) => state.user?.role);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  const { data, isFetching } = useQuery({
    queryKey: ["users", { search, roleFilter, statusFilter, page }],
    queryFn: () =>
      fetchUsers({
        search: search || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page,
        per_page: 20,
      }),
    enabled: userRole === "admin",
    keepPreviousData: true,
  });

  const { data: referenceData } = useQuery({
    queryKey: ["reference-data"],
    queryFn: fetchReferenceData,
    enabled: userRole === "admin",
  });

  const users = data?.data ?? [];
  const meta = data?.meta;
  const teams = referenceData?.data?.teams ?? [];

  const resetForm = () => {
    setFormData(DEFAULT_FORM);
    setEditingUser(null);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openCreateForm = () => {
    resetForm();
    setFormOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "sales_rep",
      team_id: user.team?.id?.toString() ?? TEAM_UNASSIGNED_VALUE,
      timezone: user.timezone || "Asia/Kolkata",
      is_active: Boolean(user.is_active),
      password: "",
    });
    setFormOpen(true);
    setFormError(null);
    setFormSuccess(null);
  };

  const userMutation = useMutation({
    mutationFn: ({ id, payload }) => (id ? updateUser(id, payload) : createUser(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setFormSuccess(editingUser ? "User updated successfully." : "User created successfully.");
      if (!editingUser) {
        resetForm();
      }
      setFormOpen(false);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        (Array.isArray(error.response?.data?.errors)
          ? error.response.data.errors.join(", ")
          : error.message) ||
        "Unable to save user.";
      setFormError(message);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id) => updateUser(id, { is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const payload = {
      ...formData,
      team_id: formData.team_id && formData.team_id !== TEAM_UNASSIGNED_VALUE ? Number(formData.team_id) : null,
      is_active: Boolean(formData.is_active),
    };

    if (!editingUser && !payload.password) {
      setFormError("Password is required for new users.");
      return;
    }

    if (editingUser && !payload.password) {
      delete payload.password;
    }

    userMutation.mutate({
      id: editingUser?.id,
      payload,
    });
  };

  const handleDeactivate = (user) => {
    if (user.id === useAuthStore.getState().user?.id) {
      alert("You cannot deactivate yourself.");
      return;
    }
    if (!confirm(`Deactivate ${user.first_name} ${user.last_name}?`)) {
      return;
    }
    deactivateMutation.mutate(user.id);
  };

  const handleReactivate = (user) => {
    reactivateMutation.mutate(user.id);
  };

  const canGoPrev = meta?.current_page > 1;
  const canGoNext = meta?.current_page < meta?.last_page;

  if (userRole !== "admin") {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          You need administrator access to manage users.
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Administration</p>
          <h1 className="text-3xl font-semibold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Invite, edit, or deactivate workspace users and manage their permissions.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Search name, email..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="w-48"
          />
          <Select
            value={roleFilter}
            onValueChange={(value) => {
              setRoleFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {ROLE_OPTIONS.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openCreateForm}>Add User</Button>
        </div>
      </div>

      {formOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingUser ? "Edit User" : "Add User"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleInputChange} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Team</Label>
                  <Select
                    value={formData.team_id}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, team_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TEAM_UNASSIGNED_VALUE}>Unassigned</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" name="timezone" value={formData.timezone} onChange={handleInputChange} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password {editingUser ? <span className="text-muted-foreground">(leave blank to keep)</span> : "*"}
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={editingUser ? "••••••••" : "Minimum 8 characters"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="is_active">Status</Label>
                  <div className="flex h-10 items-center space-x-3 rounded-md border border-input px-3">
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{formData.is_active ? "Active" : "Inactive"}</span>
                  </div>
                </div>
              </div>

              {formError && <p className="text-sm text-destructive">{formError}</p>}
              {formSuccess && <p className="text-sm text-emerald-600">{formSuccess}</p>}

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={userMutation.isPending}>
                  {userMutation.isPending ? "Saving..." : editingUser ? "Save Changes" : "Create User"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Users ({meta?.total ?? users.length})</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button
              variant="outline"
              size="sm"
              disabled={!canGoPrev}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <span>
              Page {meta?.current_page ?? 1} / {meta?.last_page ?? 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!canGoNext}
              onClick={() => setPage((prev) => (canGoNext ? prev + 1 : prev))}
            >
              Next
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Team</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isFetching && users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                      Loading users...
                    </td>
                  </tr>
                )}
                {!isFetching && users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                      No users match the current filters.
                    </td>
                  </tr>
                )}
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.phone || "No phone"}</p>
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">
                        {ROLE_OPTIONS.find((role) => role.value === user.role)?.label ?? user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {user.team ? (
                        <span>
                          {user.team.name}
                          <span className="text-xs text-muted-foreground block">{user.team.territory_code}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.is_active ? "outline" : "destructive"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                          Edit
                        </Button>
                        {user.is_active ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeactivate(user)}
                            disabled={deactivateMutation.isPending && deactivateMutation.variables === user.id}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleReactivate(user)}
                            disabled={reactivateMutation.isPending && reactivateMutation.variables === user.id}
                          >
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

