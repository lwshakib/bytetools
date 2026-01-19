"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Copy, 
  RefreshCw, 
  Check, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Key, 
  Lock, 
  Unlock,
  Package,
  FileCode,
  Info,
  CloudDownload,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import * as jose from 'jose';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

export default function JWTToolPage() {
  const { data: session } = useSession();
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [payload, setPayload] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}');
  const [encodedToken, setEncodedToken] = useState('');
  const [tokenToDecode, setTokenToDecode] = useState('');
  const [decodedHeader, setDecodedHeader] = useState<any>(null);
  const [decodedPayload, setDecodedPayload] = useState<any>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  
  // Cloud vault state
  const [savedJwts, setSavedJwts] = useState<any[]>([]);
  const [jwtName, setJwtName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Generate a random secret key
  const generateSecret = useCallback(() => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
    let result = '';
    const array = new Uint32Array(32);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < 32; i++) {
      result += chars[array[i] % chars.length];
    }
    setSecret(result);
  }, []);

  useEffect(() => {
    generateSecret();
  }, [generateSecret]);

  // Handle Encoding
  const handleEncode = useCallback(async () => {
    if (!secret) {
        toast.error('Secret key is required for encoding');
        return;
    }
    try {
      const parsedPayload = JSON.parse(payload);
      const secretUint8 = new TextEncoder().encode(secret);
      
      const token = await new jose.SignJWT(parsedPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secretUint8);
        
      setEncodedToken(token);
      toast.success('Token generated successfully');
    } catch (error: any) {
      toast.error('Encoding Error: ' + error.message);
    }
  }, [payload, secret]);

  // Handle Decoding
  const handleDecode = useCallback(async () => {
    if (!tokenToDecode) {
      setDecodedHeader(null);
      setDecodedPayload(null);
      setIsVerified(null);
      return;
    }

    try {
      // Decode without verification first to show contents
      const header = jose.decodeProtectedHeader(tokenToDecode);
      const payload = jose.decodeJwt(tokenToDecode);
      
      setDecodedHeader(header);
      setDecodedPayload(payload);
      
      // Try to verify if secret is provided
      if (secret) {
        try {
          const secretUint8 = new TextEncoder().encode(secret);
          await jose.jwtVerify(tokenToDecode, secretUint8);
          setIsVerified(true);
        } catch (err) {
          setIsVerified(false);
        }
      } else {
        setIsVerified(null);
      }
    } catch (error: any) {
      console.error(error);
      setIsVerified(false);
      setDecodedHeader({ error: "Invalid format" });
      setDecodedPayload({ error: "Could not decode token" });
    }
  }, [tokenToDecode, secret]);

  useEffect(() => {
    handleDecode();
  }, [tokenToDecode, secret, handleDecode]);

  const copyToClipboard = (text: string, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success(`${type} copied to clipboard`);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Cloud vault functions
  const fetchSavedJwts = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch('/api/jwt');
      const data = await res.json();
      setSavedJwts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchSavedJwts();
    }
  }, [session?.user]);

  const handleSaveJwt = async () => {
    if (!session?.user) {
      toast.error('Please sign in to save JWTs');
      return;
    }
    if (!encodedToken) {
      toast.error('No token to save');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/jwt', {
        method: 'POST',
        body: JSON.stringify({ 
          name: jwtName || 'My JWT', 
          token: encodedToken,
          secret: secret || undefined 
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        toast.success('JWT saved to vault');
        setJwtName('');
        fetchSavedJwts();
      } else {
        toast.error('Failed to save JWT');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteJwt = async (id: string) => {
    try {
      const res = await fetch('/api/jwt', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        toast.success('Deleted successfully');
        fetchSavedJwts();
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const loadSavedJwt = (item: any) => {
    setTokenToDecode(item.token);
    if (item.secret) {
      setSecret(item.secret);
    }
    toast.success('JWT loaded from vault');
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8 lg:p-12 overflow-y-auto">
      <div className={cn(
        "w-full mx-auto space-y-12 transition-all duration-500",
        session?.user ? "max-w-7xl" : "max-w-5xl"
      )}>
        {/* Header Section */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Security Protocol Active
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black tracking-tighter text-foreground"
          >
            JWT <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">ARCHITECT</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-sm font-medium max-w-2xl mx-auto uppercase tracking-widest opacity-60"
          >
            Premium debugging, encoding, and verification for JSON Web Tokens.
          </motion.p>
        </div>

        <div className={cn(
            "grid grid-cols-1 gap-12",
            session?.user ? "lg:grid-cols-12" : "lg:grid-cols-1"
        )}>
            {/* Main Content Areas */}
            <div className={cn(
                "space-y-12",
                session?.user ? "lg:col-span-8 xl:col-span-9" : ""
            )}>
                {/* Global Secret Key Section */}
                <Card className="bg-card/50 border-border shadow-2xl relative overflow-hidden group rounded-[2rem]">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-end gap-6">
                            <div className="flex-1 space-y-4 w-full">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
                                        <Key className="w-4 h-4 text-blue-500" />
                                        Master Secret Key
                                    </Label>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setShowSecret(!showSecret)}
                                        className="h-8 px-4 text-[9px] font-black uppercase tracking-widest bg-muted/50 hover:bg-muted rounded-full"
                                    >
                                        {showSecret ? <EyeOff className="w-3.5 h-3.5 mr-2" /> : <Eye className="w-3.5 h-3.5 mr-2" />}
                                        {showSecret ? 'Hide' : 'Reveal'}
                                    </Button>
                                </div>
                                <div className="relative">
                                    <Input
                                        type={showSecret ? "text" : "password"}
                                        value={secret}
                                        onChange={(e) => setSecret(e.target.value)}
                                        className="h-16 pr-14 font-mono text-lg bg-background/50 border-border/50 focus:ring-4 focus:ring-blue-500/10 transition-all rounded-2xl"
                                        placeholder="Enter or generate a secret..."
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={generateSecret}
                                            className="h-10 w-10 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all active:scale-90"
                                            title="Generate random secret"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-1">
                                    <Info className="w-3.5 h-3.5 text-blue-500/50" />
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black opacity-40">Local cryptographic operations only.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="encode" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-16 bg-muted/30 p-1.5 rounded-[1.5rem] border border-border/50 shadow-inner">
                        <TabsTrigger value="encode" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all text-xs font-black uppercase tracking-widest flex gap-3">
                            <Lock className="w-4 h-4 text-blue-500" /> Encode
                        </TabsTrigger>
                        <TabsTrigger value="decode" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all text-xs font-black uppercase tracking-widest flex gap-3">
                            <Unlock className="w-4 h-4 text-indigo-500" /> Decode
                        </TabsTrigger>
                    </TabsList>

                    {/* ENCODE SECTION */}
                    <TabsContent value="encode" className="mt-8 space-y-8">
                        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                        <div className="xl:col-span-2 space-y-6">
                            <Card className="bg-card border-border/50 shadow-xl h-full overflow-hidden rounded-[2rem]">
                            <CardHeader className="bg-muted/30 border-b border-border/50 py-5 px-8">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                    <FileCode className="w-4 h-4 text-blue-500" />
                                    Payload JSON
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Textarea
                                    value={payload}
                                    onChange={(e) => setPayload(e.target.value)}
                                    className="min-h-[400px] font-mono text-sm p-8 bg-transparent border-none focus-visible:ring-0 resize-none transition-all"
                                    placeholder='{"sub": "1234", "name": "Admin"}'
                                />
                                <div className="p-6 border-t border-border/50 bg-muted/20">
                                    <Button 
                                        onClick={handleEncode}
                                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/20 transition-all transform active:scale-[0.98] flex gap-3"
                                    >
                                        Sign Token <Package className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                            </Card>
                        </div>

                        <div className="xl:col-span-3 space-y-6">
                            <Card className="bg-card border-border/50 shadow-xl h-full overflow-hidden flex flex-col rounded-[2rem]">
                            <CardHeader className="bg-muted/30 border-b border-border/50 py-5 px-8">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                        <Package className="w-4 h-4 text-emerald-500" />
                                        Generated JWT
                                    </CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(encodedToken, 'Token')}
                                        className={cn(
                                            "h-9 gap-2 px-5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                                            encodedToken ? 'opacity-100' : 'opacity-30 cursor-not-allowed'
                                        )}
                                        disabled={!encodedToken}
                                    >
                                        {copiedType === 'Token' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copiedType === 'Token' ? 'Done' : 'Copy'}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 flex-1 flex flex-col">
                                <div className="flex-1 p-8 font-mono text-sm break-all bg-zinc-950 text-blue-400 rounded-3xl border border-border shadow-inner min-h-[350px] overflow-y-auto whitespace-pre-wrap selection:bg-blue-500/30">
                                    {encodedToken ? (
                                        <motion.span 
                                            initial={{ opacity: 0 }} 
                                            animate={{ opacity: 1 }}
                                            className="leading-relaxed"
                                        >
                                            {encodedToken}
                                        </motion.span>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4 italic">
                                            <Lock className="w-10 h-10 opacity-10" />
                                            <p className="text-xs font-black uppercase tracking-widest opacity-40">Awaiting Signature</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 flex items-center gap-6 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2 opacity-50">
                                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Header</div>
                                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Payload</div>
                                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Sign</div>
                                </div>
                            </CardContent>
                            </Card>

                            {session?.user && encodedToken && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3 bg-card border border-border/50 px-6 py-4 rounded-[1.5rem] shadow-lg"
                            >
                                <Input
                                    placeholder="Name this JWT..."
                                    value={jwtName}
                                    onChange={(e) => setJwtName(e.target.value)}
                                    className="h-12 bg-muted/20 border-border/50 text-[11px] font-bold rounded-xl"
                                />
                                <Button
                                    onClick={handleSaveJwt}
                                    disabled={isSaving}
                                    className="h-12 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 whitespace-nowrap px-8 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                >
                                    <CloudDownload className="w-4 h-4 mr-2" />
                                    {isSaving ? 'Synching...' : 'Vault Save'}
                                </Button>
                            </motion.div>
                            )}
                        </div>
                        </div>
                    </TabsContent>

                    {/* DECODE SECTION */}
                    <TabsContent value="decode" className="mt-8 space-y-12">
                        <Card className="bg-card border-border/50 shadow-xl overflow-hidden rounded-[2rem]">
                        <CardHeader className="bg-muted/30 border-b border-border/50 py-5 px-8">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                            <Unlock className="w-4 h-4 text-indigo-500" />
                            Target Endpoint Token
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Textarea
                            value={tokenToDecode}
                            onChange={(e) => setTokenToDecode(e.target.value)}
                            className="h-32 font-mono text-sm p-8 bg-transparent border-none focus-visible:ring-0 resize-none transition-all break-all"
                            placeholder="Paste your base64 encoded JWT here..."
                            />
                        </CardContent>
                        </Card>

                        <AnimatePresence mode="wait">
                        {decodedHeader && (
                            <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-1 xl:grid-cols-12 gap-8"
                            >
                            <div className="xl:col-span-7 space-y-8">
                                <Card className="bg-card border-border/50 shadow-xl border-l-[6px] border-l-blue-500 relative overflow-hidden rounded-[2rem]">
                                <CardHeader className="py-5 px-8 flex flex-row items-center justify-between border-b border-muted/50">
                                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-blue-500">Header Spectrum</CardTitle>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => copyToClipboard(JSON.stringify(decodedHeader, null, 2), 'Header')}>
                                        <Copy className="w-3.5 h-3.5" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <pre className="text-sm font-mono p-6 bg-muted/20 rounded-2xl overflow-x-auto text-foreground border border-border/50">
                                    {JSON.stringify(decodedHeader, null, 2)}
                                    </pre>
                                </CardContent>
                                </Card>

                                <Card className="bg-card border-border/50 shadow-xl border-l-[6px] border-l-purple-500 relative overflow-hidden rounded-[2rem]">
                                <CardHeader className="py-5 px-8 flex flex-row items-center justify-between border-b border-muted/50">
                                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-purple-500">Payload Analysis</CardTitle>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => copyToClipboard(JSON.stringify(decodedPayload, null, 2), 'Payload')}>
                                        <Copy className="w-3.5 h-3.5" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <pre className="text-sm font-mono p-6 bg-muted/20 rounded-2xl overflow-x-auto text-foreground border border-border/50">
                                    {JSON.stringify(decodedPayload, null, 2)}
                                    </pre>
                                </CardContent>
                                </Card>
                            </div>

                            <div className="xl:col-span-5">
                                <Card className="bg-card border-border/50 shadow-2xl h-full flex flex-col items-center justify-center p-12 relative overflow-hidden rounded-[3rem]">
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/20 opacity-30" />
                                    
                                    <div className="relative z-10 w-full flex flex-col items-center gap-10">
                                        <div className="relative">
                                            {isVerified === true ? (
                                                <motion.div 
                                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                    className="w-32 h-32 rounded-full bg-emerald-500/10 flex items-center justify-center border-[8px] border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]"
                                                >
                                                    <ShieldCheck className="w-16 h-16 text-emerald-500" />
                                                </motion.div>
                                            ) : isVerified === false ? (
                                                <motion.div 
                                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                    className="w-32 h-32 rounded-full bg-red-500/10 flex items-center justify-center border-[8px] border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]"
                                                >
                                                    <ShieldAlert className="w-16 h-16 text-red-500" />
                                                </motion.div>
                                            ) : (
                                                <div className="w-32 h-32 rounded-full bg-zinc-500/10 flex items-center justify-center border-[8px] border-zinc-500/40 border-dashed opacity-40">
                                                    <Lock className="w-16 h-16 text-zinc-500" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-center space-y-3">
                                            <h3 className={cn(
                                                "text-3xl font-black uppercase tracking-tight",
                                                isVerified === true ? 'text-emerald-500' : isVerified === false ? 'text-red-500' : 'text-zinc-500'
                                            )}>
                                                {isVerified === true ? 'AUTHENTIC' : isVerified === false ? 'CORRUPT' : 'SCOPING'}
                                            </h3>
                                            <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto opacity-60">
                                                {isVerified === true 
                                                    ? 'Digital signature validated.' 
                                                    : isVerified === false 
                                                        ? 'Invalid signature detected.' 
                                                        : 'Awaiting master key.'}
                                            </p>
                                        </div>

                                        <div className="w-full h-px bg-border/50" />
                                        
                                        <div className="grid grid-cols-2 gap-8 w-full">
                                            <div className="space-y-2 text-center">
                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Algorithm</p>
                                                <p className="text-lg font-mono font-black text-foreground">{decodedHeader?.alg || '---'}</p>
                                            </div>
                                            <div className="space-y-2 text-center">
                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Type</p>
                                                <p className="text-lg font-mono font-black text-foreground">{decodedHeader?.typ || 'JWT'}</p>
                                            </div>
                                        </div>

                                        {isVerified === null && secret && (
                                            <div className="mt-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-[10px] text-blue-500 font-black uppercase tracking-widest text-center italic">
                                                Real-time verification active
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </TabsContent>
                </Tabs>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: ShieldCheck, title: "Zero Knowledge", desc: "No data is transmitted for processing. Entirely browser-based execution.", color: "text-blue-500", bg: "bg-blue-500/10" },
                        { icon: Key, title: "Secure Entropy", desc: "Native crypto random sequence generation for ultimate secret integrity.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                        { icon: Lock, title: "HS256 Compliant", desc: "Strict adherence to industry standards for HMAC SHA-256 signing.", color: "text-indigo-500", bg: "bg-indigo-500/10" }
                    ].map((item, i) => (
                        <div key={i} className="p-8 rounded-[2rem] bg-card border border-border/50 relative overflow-hidden group">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110", item.bg)}>
                                <item.icon className={cn("w-6 h-6", item.color)} />
                            </div>
                            <h4 className="text-xs font-black text-foreground mb-3 uppercase tracking-widest">{item.title}</h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cloud Vault Integrated Panel */}
            {session?.user && (
                <div className="lg:col-span-4 xl:col-span-3">
                    <Card className="bg-card border-border/50 shadow-2xl rounded-[2.5rem] sticky top-8 flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/50 p-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
                                    <Package className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Cloud Vault</h3>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Architect Identity Store</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            {savedJwts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-30 px-4">
                                <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center border-4 border-dashed border-muted-foreground/20">
                                    <Lock className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest">Vault Empty</p>
                                    <p className="text-[9px] font-medium leading-relaxed">Save your first token to unlock cloud synchronization across your devices.</p>
                                </div>
                            </div>
                            ) : (
                            <div className="space-y-4">
                                <AnimatePresence mode="popLayout">
                                {savedJwts.map((item) => (
                                    <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group flex flex-col p-5 rounded-[1.5rem] bg-muted/20 border border-border/50 hover:bg-muted/40 hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden"
                                    onClick={() => loadSavedJwt(item)}
                                    >
                                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteJwt(item.id);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-foreground uppercase tracking-tight truncate pr-8">{item.name}</span>
                                            <span className="text-[8px] text-muted-foreground/40 font-bold uppercase tracking-tighter">
                                                Stored {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <code className="text-[10px] bg-background/50 px-3 py-2 rounded-xl truncate text-blue-500/70 border border-border/30 font-mono">
                                            {item.token}
                                        </code>
                                        {item.secret && (
                                            <div className="pt-1">
                                                <span className="text-[8px] text-emerald-500 uppercase tracking-[0.2em] font-black flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-full w-fit">
                                                    <Key className="w-2.5 h-2.5" /> Key Secured
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    </motion.div>
                                ))}
                                </AnimatePresence>
                            </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
