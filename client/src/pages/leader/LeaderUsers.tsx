import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, UserCheck, UserX, Shield, Clock, Users } from "lucide-react";
import type { User } from "@shared/models/auth";

const addUserSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["admin_leader"]).default("admin_leader"),
});

type AddUserForm = z.infer<typeof addUserSchema>;

function roleBadge(role: string) {
  switch (role) {
    case "admin_leader":
      return <Badge variant="default" data-testid={`badge-role-admin`}><Shield className="w-3 h-3 mr-1" /> Admin Leader</Badge>;
    case "approved":
      return <Badge variant="secondary" data-testid={`badge-role-approved`}><UserCheck className="w-3 h-3 mr-1" /> Approved</Badge>;
    case "pending":
      return <Badge variant="outline" data-testid={`badge-role-pending`}><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    case "denied":
      return <Badge variant="destructive" data-testid={`badge-role-denied`}><UserX className="w-3 h-3 mr-1" /> Denied</Badge>;
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
}

export default function LeaderUsers() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User role updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user role.", variant: "destructive" });
    },
  });

  const createUser = useMutation({
    mutationFn: async (data: AddUserForm) => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsOpen(false);
      form.reset();
      toast({ title: "User added", description: "The user has been added successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const form = useForm<AddUserForm>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "admin_leader",
    },
  });

  const pendingUsers = users?.filter(u => u.role === "pending") || [];
  const activeUsers = users?.filter(u => u.role === "admin_leader") || [];
  const deniedUsers = users?.filter(u => u.role === "denied") || [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold" data-testid="text-users-title">User Management</h1>
          <p className="text-muted-foreground">Manage who has access to the leader portal.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-user">
              <Plus className="w-4 h-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((v) => createUser.mutate(v))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl><Input placeholder="John" {...field} data-testid="input-first-name" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl><Input placeholder="Doe" {...field} data-testid="input-last-name" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="john@church.com" {...field} data-testid="input-email" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <input type="hidden" {...form.register("role")} />
                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createUser.isPending} data-testid="button-submit-add-user">
                    {createUser.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Add User
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {pendingUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-amber-500" /> Pending Approval ({pendingUsers.length})</CardTitle>
                <CardDescription>These users have registered and are waiting for approval.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {pendingUsers.map((u) => (
                    <div key={u.id} className="py-4 flex items-center justify-between gap-4 flex-wrap" data-testid={`user-row-${u.id}`}>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{u.firstName} {u.lastName}</p>
                        <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateRole.mutate({ id: u.id, role: "admin_leader" })}
                          disabled={updateRole.isPending}
                          data-testid={`button-approve-${u.id}`}
                        >
                          <UserCheck className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateRole.mutate({ id: u.id, role: "denied" })}
                          disabled={updateRole.isPending}
                          data-testid={`button-deny-${u.id}`}
                        >
                          <UserX className="w-4 h-4 mr-1" /> Deny
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Active Users ({activeUsers.length})</CardTitle>
              <CardDescription>Users with access to the leader portal.</CardDescription>
            </CardHeader>
            <CardContent>
              {activeUsers.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No active users yet.</p>
              ) : (
                <div className="divide-y">
                  {activeUsers.map((u) => (
                    <div key={u.id} className="py-4 flex items-center justify-between gap-4 flex-wrap" data-testid={`user-row-${u.id}`}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{u.firstName} {u.lastName}</p>
                          {roleBadge(u.role)}
                          {u.id === currentUser?.id && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                      </div>
                      {u.id !== currentUser?.id && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateRole.mutate({ id: u.id, role: "denied" })}
                            disabled={updateRole.isPending}
                            data-testid={`button-remove-${u.id}`}
                          >
                            <UserX className="w-4 h-4 mr-1" /> Remove Access
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {deniedUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserX className="w-5 h-5 text-destructive" /> Denied Users ({deniedUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {deniedUsers.map((u) => (
                    <div key={u.id} className="py-4 flex items-center justify-between gap-4 flex-wrap" data-testid={`user-row-${u.id}`}>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{u.firstName} {u.lastName}</p>
                        <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRole.mutate({ id: u.id, role: "admin_leader" })}
                        disabled={updateRole.isPending}
                        data-testid={`button-restore-${u.id}`}
                      >
                        <UserCheck className="w-4 h-4 mr-1" /> Restore Access
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
