'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Lock,
  Package,
  Info,
  CloudDownload,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import * as jose from 'jose';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

export default function JWTToolPage() {
  const { data: session } = useSession();
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  /* Token payload state (JSON format) */
  const [payload, setPayload] = useState(
    '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}'
  );

  /* The generated JWT string after encoding */
  const [encodedToken, setEncodedToken] = useState('');

  /* The input string for decoding an existing JWT */
  const [tokenToDecode, setTokenToDecode] = useState('');

  /* Structured data from the decoded header/payload */
  const [decodedHeader, setDecodedHeader] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [decodedPayload, setDecodedPayload] = useState<Record<
    string,
    unknown
  > | null>(null);

  /* Validation status of the JWT's signature */
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  interface SavedJWT {
    id: string;
    name: string;
    token: string;
    secret?: string;
  }

  const [savedJwts, setSavedJwts] = useState<SavedJWT[]>([]);
  const [jwtName, setJwtName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const generateSecret = useCallback(() => {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
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

  const handleEncode = useCallback(async () => {
    if (!secret) {
      toast.error('Secret key required');
      return;
    }
    try {
      const parsedPayload = JSON.parse(payload);
      const secretUint8 = new TextEncoder().encode(secret);

      const token = await new jose.SignJWT(parsedPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secretUint8);

      setEncodedToken(token);
      toast.success('Token generated');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Error: ' + msg);
    }
  }, [payload, secret]);

  const handleDecode = useCallback(async () => {
    if (!tokenToDecode) {
      setDecodedHeader(null);
      setDecodedPayload(null);
      setIsVerified(null);
      return;
    }

    try {
      const header = jose.decodeProtectedHeader(tokenToDecode);
      const payload = jose.decodeJwt(tokenToDecode);

      setDecodedHeader(header);
      setDecodedPayload(payload);

      if (secret) {
        try {
          const secretUint8 = new TextEncoder().encode(secret);
          await jose.jwtVerify(tokenToDecode, secretUint8);
          setIsVerified(true);
        } catch {
          setIsVerified(false);
        }
      } else {
        setIsVerified(null);
      }
    } catch {
      setIsVerified(false);
      setDecodedHeader({ error: 'Invalid format' });
      setDecodedPayload({ error: 'Could not decode' });
    }
  }, [tokenToDecode, secret]);

  useEffect(() => {
    handleDecode();
  }, [tokenToDecode, secret, handleDecode]);

  const copyToClipboard = (text: string, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success(`${type} copied`);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const fetchSavedJwts = useCallback(async () => {
    if (!session?.user) return;
    try {
      const res = await fetch('/api/jwt');
      const data = await res.json();
      setSavedJwts(data);
    } catch {
      // Failed to fetch tokens
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      fetchSavedJwts();
    }
  }, [session?.user, fetchSavedJwts]);

  const handleSaveJwt = async () => {
    if (!session?.user) {
      toast.error('Sign in required');
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
          secret: secret || undefined,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        toast.success('Token saved');
        setJwtName('');
        fetchSavedJwts();
      } else {
        toast.error('Failed to save');
      }
    } catch {
      toast.error('Error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteJwt = async (id: string) => {
    try {
      const res = await fetch('/api/jwt', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        toast.success('Deleted');
        fetchSavedJwts();
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const loadSavedJwt = (item: SavedJWT) => {
    setTokenToDecode(item.token);
    if (item.secret) {
      setSecret(item.secret);
    }
    toast.success('JWT loaded');
  };

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 md:p-8 overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-8">
            <Card className="bg-card/40 border-border/50 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                      Secret Key
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSecret(!showSecret)}
                      className="h-7 px-3 text-[9px] font-bold uppercase tracking-widest hover:bg-muted rounded-md"
                    >
                      {showSecret ? (
                        <EyeOff className="w-3.5 h-3.5 mr-2" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 mr-2" />
                      )}
                      {showSecret ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showSecret ? 'text' : 'password'}
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      className="h-10 font-mono text-sm bg-muted/20 border-border/50 rounded-lg pr-10 focus:ring-0"
                      placeholder="Secret key..."
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={generateSecret}
                        className="h-8 w-8 text-muted-foreground hover:text-primary rounded-md"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="encode" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-10 bg-muted/40 p-1 rounded-lg border border-border/50">
                <TabsTrigger
                  value="encode"
                  className="rounded-md text-[10px] font-bold uppercase transition-all"
                >
                  Encode
                </TabsTrigger>
                <TabsTrigger
                  value="decode"
                  className="rounded-md text-[10px] font-bold uppercase transition-all"
                >
                  Decode
                </TabsTrigger>
              </TabsList>

              <TabsContent value="encode" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <Card className="bg-card/40 border-border/50 rounded-2xl overflow-hidden">
                    <CardHeader className="p-6 pb-2">
                      <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        Payload JSON
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 space-y-4">
                      <Textarea
                        value={payload}
                        onChange={(e) => setPayload(e.target.value)}
                        className="min-h-[200px] font-mono text-sm bg-muted/10 border-border/50 focus-visible:ring-0 resize-none rounded-lg p-4"
                        placeholder='{"sub": "1234"}'
                      />
                      <Button
                        onClick={handleEncode}
                        size="sm"
                        className="w-full h-10 bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-none"
                      >
                        Generate Token
                      </Button>
                    </CardContent>
                  </Card>

                  {encodedToken && (
                    <Card className="bg-card/40 border-border/50 rounded-2xl overflow-hidden">
                      <CardHeader className="p-6 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                            Encoded Result
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(encodedToken, 'Token')
                            }
                            className="h-7 px-3 text-[9px] font-bold uppercase tracking-widest rounded-md"
                          >
                            {copiedType === 'Token' ? (
                              <Check className="w-3 h-3 mr-2" />
                            ) : (
                              <Copy className="w-3 h-3 mr-2" />
                            )}
                            Copy
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-0 space-y-4">
                        <div className="p-4 font-mono text-xs break-all bg-muted/20 text-blue-500 rounded-lg border border-border/50 min-h-[100px]">
                          {encodedToken}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Token name..."
                            value={jwtName}
                            onChange={(e) => setJwtName(e.target.value)}
                            disabled={!session?.user}
                            className="h-9 bg-muted/10 border-border/50 text-xs font-medium rounded-md"
                          />
                          <Button
                            onClick={handleSaveJwt}
                            disabled={isSaving || !session?.user}
                            size="sm"
                            className="h-9 px-4 bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 rounded-md text-[10px] font-bold uppercase tracking-widest whitespace-nowrap shadow-none"
                          >
                            <CloudDownload className="w-3.5 h-3.5 mr-2" />
                            Save
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="decode" className="mt-6 space-y-6">
                <Card className="bg-card/40 border-border/50 rounded-2xl overflow-hidden">
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                      Token to decode
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <Textarea
                      value={tokenToDecode}
                      onChange={(e) => setTokenToDecode(e.target.value)}
                      className="h-24 font-mono text-sm bg-muted/10 border-border/50 focus-visible:ring-0 resize-none rounded-lg p-4"
                      placeholder="Paste JWT..."
                    />
                  </CardContent>
                </Card>

                {decodedHeader && (
                  <div className="grid grid-cols-1 gap-6">
                    <Card className="bg-card/40 border-border/50 rounded-2xl overflow-hidden">
                      <CardHeader className="p-6 pb-2 border-b border-border/5 flex flex-row items-center justify-between">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                          Header
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-md"
                          onClick={() =>
                            copyToClipboard(
                              JSON.stringify(decodedHeader, null, 2),
                              'Header'
                            )
                          }
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-6">
                        <pre className="text-xs font-mono p-4 bg-muted/10 rounded-lg overflow-x-auto text-foreground border border-border/5">
                          {JSON.stringify(decodedHeader, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                    <Card className="bg-card/40 border-border/50 rounded-2xl overflow-hidden">
                      <CardHeader className="p-6 pb-2 border-b border-border/5 flex flex-row items-center justify-between">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                          Payload
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-md"
                          onClick={() =>
                            copyToClipboard(
                              JSON.stringify(decodedPayload, null, 2),
                              'Payload'
                            )
                          }
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-6">
                        <pre className="text-xs font-mono p-4 bg-muted/10 rounded-lg overflow-x-auto text-foreground border border-border/5">
                          {JSON.stringify(decodedPayload, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>

                    <div
                      className={cn(
                        'p-6 rounded-2xl border flex items-center justify-between',
                        isVerified === true
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600'
                          : isVerified === false
                            ? 'bg-red-500/5 border-red-500/20 text-red-600'
                            : 'bg-muted/10 border-border/50 text-muted-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {isVerified === true ? (
                          <ShieldCheck className="w-5 h-5" />
                        ) : isVerified === false ? (
                          <ShieldAlert className="w-5 h-5" />
                        ) : (
                          <Info className="w-5 h-5" />
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {isVerified === true
                            ? 'Signature Verified'
                            : isVerified === false
                              ? 'Invalid Signature'
                              : 'No Secret Provided'}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] font-bold uppercase opacity-40">
                            Algorithm
                          </span>
                          <span className="text-xs font-mono font-bold">
                            {String(decodedHeader?.alg || '---')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="md:col-span-4 space-y-8">
            {session?.user ? (
              <Card className="bg-card/40 border-border/50 shadow-sm rounded-2xl overflow-hidden h-fit">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/50">
                    Vault
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {savedJwts.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-20">
                      <Package className="w-8 h-8" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        Vault empty
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {savedJwts.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col p-3 bg-muted/20 border border-border/50 rounded-lg group hover:border-primary/20 transition-all cursor-pointer"
                          onClick={() => loadSavedJwt(item)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-foreground truncate">
                              {item.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-md text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteJwt(item.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <code className="text-[9px] bg-background/50 px-2 py-1 rounded border border-border/5 truncate opacity-60">
                            {item.token}
                          </code>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div
                className="flex flex-col items-center justify-center p-8 bg-primary/5 border border-primary/10 rounded-2xl cursor-pointer text-center space-y-3"
                onClick={() =>
                  document.getElementById('signin-trigger')?.click()
                }
              >
                <Lock className="w-6 h-6 text-primary/60 mx-auto" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                  Sign in to sync tokens
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
