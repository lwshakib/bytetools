'use client';

import { useState } from 'react';
import { authClient, signIn, signUp } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAuthModal } from '@/hooks/use-auth-modal';

export function AuthModal() {
  const { isOpen, view, onClose, setView } = useAuthModal();
  const [isLoading, setIsLoading] = useState<'signin' | 'signup' | 'forgot-password' | 'google' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('signin');
    try {
      await signIn.email(
        {
          email,
          password,
          callbackURL: window.location.href,
        },
        {
          onSuccess: () => {
            toast.success('Signed in successfully!');
            onClose();
          },
          onError: (ctx) => {
            if (ctx.error.status === 403) {
              toast.error('Please verify your email before signing in.');
              setView('verification-sent');
            } else {
              toast.error(ctx.error.message || 'Failed to sign in');
            }
          },
        }
      );
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(null);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('signup');
    try {
      await signUp.email(
        {
          email,
          password,
          name,
          // Redirect back to the CURRENT page with a verified flag after they click the link
          callbackURL: `${window.location.href}${window.location.href.includes('?') ? '&' : '?'}verified=true`,
        },
        {
          onSuccess: () => {
            toast.success(
              'Account created! Please check your email to verify.'
            );
            setView('verification-sent');
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || 'Failed to create account');
          },
        }
      );
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(null);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('forgot-password');
    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: '/reset-password',
      });
      if (error) {
        toast.error(error.message || 'Failed to send reset link');
      } else {
        toast.success('Reset link sent to your email!');
        setView('login');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading('google');
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: window.location.href,
      });
    } catch {
      toast.error('Failed to sign in with Google');
      setIsLoading(null);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          // Delay resetting view to avoid flash during close animation
          setTimeout(() => setView('login'), 200);
        }
      }}
    >
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {view === 'forgot-password'
              ? 'Reset Password'
              : view === 'verification-sent'
                ? 'Check Email'
                : 'Welcome to ByteTools'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {view === 'forgot-password'
              ? 'Enter your email address and we&apos;ll send you a link to reset your password.'
              : view === 'verification-sent'
                ? 'Verify your email to access your account.'
                : 'Sign in to sync your tools, tasks, and settings across all your devices.'}
          </DialogDescription>
        </DialogHeader>

        {view === 'forgot-password' ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  placeholder="name@example.com"
                  type="email"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading !== null}>
              {isLoading === 'forgot-password' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Send Reset Link
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setView('login')}
              disabled={isLoading !== null}
            >
              Back to Login
            </Button>
          </form>
        ) : view === 'verification-sent' ? (
          <div className="text-center space-y-6 py-4">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-4 rounded-full border border-primary/20">
                <Mail className="h-10 w-10 text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold tracking-tight">
                Check your email
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We&apos;ve sent a verification link to{' '}
                <span className="font-medium text-foreground">
                  {email || 'your email'}
                </span>
                . Please click the link to verify your account and continue.
              </p>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() =>
                  window.open(`https://mail.google.com/`, '_blank')
                }
              >
                Go to Gmail
              </Button>
              <Button
                variant="ghost"
                className="w-full rounded-xl"
                onClick={() => setView('login')}
              >
                Back to Login
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border/40">
              Didn&apos;t receive an email? Check your spam folder or try
              signing in again to resend it.
            </p>
          </div>
        ) : (
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as 'login' | 'signup')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger
                value="login"
                className="rounded-lg data-[state=active]:shadow-sm"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-lg data-[state=active]:shadow-sm"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      placeholder="name@example.com"
                      type="email"
                      className="pl-9 h-11 rounded-xl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setView('forgot-password')}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      className="pl-9 h-11 rounded-xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl shadow-lg shadow-primary/10"
                  disabled={isLoading !== null}
                >
                  {isLoading === 'signin' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      placeholder="John Doe"
                      className="pl-9 h-11 rounded-xl"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      placeholder="name@example.com"
                      type="email"
                      className="pl-9 h-11 rounded-xl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      className="pl-9 h-11 rounded-xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl shadow-lg shadow-primary/10"
                  disabled={isLoading !== null}
                >
                  {isLoading === 'signup' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}

        {view !== 'forgot-password' && view !== 'verification-sent' && (
          <>
            <div className="relative my-6 flex items-center">
              <div className="flex-grow border-t border-border/60"></div>
              <span className="flex-shrink mx-4 text-muted-foreground text-sm font-medium">
                Or continue with
              </span>
              <div className="flex-grow border-t border-border/60"></div>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full h-11 rounded-xl shadow-sm border-border/60 hover:bg-muted/50 transition-all"
              onClick={handleGoogleSignIn}
              disabled={isLoading !== null}
            >
              {isLoading === 'google' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg
                  className="mr-3 h-4 w-4"
                  viewBox="-3 0 262 262"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid"
                >
                  <path
                    d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                    fill="#EB4335"
                  ></path>
                </svg>
              )}
              <span className="font-semibold">Google</span>
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
