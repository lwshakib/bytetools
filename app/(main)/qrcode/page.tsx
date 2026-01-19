"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  QrCode, 
  Scan, 
  Download, 
  Copy, 
  Image as ImageIcon, 
  Camera, 
  RefreshCw,
  Link as LinkIcon,
  Type,
  Mail,
  Wifi,
  Upload,
  Plus,
  CloudDownload,
  Trash2,
  Package,
  Check,
  ShieldCheck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '@/lib/auth-client';

type QRType = 'url' | 'text' | 'email' | 'wifi';

export default function QRCodePage() {
  const { data: session } = useSession();
  const [value, setValue] = useState('https://bytetools.app');
  const [qrType, setQrType] = useState<QRType>('url');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#00000000');
  const [size, setSize] = useState(256);
  const [includeMargin, setIncludeMargin] = useState(false);
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [qrName, setQrName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedQrCodes, setSavedQrCodes] = useState<any[]>([]);
  const [copyingValue, setCopyingValue] = useState(false);
  
  // Scanner state
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const fetchSavedQrCodes = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch('/api/qrcode');
      const data = await res.json();
      setSavedQrCodes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchSavedQrCodes();
    }
  }, [session?.user]);

  const handleSaveQr = async () => {
    if (!session?.user) {
      toast.error('You must be signed in to usage the Optical Vault', {
        description: 'Secure storage protocols require authentication.'
      });
      return;
    }
    if (!value) {
      toast.error('No content to save');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: qrName || `QR ${qrType.toUpperCase()}`,
          content: value,
          fgColor: fgColor,
          level: level
        })
      });

      if (res.ok) {
        toast.success('Optical configuration saved to vault');
        setQrName('');
        fetchSavedQrCodes();
      }
    } catch (err) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQr = async (id: string) => {
    try {
      const res = await fetch('/api/qrcode', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        toast.success('Deleted');
        fetchSavedQrCodes();
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const loadSavedQr = (item: any) => {
    setValue(item.content);
    setFgColor(item.fgColor);
    setLevel(item.level as any);
    toast.success('Configuration Restored');
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-gen-svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qrcode-${Date.now()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const copyToClipboard = (text: string) => {
    setCopyingValue(true);
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopyingValue(false), 2000);
  };

  const startScanner = async () => {
    if (scannerRef.current) return;
    
    try {
      const scanner = new Html5Qrcode("scanner-region");
      scannerRef.current = scanner;
      setScanResult(null);
      setIsScanning(true);
      
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setScanResult(decodedText);
          scanner.stop();
          scannerRef.current = null;
          setIsScanning(false);
          toast.success('QR Code Scanned!');
        },
        () => {}
      );
    } catch (err) {
      console.error(err);
      toast.error('Could not access camera');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode("scanner-region-static");
      const result = await html5QrCode.scanFile(file, true);
      setScanResult(result);
      toast.success('QR Code Scanned from Image!');
    } catch (err) {
      console.error(err);
      toast.error('No QR code found in this image');
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-y-auto p-6 md:p-8 lg:p-12">
      <div className={cn(
        "w-full mx-auto space-y-12 transition-all duration-500",
        session?.user ? "max-w-7xl" : "max-w-5xl"
      )}>
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2"
            >
                <QrCode className="w-3.5 h-3.5" />
                Optical Hub Active
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase">QR HUB</h1>
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.3em] opacity-40">Precision Generation & Real-time Scanning</p>
        </div>

        <div className={cn(
            "grid grid-cols-1 gap-12",
            session?.user ? "lg:grid-cols-12" : "lg:grid-cols-1"
        )}>
          {/* Main Content Area */}
          <div className={cn(
            "space-y-12",
            session?.user ? "lg:col-span-8 xl:col-span-9" : ""
          )}>
            <Tabs defaultValue="generate" className="w-full flex flex-col items-center">
              <TabsList className="bg-muted/30 p-1.5 rounded-2xl h-16 border border-border/50 mb-12 self-stretch grid grid-cols-2 shadow-inner">
                <TabsTrigger value="generate" className="rounded-xl font-black uppercase tracking-widest text-[11px] data-[state=active]:bg-background data-[state=active]:text-amber-500 shadow-xl transition-all h-full gap-3">
                  <Plus className="w-4 h-4" />
                  Generator Protocol
                </TabsTrigger>
                <TabsTrigger value="scan" className="rounded-xl font-black uppercase tracking-widest text-[11px] data-[state=active]:bg-background data-[state=active]:text-amber-500 shadow-xl transition-all h-full gap-3">
                  <Scan className="w-4 h-4" />
                  Scanner Interface
                </TabsTrigger>
              </TabsList>

              {/* Generator Content */}
              <TabsContent value="generate" className="w-full mt-0 outline-none">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
                  {/* Controls */}
                  <Card className="bg-card/50 border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                    <CardContent className="p-10 space-y-10">
                      <div className="space-y-6">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">1. Content Protocol</Label>
                        <div className="grid grid-cols-4 gap-3">
                          {[
                            { id: 'url', icon: LinkIcon, label: 'Link' },
                            { id: 'text', icon: Type, label: 'Text' },
                            { id: 'email', icon: Mail, label: 'Mail' },
                            { id: 'wifi', icon: Wifi, label: 'WiFi' },
                          ].map((type) => (
                            <Button
                              key={type.id}
                              variant="ghost"
                              onClick={() => setQrType(type.id as QRType)}
                              className={cn(
                                "h-20 flex-col gap-2 rounded-2xl border transition-all duration-300",
                                qrType === type.id 
                                  ? "bg-amber-500/10 border-amber-500/50 text-amber-500 shadow-lg shadow-amber-500/5" 
                                  : "border-border/50 text-muted-foreground hover:bg-muted/50"
                              )}
                            >
                              <type.icon className="w-5 h-5" />
                              <span className="text-[9px] font-black uppercase tracking-tighter">{type.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">2. Input Data Streams</Label>
                        <Input 
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          placeholder={qrType === 'url' ? 'https://example.com' : 'Target data input...'}
                          className="h-16 font-mono font-bold bg-muted/20 border-border/50 rounded-2xl px-8 focus:ring-4 focus:ring-amber-500/10 transition-all text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">3. Visual Identification</Label>
                          <div className="flex items-center gap-4 bg-muted/20 p-3 rounded-2xl border border-border/50">
                            <input 
                              type="color" 
                              value={fgColor}
                              onChange={(e) => setFgColor(e.target.value)}
                              className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none appearance-none"
                            />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black opacity-30 uppercase">HEX CODE</span>
                              <span className="text-xs font-mono font-bold uppercase tracking-widest">{fgColor}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">4. Recovery Calibration</Label>
                          <div className="grid grid-cols-4 gap-2 bg-muted/20 p-2 rounded-2xl border border-border/50 h-16">
                            {(['L', 'M', 'Q', 'H'] as const).map((l) => (
                              <Button 
                                key={l}
                                variant="ghost"
                                size="sm"
                                onClick={() => setLevel(l)}
                                className={cn(
                                    "h-full rounded-xl text-[10px] font-black transition-all",
                                    level === l && "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                                )}
                              >
                                {l}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preview Area */}
                  <div className="flex flex-col items-center justify-center space-y-12 h-full">
                    <div className="relative group">
                        <div className="absolute -inset-10 bg-amber-500/5 blur-[100px] rounded-full group-hover:bg-amber-500/10 transition-all opacity-50" />
                        <motion.div 
                            layoutId="qr-preview"
                            className="bg-white p-8 rounded-[3rem] shadow-2xl transition-all duration-700 transform group-hover:scale-[1.05] group-hover:rotate-1 border-[16px] border-amber-500/10 relative z-10"
                        >
                            <QRCodeSVG 
                                id="qr-gen-svg"
                                value={value || ' '} 
                                size={size}
                                fgColor={fgColor}
                                bgColor={bgColor}
                                level={level}
                                includeMargin={includeMargin}
                            />
                        </motion.div>
                    </div>

                    <div className="w-full max-w-sm space-y-4">
                      <div className="flex items-center gap-4">
                        <Button 
                            onClick={downloadQR}
                            className="h-16 flex-1 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-widest text-xs gap-3 shadow-2xl shadow-amber-500/20 transition-all active:scale-95"
                        >
                            <Download className="w-5 h-5" />
                            Render PNG
                        </Button>
                        <Button 
                            variant="ghost"
                            onClick={() => copyToClipboard(value)}
                            className="h-16 w-16 rounded-2xl border border-border/50 hover:bg-muted font-black bg-card shadow-xl"
                        >
                            {copyingValue ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                        </Button>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 bg-card border border-border/50 p-4 rounded-2xl shadow-xl relative overflow-hidden"
                      >
                         {!session?.user && (
                            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center cursor-pointer" onClick={() => document.getElementById('signin-trigger')?.click()}>
                                <div className="flex items-center gap-2 px-4 py-2 bg-background/80 border border-border/50 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
                                    <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Authenticate to Vault</span>
                                </div>
                            </div>
                        )}
                        <Input
                          placeholder="Snapshot Descriptor..."
                          value={qrName}
                          onChange={(e) => setQrName(e.target.value)}
                          disabled={!session?.user}
                          className="h-12 bg-muted/20 border-border/50 text-[11px] font-bold rounded-xl"
                        />
                        <Button 
                          onClick={handleSaveQr}
                          disabled={isSaving || !session?.user}
                          className="h-12 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/20 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                        >
                          <CloudDownload className="w-4 h-4 mr-2" />
                          {isSaving ? 'Syncing...' : 'Vault Save'}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Scanner Content */}
              <TabsContent value="scan" className="w-full mt-0 outline-none">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 h-full">
                    {/* Camera View / File Upload */}
                    <Card className="bg-card/50 border-border/50 rounded-[3rem] shadow-2xl overflow-hidden min-h-[500px] flex flex-col relative">
                        <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500" />
                        <CardContent className="p-10 flex-1 flex flex-col space-y-8">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Optical Input Stream</Label>
                                <Button 
                                    variant={isScanning ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={isScanning ? stopScanner : startScanner}
                                    className={cn(
                                        "rounded-full h-10 px-6 font-black text-[10px] uppercase tracking-widest gap-3 transition-all",
                                        isScanning ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "border-border/50"
                                    )}
                                >
                                    <Camera className="w-4 h-4" />
                                    {isScanning ? 'Terminate Feed' : 'Launch Optical'}
                                </Button>
                            </div>

                            <div className="flex-1 relative rounded-[2.5rem] overflow-hidden bg-zinc-950 border-8 border-border/10 min-h-[350px] flex flex-col items-center justify-center shadow-inner">
                                <div id="scanner-region" className={cn("w-full h-full object-cover", !isScanning && "hidden")} />
                                <div id="scanner-region-static" className="hidden" />
                                
                                {!isScanning && (
                                    <div className="text-center space-y-8 p-10 max-w-xs">
                                        <div className="w-24 h-24 bg-muted/10 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-muted-foreground/20 animate-pulse">
                                            <Scan className="w-10 h-10 opacity-10" />
                                        </div>
                                        <div className="space-y-6">
                                            <p className="text-[11px] font-black uppercase tracking-widest opacity-30 leading-relaxed tabular-nums">Awaiting visual synchronization</p>
                                            <label className="block">
                                                <div className="h-16 px-10 rounded-2xl bg-muted/50 hover:bg-muted text-foreground font-black uppercase tracking-widest text-xs gap-4 shadow-xl border border-border/50 flex items-center justify-center cursor-pointer transition-all active:scale-95 group">
                                                    <Upload className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                                                    Inject Static Image
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        accept="image/*"
                                                        onChange={handleFileUpload}
                                                    />
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Result View */}
                    <div className="flex flex-col space-y-8">
                        <Card className="bg-card/50 border-border/50 rounded-[3rem] shadow-2xl overflow-hidden flex-1 relative">
                            <CardContent className="p-10 space-y-8">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Decoded Metadata Matrix</Label>
                                <div className="flex-1 min-h-[200px] bg-zinc-950 border border-border/50 rounded-[2rem] p-8 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                                    {scanResult ? (
                                        <div className="space-y-8 w-full text-center">
                                            <div className="break-all text-sm font-black font-mono py-4 text-amber-500 leading-relaxed tabular-nums">{scanResult}</div>
                                            <div className="flex flex-wrap gap-4 justify-center">
                                                <Button 
                                                    onClick={() => copyToClipboard(scanResult)}
                                                    className="rounded-xl h-12 px-8 font-black text-[10px] uppercase tracking-widest bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20"
                                                >
                                                    <Copy className="w-4 h-4 mr-3" />
                                                    Copy Payload
                                                </Button>
                                                {scanResult.startsWith('http') && (
                                                  <Button 
                                                    asChild
                                                    className="rounded-xl h-12 px-8 font-black text-[10px] uppercase tracking-widest bg-white/5 hover:bg-white/10 text-foreground border border-border/50"
                                                  >
                                                    <a href={scanResult} target="_blank" rel="noopener noreferrer">
                                                      Redirect URL
                                                    </a>
                                                  </Button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-5">
                                            <RefreshCw className="w-12 h-12 animate-spin-slow" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Data Capture</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-3">
                                      <ShieldCheck className="w-4 h-4" />
                                      Security Verification
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground/60 leading-relaxed font-black uppercase tracking-tighter italic">
                                        Optical encryption algorithms are parsed client-side. Validate all URIs before execution.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Button 
                            variant="ghost" 
                            onClick={() => { setScanResult(null); stopScanner(); }}
                            className="h-16 rounded-2xl border border-border/20 font-black uppercase tracking-widest text-[10px] opacity-40 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
                        >
                            Flush Captured Memory
                        </Button>
                    </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Tech Specs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                {[
                    { icon: ShieldCheck, title: "Zero Data Leach", desc: "Native local processing only. No metadata ever leaves your secure environment.", color: "text-amber-500", bg: "bg-amber-500/10" },
                    { icon: RefreshCw, title: "Quantum Parity", desc: "Advanced error correction levels (L/M/Q/H) for maximum data integrity.", color: "text-blue-500", bg: "bg-blue-500/10" },
                    { icon: Package, title: "Cloud Mesh", desc: "Architect level synchronization for all your optical identifiers.", color: "text-emerald-500", bg: "bg-emerald-500/10" }
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

          {/* Cloud Vault Side Panel */}
          {/* Cloud Vault Side Panel */}
          <div className="lg:col-span-4 xl:col-span-3">
              <Card className="bg-card border-border/50 shadow-2xl rounded-[2.5rem] sticky top-8 flex flex-col h-[calc(100vh-8rem)] overflow-hidden relative">
                  {!session?.user && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md cursor-pointer group/vault" onClick={() => document.getElementById('signin-trigger')?.click()}>
                            <div className="flex flex-col items-center gap-6 px-10 text-center">
                                <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-2xl transition-transform group-hover/vault:scale-110">
                                    <QrCode className="w-10 h-10 text-amber-500" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Vault Locked</h4>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Authenticate to synchronize and manage your optical metadata archive.</p>
                                </div>
                                <Button className="h-12 bg-amber-500 text-black rounded-xl px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">
                                    Verify Identity
                                </Button>
                            </div>
                        </div>
                    )}
                  <CardHeader className="bg-muted/30 border-b border-border/50 p-10">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shadow-inner">
                              <Package className="w-6 h-6 text-amber-500" />
                          </div>
                          <div className="flex flex-col">
                              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Archive Vault</h3>
                              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">Optical Metadata</p>
                          </div>
                      </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                      {savedQrCodes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-8 opacity-20 px-6">
                          <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center border-4 border-dashed border-muted-foreground/20">
                              <QrCode className="w-10 h-10" />
                          </div>
                          <div className="space-y-4">
                              <p className="text-[10px] font-black uppercase tracking-widest">Vault Secured</p>
                              <p className="text-[9px] font-bold leading-relaxed uppercase tracking-tighter">Awaiting first optical capture for cloud synchronization.</p>
                          </div>
                      </div>
                      ) : (
                      <div className="space-y-4">
                          <AnimatePresence mode="popLayout">
                          {savedQrCodes.map((item) => (
                              <motion.div
                              key={item.id}
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="group flex flex-col p-6 rounded-[2rem] bg-muted/20 border border-border/50 hover:bg-muted/40 hover:border-amber-500/20 transition-all cursor-pointer relative overflow-hidden"
                              onClick={() => loadSavedQr(item)}
                              >
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteQr(item.id);
                                      }}
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
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border-4 border-amber-500/10 shadow-lg">
                                          <QRCodeSVG 
                                              value={item.content} 
                                              size={32} 
                                              fgColor={item.fgColor} 
                                              level={item.level} 
                                          />
                                      </div>
                                      <code className="text-[10px] bg-background/50 px-3 py-2 rounded-xl truncate text-amber-600 font-mono flex-1 border border-border/20">
                                          {item.content}
                                      </code>
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
