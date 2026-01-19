"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  ShieldAlert, 
  ShieldCheck, 
  CloudDownload, 
  Trash2, 
  Key, 
  Lock,
  Package,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function PasswordGeneratorPage() {
  const { data: session } = useSession();
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState({ score: 0, label: 'Weak', color: 'text-red-500', bg: 'bg-red-500' });
  
  const [savedPasswords, setSavedPasswords] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
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
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const calculateStrength = useCallback((pwd: string) => {
    let score = 0;
    if (!pwd) return { score: 0, label: 'Empty', color: 'text-zinc-500', bg: 'bg-zinc-800' };

    if (pwd.length > 8) score++;
    if (pwd.length > 12) score++;
    if (pwd.length > 16) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score < 3) return { score, label: 'Weak', color: 'text-red-500', bg: 'bg-red-500' };
    if (score < 5) return { score, label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    if (score < 6) return { score, label: 'Strong', color: 'text-green-500', bg: 'bg-green-500' };
    return { score, label: 'Very Strong', color: 'text-emerald-500', bg: 'bg-emerald-500' };
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

  const fetchSavedPasswords = async () => {
    if (!session?.user) return;
    try {
        const res = await fetch('/api/passwords');
        const data = await res.json();
        setSavedPasswords(data);
    } catch (err) {
        console.error(err);
    }
  };

  useEffect(() => {
    if (session?.user) {
        fetchSavedPasswords();
    }
  }, [session?.user]);

  const handleSavePassword = async () => {
    if (!session?.user) {
        toast.error('You must be signed in to access the Cloud Vault', {
            description: 'Authentication required for secure storage operations.'
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
                value: password
            })
        });

        if (res.ok) {
            toast.success('Password hash saved to cloud vault');
            setPasswordName('');
            fetchSavedPasswords();
        } else {
            const err = await res.json();
            toast.error(err.error || 'Failed to save');
        }
    } catch (err) {
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
            body: JSON.stringify({ id })
        });
        if (res.ok) {
            toast.success('Deleted successfully');
            fetchSavedPasswords();
        }
    } catch (err) {
        toast.error('Failed to delete');
    }
  };

  return (
    <div className="flex flex-1 flex-col p-6 md:p-8 lg:p-12 overflow-y-auto">
      <div className={cn(
        "w-full mx-auto space-y-12 transition-all duration-500",
        session?.user ? "max-w-7xl" : "max-w-5xl"
      )}>
        {/* Header Section */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Encryption Entropy Active
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase"
          >
            VAULT <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">GENESIS</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-sm font-medium uppercase tracking-[0.3em] opacity-40"
          >
            Cryptographically secure random sequence generation.
          </motion.p>
        </div>

        <div className={cn(
            "grid grid-cols-1 gap-12",
            session?.user ? "lg:grid-cols-12" : "lg:grid-cols-1"
        )}>
            {/* Main Area */}
            <div className={cn(
                "space-y-12",
                session?.user ? "lg:col-span-8 xl:col-span-9" : ""
            )}>
                <Card className="bg-card/50 border-border/50 shadow-2xl rounded-[2.5rem] overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                    <CardHeader className="p-10 border-b border-border/50 bg-muted/20">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-2">
                                <CardTitle className="text-xl font-black uppercase tracking-tight">Access Token Output</CardTitle>
                                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5" /> Locally Synthesized Bitstream
                                </CardDescription>
                            </div>
                            <div className={cn(
                                "flex items-center gap-3 px-6 py-2 rounded-2xl border transition-all duration-500",
                                strength.color.replace('text-', 'bg-') + '/10',
                                strength.color.replace('text-', 'border-') + '/30'
                            )}>
                                {strength.score < 3 ? <ShieldAlert className="w-4 h-4" /> : strength.score < 5 ? <Shield className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", strength.color)}>{strength.label}</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 space-y-12">
                        <div className="relative group">
                            <Input
                                readOnly
                                value={password}
                                className="h-20 text-3xl md:text-4xl font-mono text-center bg-zinc-950 border-border/50 text-emerald-400 rounded-2xl px-16 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner"
                                placeholder="..."
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={generatePassword}
                                    className="h-12 w-12 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all active:scale-90"
                                >
                                    <RefreshCw className="w-6 h-6" />
                                </Button>
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {copyToClipboard(password); setCopied(true); setTimeout(() => setCopied(false), 2000);}}
                                    className={cn(
                                        "h-12 w-12 transition-all active:scale-90 rounded-xl",
                                        copied ? 'text-emerald-500 bg-emerald-500/10' : 'text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10'
                                    )}
                                >
                                    {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                                </Button>
                            </div>
                            <motion.div 
                                className="absolute bottom-0 left-0 h-1.5 transition-all duration-1000 ease-in-out rounded-full" 
                                style={{ width: `${(strength.score / 6) * 100}%`, backgroundColor: strength.bg.replace('bg-', '') }} 
                            />
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4 p-6 bg-muted/20 border border-border/50 rounded-2xl relative overflow-hidden"
                        >
                            {!session?.user && (
                                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center cursor-pointer" onClick={() => document.getElementById('signin-trigger')?.click()}>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-background/80 border border-border/50 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
                                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Authenticate to Vault</span>
                                    </div>
                                </div>
                            )}
                            <Input 
                                placeholder="Descriptor (e.g. Master Key)..."
                                value={passwordName}
                                onChange={(e) => setPasswordName(e.target.value)}
                                disabled={!session?.user}
                                className="h-12 bg-background border-border/50 text-xs font-bold rounded-xl"
                            />
                            <Button 
                                onClick={handleSavePassword}
                                disabled={isSaving || !session?.user}
                                className="h-12 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                            >
                                <CloudDownload className="w-4 h-4 mr-2" />
                                {isSaving ? 'Synching...' : 'Vault Deposit'}
                            </Button>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center px-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Sequence Length</Label>
                                        <span className="text-emerald-500 font-mono text-xl font-black bg-emerald-500/10 px-4 py-1 rounded-xl border border-emerald-500/20">{length}</span>
                                    </div>
                                    <Slider
                                        value={[length]}
                                        onValueChange={(val) => setLength(val[0])}
                                        min={4}
                                        max={64}
                                        step={1}
                                        className="py-4"
                                    />
                                    <div className="flex justify-between text-[8px] text-muted-foreground/30 font-black uppercase tracking-[0.2em] px-1">
                                        <span>Initial (4)</span>
                                        <span>Hardened (16+)</span>
                                        <span>Terminal (64)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { state: includeUppercase, setter: setIncludeUppercase, label: 'Uppercase', desc: 'ABC' },
                                    { state: includeLowercase, setter: setIncludeLowercase, label: 'Lowercase', desc: 'abc' },
                                    { state: includeNumbers, setter: setIncludeNumbers, label: 'Numbers', desc: '123' },
                                    { state: includeSymbols, setter: setIncludeSymbols, label: 'Symbols', desc: '!@#' }
                                ].map((opt, i) => (
                                    <div 
                                        key={i}
                                        className={cn(
                                            "flex flex-col gap-3 p-5 rounded-2xl border transition-all cursor-pointer group",
                                            opt.state ? "bg-emerald-500/5 border-emerald-500/30" : "bg-muted/10 border-border/50 hover:bg-muted/30"
                                        )}
                                        onClick={() => opt.setter(!opt.state)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] font-black uppercase tracking-widest cursor-pointer group-hover:text-emerald-500 transition-colors">{opt.label}</Label>
                                            <Checkbox checked={opt.state} onCheckedChange={() => {}} className="border-border/50 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none" />
                                        </div>
                                        <p className="text-[9px] font-mono font-bold opacity-30 group-hover:opacity-60 transition-opacity">{opt.desc} Protocol</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button 
                            onClick={generatePassword}
                            className="w-full h-16 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-emerald-500/20 transition-all active:scale-95"
                        >
                            Sync New Sequence
                        </Button>
                    </CardContent>
                </Card>

                {/* Tech Specs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: ShieldCheck, title: "Edge Privacy", desc: "No data leafing. All generation occurs within your secure browser sandbox.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                        { icon: Lock, title: "Bcrypt Protocol", desc: "Cloud deposits are one-way hashed. Irreversible secret management.", color: "text-blue-500", bg: "bg-blue-500/10" },
                        { icon: Key, title: "OS Entropy", desc: "Native OS-level cryptographically strong random values utilized.", color: "text-teal-500", bg: "bg-teal-500/10" }
                    ].map((item, i) => (
                        <div key={i} className="p-8 rounded-[2rem] bg-card border border-border/50 relative overflow-hidden group">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110", item.bg)}>
                                <item.icon className={cn("w-6 h-6", item.color)} />
                            </div>
                            <h4 className="text-[10px] font-black text-foreground mb-3 uppercase tracking-widest">{item.title}</h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed font-bold uppercase tracking-tighter opacity-40">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cloud Vault Integrated Panel */}
            <div className="lg:col-span-4 xl:col-span-3">
                <Card className="bg-card border-border/50 shadow-2xl rounded-[2.5rem] sticky top-8 flex flex-col h-[calc(100vh-8rem)] overflow-hidden relative">
                    {!session?.user && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md cursor-pointer group/vault" onClick={() => document.getElementById('signin-trigger')?.click()}>
                            <div className="flex flex-col items-center gap-6 px-10 text-center">
                                <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl transition-transform group-hover/vault:scale-110">
                                    <Lock className="w-10 h-10 text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Vault Locked</h4>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Authenticate to synchronize and manage your secure entropy store.</p>
                                </div>
                                <Button className="h-12 bg-emerald-500 text-black rounded-xl px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                    Verify Identity
                                </Button>
                            </div>
                        </div>
                    )}
                    <CardHeader className="bg-muted/30 border-b border-border/50 p-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-inner">
                                <Lock className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Archive Vault</h3>
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">Hashed Entropy Store</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                        {savedPasswords.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-8 opacity-20 px-6">
                            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center border-4 border-dashed border-muted-foreground/20">
                                <Shield className="w-10 h-10" />
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest">Vault Secured</p>
                                <p className="text-[9px] font-bold leading-relaxed uppercase tracking-tighter">Awaiting first secret deposit for cloud synchronization.</p>
                            </div>
                        </div>
                        ) : (
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                            {savedPasswords.map((item) => (
                                <motion.div 
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group flex flex-col p-6 rounded-[2rem] bg-muted/20 border border-border/50 hover:bg-muted/40 hover:border-emerald-500/20 transition-all relative overflow-hidden"
                                >
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDeleteSaved(item.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-foreground uppercase tracking-tight truncate pr-8">{item.name}</span>
                                            <span className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-tighter">
                                                Archived {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <code className="text-[10px] flex-1 bg-zinc-950 px-3 py-2 rounded-xl truncate text-emerald-500 font-mono">
                                                {item.value || (item.hashedValue.slice(0, 10) + '...')}
                                            </code>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-9 w-9 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all active:scale-90"
                                                onClick={() => copyToClipboard(item.value || item.hashedValue)}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2 px-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">AES-256-GCM Secure Archive</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            </AnimatePresence>
                        </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
