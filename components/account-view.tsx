    "use client";

import { useState, useEffect } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, User, Shield, HardDrive, Trash2, Smartphone, Monitor } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { toast } from "sonner";
import { format } from "date-fns";

export function AccountView() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      fetchSessions();
    }
  }, [session]);

  const fetchSessions = async () => {
    try {
      const { data } = await authClient.listSessions();
      setActiveSessions(data || []);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleUpdateName = async () => {
    setIsUpdating(true);
    try {
      await authClient.updateUser({
        name: name,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action is irreversible.")) {
      try {
        await authClient.deleteUser();
        toast.success("Account deleted");
        window.location.href = "/";
      } catch (error) {
        toast.error("Failed to delete account");
      }
    }
  };

  const handleRevokeSession = async (token: string) => {
    try {
      await authClient.revokeSession({ token });
      toast.success("Session revoked");
      fetchSessions();
    } catch (error) {
      toast.error("Failed to revoke session");
    }
  };

  if (!session) return null;

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-[#d4d4d4] font-mono p-4 sm:p-6 transition-colors duration-300">
      <header className="p-4 sm:p-6 flex justify-between items-center z-50">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-900">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Type</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto py-8 sm:py-12 space-y-8">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile, security, and account preferences.</p>
        </div>

        <div className="grid gap-8">
          {/* Profile Section */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={session.user.email} disabled className="bg-muted/50" />
                <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/20 pt-6">
              <Button onClick={handleUpdateName} disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>

          {/* Active Sessions */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Active Sessions
              </CardTitle>
              <CardDescription>Devices currently logged into your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingSessions ? (
                    <TableRow>
                       <TableCell colSpan={4} className="text-center py-8">Loading sessions...</TableCell>
                    </TableRow>
                  ) : activeSessions.length === 0 ? (
                    <TableRow>
                       <TableCell colSpan={4} className="text-center py-8">No active sessions.</TableCell>
                    </TableRow>
                  ) : activeSessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {s.userAgent?.toLowerCase().includes("mobile") ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                          <span className="truncate max-w-[150px]">{s.userAgent || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{s.ipAddress || "Unknown"}</TableCell>
                      <TableCell>{format(new Date(s.createdAt), "MMM d, HH:mm")}</TableCell>
                      <TableCell className="text-right">
                         <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-white hover:bg-destructive"
                            onClick={() => handleRevokeSession(s.token)}
                          >
                            Revoke
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Permanently delete your account and all associated data.</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Deleting your account will remove your entire typing history and progress. This cannot be undone.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="border-t border-destructive/10 pt-6">
              <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
