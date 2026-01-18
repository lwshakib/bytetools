"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, RefreshCw, Check, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function PasswordGeneratorPage() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState({ score: 0, label: 'Weak', color: 'text-red-500', bg: 'bg-red-500' });

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

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success('Password copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Advanced Password Generator</h1>
          <p className="text-muted-foreground">Generate secure, random passwords to keep your accounts safe.</p>
        </div>

        <Card className="bg-card border-border shadow-2xl overflow-hidden">
          <CardHeader className="bg-transparent border-b border-border">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-foreground">Generated Password</CardTitle>
                <CardDescription className="text-muted-foreground">Securely generated in your browser</CardDescription>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 border border-border/50 ${strength.color}`}>
                {strength.score < 3 ? <ShieldAlert className="w-4 h-4" /> : strength.score < 5 ? <Shield className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                <span className="text-xs font-bold uppercase tracking-wider">{strength.label}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="relative group">
              <Input
                readOnly
                value={password}
                className="h-16 text-2xl md:text-3xl font-mono text-center bg-muted/30 border-border text-foreground pr-12 focus-visible:ring-primary/50 transition-all group-hover:bg-muted/50"
                placeholder="Password"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={generatePassword}
                  className="text-muted-foreground hover:text-foreground hover:bg-background/80"
                >
                  <RefreshCw className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  className={`${copied ? 'text-green-500' : 'text-muted-foreground hover:text-foreground'} hover:bg-background/80`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 h-1 transition-all duration-500 ease-out rounded-full" 
                   style={{ width: `${(strength.score / 6) * 100}%`, backgroundColor: strength.bg.replace('bg-', '') }} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-muted-foreground">Password Length</Label>
                    <span className="text-foreground font-mono text-lg bg-muted px-2 py-0.5 rounded border border-border">{length}</span>
                  </div>
                  <Slider
                    value={[length]}
                    onValueChange={(val) => setLength(val[0])}
                    min={4}
                    max={64}
                    step={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest px-1">
                    <span>Weak (4)</span>
                    <span>Secure (16+)</span>
                    <span>Max (64)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div 
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/10 hover:bg-muted/30 cursor-pointer transition-all"
                  onClick={() => setIncludeUppercase(!includeUppercase)}
                >
                  <div className="space-y-0.5">
                    <Label className="text-foreground cursor-pointer">Uppercase</Label>
                    <p className="text-xs text-muted-foreground">ABC...</p>
                  </div>
                  <Checkbox checked={includeUppercase} onCheckedChange={() => {}} />
                </div>

                <div 
                   className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/10 hover:bg-muted/30 cursor-pointer transition-all"
                   onClick={() => setIncludeLowercase(!includeLowercase)}
                >
                  <div className="space-y-0.5">
                    <Label className="text-foreground cursor-pointer">Lowercase</Label>
                    <p className="text-xs text-muted-foreground">abc...</p>
                  </div>
                  <Checkbox checked={includeLowercase} onCheckedChange={() => {}} />
                </div>

                <div 
                   className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/10 hover:bg-muted/30 cursor-pointer transition-all"
                   onClick={() => setIncludeNumbers(!includeNumbers)}
                >
                  <div className="space-y-0.5">
                    <Label className="text-foreground cursor-pointer">Numbers</Label>
                    <p className="text-xs text-muted-foreground">123...</p>
                  </div>
                  <Checkbox checked={includeNumbers} onCheckedChange={() => {}} />
                </div>

                <div 
                   className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/10 hover:bg-muted/30 cursor-pointer transition-all"
                   onClick={() => setIncludeSymbols(!includeSymbols)}
                >
                  <div className="space-y-0.5">
                    <Label className="text-foreground cursor-pointer">Symbols</Label>
                    <p className="text-xs text-muted-foreground">!@#...</p>
                  </div>
                  <Checkbox checked={includeSymbols} onCheckedChange={() => {}} />
                </div>
              </div>
            </div>

            <Button 
                onClick={generatePassword}
                className="w-full h-14 text-lg font-bold transition-all rounded-xl shadow-lg mt-4"
            >
              Generate Secure Password
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border/50 space-y-1">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Privacy First</p>
                <p className="text-xs text-muted-foreground/70">Passwords are generated locally on your device and are never sent to any server.</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/50 space-y-1">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Crypto-Secure</p>
                <p className="text-xs text-muted-foreground/70">Uses cryptographically strong random number generator (window.crypto).</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/50 space-y-1">
                <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Customizable</p>
                <p className="text-xs text-muted-foreground/70">Full control over character sets and length for specific security requirements.</p>
            </div>
        </div>
      </div>
    </div>
  );
}

