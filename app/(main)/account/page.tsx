'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import {
  User,
  Lock,
  Shield,
  Trash2,
  Smartphone,
  Monitor,
  Activity,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { authClient, useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function AccountPage() {
  const router = useRouter();
  const { data: sessionData, isPending } = useSession();
  const [activeNav, setActiveNav] = useState('profile');
  const [isDeleting, setIsDeleting] = useState(false);

  // Route protection
  useEffect(() => {
    if (!isPending && !sessionData) {
      router.push('/');
    }
  }, [sessionData, isPending, router]);

  const profileRef = useRef<HTMLDivElement>(null);
  const securityRef = useRef<HTMLDivElement>(null);
  const sessionsRef = useRef<HTMLDivElement>(null);
  const dangerRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (section: string) => {
    setActiveNav(section);
    const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
      profile: profileRef,
      security: securityRef,
      sessions: sessionsRef,
      danger: dangerRef,
    };
    refs[section]?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameInput = document.getElementById(
      'display-name'
    ) as HTMLInputElement;
    if (!nameInput) return;

    try {
      const { error } = await authClient.updateUser({ name: nameInput.value });
      if (error) {
        toast.error(error.message || 'Failed to update profile');
      } else {
        toast.success('Profile updated successfully.');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        toast.error(result.error || 'Failed to delete account');
      } else {
        toast.success('Account deleted successfully');
        // Sign out on the client side to clear local state
        await authClient.signOut();
        window.location.href = '/';
      }
    } catch {
      toast.error('An error occurred during account deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  const user = sessionData?.user;
  const currentSession = sessionData?.session;

  if (isPending || !sessionData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Activity className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth">
      <div className="max-w-5xl mx-auto py-8 sm:py-16 px-4 sm:px-6">
        <header className="mb-10 sm:mb-16">
          <h1 className="text-2xl font-semibold">Account Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your profile, security, and active sessions.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-10 sm:gap-16">
          <aside className="w-full lg:w-48 lg:sticky lg:top-24 space-y-1">
            <NavBtn
              active={activeNav === 'profile'}
              onClick={() => scrollToSection('profile')}
              icon={User}
              label="Profile"
            />
            <NavBtn
              active={activeNav === 'security'}
              onClick={() => scrollToSection('security')}
              icon={Lock}
              label="Security"
            />
            <NavBtn
              active={activeNav === 'sessions'}
              onClick={() => scrollToSection('sessions')}
              icon={Shield}
              label="Sessions"
            />
            <div className="pt-4 mt-4 border-t border-border space-y-1">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign Out</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to sign out of your account?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSignOut}
                      className="rounded-xl"
                    >
                      Sign Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <NavBtn
                active={activeNav === 'danger'}
                onClick={() => scrollToSection('danger')}
                icon={Trash2}
                label="Delete Account"
                danger
              />
            </div>
          </aside>

          <main className="flex-1 space-y-20">
            <section
              ref={profileRef}
              id="profile"
              className="scroll-mt-24 space-y-8"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border relative">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-medium">
                    {user?.name || 'User'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Joined in{' '}
                    {user?.createdAt
                      ? format(new Date(user.createdAt), 'MMMM yyyy')
                      : '2024'}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 max-w-xl">
                <div className="space-y-2">
                  <Label
                    htmlFor="display-name"
                    className="text-xs text-muted-foreground"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="display-name"
                    defaultValue={user?.name || ''}
                    className="max-w-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Email Address
                  </Label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="max-w-md opacity-60"
                  />
                </div>
                <Button
                  onClick={handleUpdateProfile}
                  variant="default"
                  className="w-fit"
                >
                  Save Changes
                </Button>
              </div>
            </section>

            <Separator />

            <section
              ref={securityRef}
              id="security"
              className="scroll-mt-24 space-y-8"
            >
              <div>
                <h2 className="text-lg font-medium">Security</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Control your password and authentication settings.
                </p>
              </div>

              <div className="grid gap-6 max-w-xl">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      New Password
                    </Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="max-w-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Confirm Password
                    </Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="max-w-md"
                    />
                  </div>
                  <Button variant="outline" className="w-fit">
                    Update Password
                  </Button>
                </div>
              </div>
            </section>

            <Separator />

            <section
              ref={sessionsRef}
              id="sessions"
              className="scroll-mt-24 space-y-8"
            >
              <div>
                <h2 className="text-lg font-medium">Active Sessions</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Devices currently connected to your account.
                </p>
              </div>

              <div className="border border-border/60 rounded-xl overflow-hidden divide-y divide-border/60">
                <div className="p-4 flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-4">
                    {currentSession?.userAgent
                      ?.toLowerCase()
                      .includes('mobile') ? (
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Monitor className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {currentSession?.userAgent || 'Current Session'}
                        </p>
                        <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded uppercase">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-none mt-1">
                        {currentSession?.ipAddress || 'Active Connection'} •
                        Current Device
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            <section
              ref={dangerRef}
              id="danger"
              className="scroll-mt-24 pt-8 border-t border-border"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 border border-destructive/20 rounded-xl bg-destructive/[0.02]">
                <div className="space-y-1.5">
                  <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Delete Account
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Permanently delete your profile, tools, and all associated
                    data. This action is irreversible.
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="px-8 shadow-sm">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader className="space-y-3">
                      <AlertDialogTitle className="text-xl">
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-base text-muted-foreground">
                        This will permanently remove your account and all data
                        from our servers. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2">
                      <AlertDialogCancel className="rounded-xl">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive hover:bg-destructive/90 rounded-xl px-6"
                      >
                        {isDeleting ? (
                          <span className="flex items-center gap-2">
                            <Activity className="w-4 h-4 animate-spin" />
                            Deleting...
                          </span>
                        ) : (
                          'Permanently Delete'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function NavBtn({
  active,
  onClick,
  icon: Icon,
  label,
  danger = false,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
        active
          ? danger
            ? 'bg-red-50 text-red-600 font-medium'
            : 'bg-muted text-foreground font-medium'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
