"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Lock, 
  Shield, 
  Trash2, 
  Smartphone, 
  Monitor,
  ShieldCheck,
  Zap,
  Activity,
  Fingerprint
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AccountPage() {
  const [name, setName] = useState("Professor");
  const [email, setEmail] = useState("professor@bytetools.com");

  const sessions = [
    { id: 1, device: "MacBook Pro", browser: "Chrome", location: "Dhaka, Bangladesh", status: "Current Session", icon: Monitor },
    { id: 2, device: "iPhone 15", browser: "Safari", location: "Dhaka, Bangladesh", status: "2 days ago", icon: Smartphone },
  ];

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Identity profile updated.");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Security credentials updated.");
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-y-auto p-6 md:p-8 lg:p-12 items-center">
      <div className="w-full max-w-6xl space-y-16 py-8">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-4">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2"
            >
                <Fingerprint className="w-3.5 h-3.5" />
                Identity Node Active
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase">IDENTITY <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">VAULT</span></h1>
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.3em] opacity-40">Core Credential Management</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 items-start">
            {/* Sidebar Navigation */}
            <div className="space-y-6">
                <div className="bg-card/40 border border-border/50 rounded-[2rem] p-6 shadow-xl space-y-2">
                    <Button variant="ghost" className="w-full justify-start h-12 rounded-xl font-black text-[10px] uppercase tracking-widest gap-3 bg-blue-500/10 text-blue-500 shadow-inner">
                        <User className="w-4 h-4" /> Profile Matrix
                    </Button>
                    <Button variant="ghost" className="w-full justify-start h-12 rounded-xl font-black text-[10px] uppercase tracking-widest gap-3 opacity-40 hover:opacity-100 hover:bg-muted transition-all">
                        <Lock className="w-4 h-4" /> Security Layer
                    </Button>
                    <Button variant="ghost" className="w-full justify-start h-12 rounded-xl font-black text-[10px] uppercase tracking-widest gap-3 opacity-40 hover:opacity-100 hover:bg-muted transition-all">
                        <Shield className="w-4 h-4" /> Session Logs
                    </Button>
                    <div className="px-4 py-4">
                        <Separator className="bg-border/50" />
                    </div>
                    <Button variant="ghost" className="w-full justify-start h-12 rounded-xl font-black text-[10px] uppercase tracking-widest gap-3 text-red-500/40 hover:text-red-500 hover:bg-red-500/5 transition-all">
                        <Trash2 className="w-4 h-4" /> Terminal Zone
                    </Button>
                </div>

                <div className="p-8 rounded-[2rem] bg-card/20 border border-border/50 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-20">Sync Status</h4>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Cloud Hooked</span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="space-y-12">
                {/* Profile Information */}
                <Card className="bg-card/40 border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <CardHeader className="p-10 pb-6">
                        <CardTitle className="text-xl font-black uppercase tracking-tight">Identity Profile</CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-40">Core demographic data matrix</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Legal Name</Label>
                                <Input 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-14 bg-background border-border/50 rounded-2xl px-6 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Communication Endpoint</Label>
                                <Input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-14 bg-background border-border/50 rounded-2xl px-6 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all opacity-60"
                                    readOnly
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-10 bg-muted/20 border-t border-border/10 flex justify-end">
                        <Button onClick={handleUpdateProfile} className="h-12 px-8 bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                            Commit Changes
                        </Button>
                    </CardFooter>
                </Card>

                {/* Security Section */}
                <Card className="bg-card/40 border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <CardHeader className="p-10 pb-6">
                        <CardTitle className="text-xl font-black uppercase tracking-tight text-amber-500">Security Credentials</CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-40">Cryptographic access control</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 space-y-8">
                        <div className="space-y-4">
                            <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase tracking-tight">Two-Factor Authentication</p>
                                    <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">Enhanced biometric verification enabled</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-40">
                             <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">New Credentials</Label>
                                <Input type="password" placeholder="••••••••" className="h-14 bg-background border-border/50 rounded-2xl px-6 font-bold" />
                             </div>
                             <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Confirm Protocol</Label>
                                <Input type="password" placeholder="••••••••" className="h-14 bg-background border-border/50 rounded-2xl px-6 font-bold" />
                             </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-10 bg-muted/20 border-t border-border/10 flex justify-end">
                        <Button disabled onClick={handleChangePassword} className="h-12 px-8 bg-zinc-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl opacity-40">
                            Update Layer
                        </Button>
                    </CardFooter>
                </Card>

                {/* Active Sessions */}
                <Card className="bg-card/40 border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <CardHeader className="p-10 pb-6">
                        <CardTitle className="text-xl font-black uppercase tracking-tight">Access Partition logs</CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-40">Active temporal sessions</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 space-y-4">
                        {sessions.map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-6 rounded-[1.5rem] bg-background/50 border border-border/30 hover:bg-muted/30 transition-all group shadow-sm">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center text-muted-foreground group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-all">
                                        <session.icon className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase tracking-tight text-foreground">{session.device} · {session.browser}</p>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">{session.location} · {session.status}</p>
                                    </div>
                                </div>
                                {session.id !== 1 && (
                                    <Button variant="ghost" className="h-10 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/5 opacity-0 group-hover:opacity-100 transition-all">
                                        Purge session
                                    </Button>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
                    {[
                        { icon: ShieldCheck, title: "Vault Guard", desc: "AES-256 encryption at rest for all identity configurations.", color: "text-blue-500", bg: "bg-blue-500/10" },
                        { icon: Zap, title: "Hyper Sync", desc: "Instance-level synchronization across your authenticated node cluster.", color: "text-amber-500", bg: "bg-amber-500/10" },
                        { icon: Activity, title: "Audit Log", desc: "Immutable record of all identity mutations and access attempts.", color: "text-emerald-500", bg: "bg-emerald-500/10" }
                    ].map((item, i) => (
                        <div key={i} className="p-8 rounded-[2rem] bg-card/40 border border-border/50 relative overflow-hidden group shadow-lg">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110", item.bg)}>
                                <item.icon className={cn("w-6 h-6", item.color)} />
                            </div>
                            <h4 className="text-[10px] font-black text-foreground mb-3 uppercase tracking-widest">{item.title}</h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed font-bold uppercase tracking-tighter opacity-40">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
