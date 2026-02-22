'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Copy,
  RefreshCw,
  Check,
  Shield,
  CloudDownload,
  Trash2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

import { Skeleton } from '@/components/ui/skeleton';

export default function PasswordGeneratorPage() {
  const { data: session } = useSession();
  /* The current generated password string */
  const [password, setPassword] = useState('');

  /* Password configuration settings */
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  /* Visual state for the copy action feedback */
  const [copied, setCopied] = useState(false);

  /* Strength analysis object */
  const [strength, setStrength] = useState({
    score: 0,
    label: 'Weak',
    color: 'text-red-500',
    bg: 'bg-red-500',
  });

  interface SavedPassword {
    id: string;
    name: string;
    value?: string;
    hashedValue?: string;
    createdAt: string;
  }

  const [savedPasswords, setSavedPasswords] = useState<SavedPassword[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordName, setPasswordName] = useState('');

  const generatePassword = useCallback(() => {
    let charset = '';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (charset === '') {
      setPassword('');
      return;
    }

    let generatedPassword = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      generatedPassword += charset[array[i] % charset.length];
    }
    setPassword(generatedPassword);
    setCopied(false);
  }, [
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
  ]);

  const calculateStrength = useCallback((pwd: string) => {
    let score = 0;
    if (!pwd)
      return {
        score: 0,
        label: 'Empty',
        color: 'text-zinc-500',
        bg: 'bg-zinc-800',
      };

    if (pwd.length > 8) score++;
    if (pwd.length > 12) score++;
    if (pwd.length > 16) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score < 3)
      return { score, label: 'Weak', color: 'text-red-500', bg: 'bg-red-500' };
    if (score < 5)
      return {
        score,
        label: 'Medium',
        color: 'text-yellow-500',
        bg: 'bg-yellow-500',
      };
    if (score < 6)
      return {
        score,
        label: 'Strong',
        color: 'text-green-500',
        bg: 'bg-green-500',
      };
    return {
      score,
      label: 'Very Strong',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500',
    };
  }, []);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  useEffect(() => {
    setStrength(calculateStrength(password));
  }, [password, calculateStrength]);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const fetchSavedPasswords = useCallback(async () => {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/passwords');
      const data = await res.json();
      setSavedPasswords(data);
    } catch {
      // Failed to fetch saved passwords
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      fetchSavedPasswords();
    }
  }, [session?.user, fetchSavedPasswords]);

  const handleSavePassword = async () => {
    if (!session?.user) {
      toast.error('Sign in required', {
        description: 'Authentication required for secure storage operations.',
      });
      return;
    }
    if (!password) {
      toast.error('Generate a password first');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/passwords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: passwordName || 'My Password',
          value: password,
        }),
      });

      if (res.ok) {
        toast.success('Password saved');
        setPasswordName('');
        fetchSavedPasswords();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to save');
      }
    } catch {
      toast.error('Error saving password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    try {
      const res = await fetch('/api/passwords', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success('Deleted successfully');
        fetchSavedPasswords();
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 md:p-8 overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Generator */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-card/40 border-border/50 shadow-sm rounded-2xl overflow-hidden relative">
              <CardHeader className="p-4 sm:p-8 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/50">
                      Generator
                    </CardTitle>
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase transition-all duration-500',
                      strength.color.replace('text-', 'bg-') + '/10',
                      strength.color.replace('text-', 'border-') + '/30',
                      strength.color
                    )}
                  >
                    {strength.label}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-8 pt-0 space-y-6 sm:space-y-8">
                <div className="relative group">
                  <Input
                    readOnly
                    value={password}
                    className="h-12 sm:h-16 text-lg sm:text-2xl font-mono text-center bg-muted/20 border-border/50 text-foreground rounded-xl px-12 sm:px-14 focus:ring-0"
                    placeholder="..."
                  />
                  <div className="absolute left-2 top-1/2 -translate-y-1/2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={generatePassword}
                      className="h-10 w-10 text-muted-foreground hover:text-primary rounded-lg"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        copyToClipboard(password);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className={cn(
                        'h-10 w-10 rounded-lg',
                        copied
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-primary'
                      )}
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        Length
                      </Label>
                      <span className="text-sm font-mono font-bold text-primary">
                        {length}
                      </span>
                    </div>
                    <Slider
                      value={[length]}
                      onValueChange={(val) => setLength(val[0])}
                      min={4}
                      max={64}
                      step={1}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        state: includeUppercase,
                        setter: setIncludeUppercase,
                        label: 'Uppercase',
                      },
                      {
                        state: includeLowercase,
                        setter: setIncludeLowercase,
                        label: 'Lowercase',
                      },
                      {
                        state: includeNumbers,
                        setter: setIncludeNumbers,
                        label: 'Numbers',
                      },
                      {
                        state: includeSymbols,
                        setter: setIncludeSymbols,
                        label: 'Symbols',
                      },
                    ].map((opt, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer',
                          opt.state
                            ? 'bg-primary/5 border-primary/20'
                            : 'bg-muted/10 border-border/50 hover:bg-muted/20'
                        )}
                        onClick={() => opt.setter(!opt.state)}
                      >
                        <Label className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                          {opt.label}
                        </Label>
                        <Checkbox
                          checked={opt.state}
                          onCheckedChange={() => {}}
                          className="rounded-md border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Name this password..."
                    value={passwordName}
                    onChange={(e) => setPasswordName(e.target.value)}
                    disabled={!session?.user}
                    className="h-10 bg-muted/10 border-border/50 text-xs font-medium rounded-lg"
                  />
                  <Button
                    onClick={handleSavePassword}
                    disabled={isSaving || !session?.user}
                    size="sm"
                    className="h-10 px-4 bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap shadow-none"
                  >
                    <CloudDownload className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save to Vault'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Vault */}
          <div className="lg:col-span-5 space-y-6">
            {session?.user ? (
              <Card className="bg-card/40 border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/50">
                    Saved Passwords
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-muted/10 border border-border/50 rounded-lg"
                        >
                          <div className="flex flex-col gap-2 w-full">
                            <Skeleton className="h-3 w-1/3" />
                            <Skeleton className="h-2 w-1/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : savedPasswords.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-20">
                      <Shield className="w-8 h-8" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        No passwords saved
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {savedPasswords.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-muted/20 border border-border/50 rounded-lg group hover:border-primary/20 transition-all"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">
                              {item.name}
                            </span>
                            <span className="text-[8px] text-muted-foreground/50 font-medium uppercase tracking-tighter">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary rounded-md"
                              onClick={() =>
                                copyToClipboard(item.value || item.hashedValue || '')
                              }
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteSaved(item.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div
                className="flex items-center justify-center p-8 bg-primary/5 border border-primary/10 rounded-2xl cursor-pointer"
                onClick={() =>
                  document.getElementById('signin-trigger')?.click()
                }
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-primary/60" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                    Sign in to enable Cloud Vault
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
