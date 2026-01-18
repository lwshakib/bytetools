"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
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
  Plus
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type QRType = 'url' | 'text' | 'email' | 'wifi';

export default function QRCodePage() {
  const [value, setValue] = useState('https://bytetools.app');
  const [qrType, setQrType] = useState<QRType>('url');
  const [fgColor, setFgColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#00000000');
  const [size, setSize] = useState(256);
  const [includeMargin, setIncludeMargin] = useState(false);
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  
  // Scanner state
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

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
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
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
        (errorMessage) => {
          // ignore
        }
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
    <div className="flex flex-1 flex-col h-full bg-background overflow-hidden p-6 md:p-8 lg:p-12 items-center">
      <div className="w-full max-w-5xl space-y-8 h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-3 bg-amber-500/10 rounded-2xl mb-2"
            >
                <QrCode className="w-8 h-8 text-amber-500" />
            </motion.div>
            <h1 className="text-3xl font-black tracking-tighter uppercase sm:text-4xl">QR Hub</h1>
            <p className="text-muted-foreground text-sm font-medium opacity-60 uppercase tracking-widest">Generate & Scan with Precision</p>
        </div>

        <Tabs defaultValue="generate" className="w-full flex-1 flex flex-col items-center">
          <TabsList className="bg-muted/30 p-1 rounded-xl h-12 border border-border/40 mb-8 self-center">
            <TabsTrigger value="generate" className="rounded-lg px-8 h-10 font-bold uppercase tracking-widest text-[11px] data-[state=active]:bg-amber-500 data-[state=active]:text-black transition-all">
              <Plus className="w-3.5 h-3.5 mr-2" />
              Generator
            </TabsTrigger>
            <TabsTrigger value="scan" className="rounded-lg px-8 h-10 font-bold uppercase tracking-widest text-[11px] data-[state=active]:bg-amber-500 data-[state=active]:text-black transition-all">
              <Scan className="w-3.5 h-3.5 mr-2" />
              Scanner
            </TabsTrigger>
          </TabsList>

          {/* Generator Content */}
          <TabsContent value="generate" className="w-full flex-1 mt-0 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-start">
              {/* Controls */}
              <Card className="bg-card border-border/50 rounded-[2.5rem] shadow-xl overflow-hidden">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Content Type</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'url', icon: LinkIcon, label: 'Link' },
                        { id: 'text', icon: Type, label: 'Text' },
                        { id: 'email', icon: Mail, label: 'Email' },
                        { id: 'wifi', icon: Wifi, label: 'WiFi' },
                      ].map((type) => (
                        <Button
                          key={type.id}
                          variant={qrType === type.id ? 'secondary' : 'ghost'}
                          onClick={() => setQrType(type.id as QRType)}
                          className={cn(
                            "h-16 flex-col gap-1 rounded-2xl border transition-all",
                            qrType === type.id ? "bg-amber-500/10 border-amber-500 text-amber-500" : "border-border/50 text-muted-foreground"
                          )}
                        >
                          <type.icon className="w-5 h-5" />
                          <span className="text-[9px] font-black uppercase tracking-tight">{type.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {qrType === 'url' ? 'Link Address' : qrType === 'text' ? 'Message' : qrType === 'email' ? 'Email Address' : 'Wifi Configuration'}
                    </Label>
                    <Input 
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={qrType === 'url' ? 'https://example.com' : 'Enter content here...'}
                      className="h-14 font-bold bg-muted/20 border-border/50 rounded-2xl px-6 focus-visible:ring-amber-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Primary Color</Label>
                      <div className="flex items-center gap-3 bg-muted/20 p-2 rounded-2xl border border-border/50">
                        <input 
                          type="color" 
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                        />
                        <span className="text-xs font-mono font-bold opacity-60 uppercase tracking-widest">{fgColor}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Error Correction</Label>
                      <div className="grid grid-cols-4 gap-1 bg-muted/20 p-1 rounded-2xl border border-border/50">
                        {(['L', 'M', 'Q', 'H'] as const).map((l) => (
                          <Button 
                            key={l}
                            variant={level === l ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setLevel(l)}
                            className={cn(
                                "h-10 rounded-xl text-[10px] font-black",
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

              {/* Preview */}
              <div className="flex flex-col items-center justify-center space-y-8 h-full lg:pt-8">
                <div className="relative group">
                    <motion.div 
                        layoutId="qr-preview"
                        className="bg-white p-6 rounded-[2.5rem] shadow-2xl transition-all duration-500 transform group-hover:scale-[1.02] border-[12px] border-amber-500/20"
                    >
                        <QRCodeSVG 
                            id="qr-gen-svg"
                            value={value} 
                            size={size}
                            fgColor={fgColor}
                            bgColor={bgColor}
                            level={level}
                            includeMargin={includeMargin}
                        />
                    </motion.div>
                </div>

                <div className="flex items-center gap-4">
                    <Button 
                        onClick={downloadQR}
                        className="h-14 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-amber-500/20 transition-all active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        Download PNG
                    </Button>
                    <Button 
                        variant="ghost"
                        onClick={() => copyToClipboard(value)}
                        className="h-14 w-14 rounded-2xl border border-border/50 hover:bg-muted font-black"
                    >
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Scanner Content */}
          <TabsContent value="scan" className="w-full flex-1 mt-0 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* Camera View / File Upload */}
                <Card className="bg-card border-border/50 rounded-[2.5rem] shadow-xl overflow-hidden min-h-[400px] flex flex-col">
                    <CardContent className="p-8 flex-1 flex flex-col space-y-6">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scan Source</Label>
                            <div className="flex gap-2">
                                <Button 
                                    variant={isScanning ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={isScanning ? stopScanner : startScanner}
                                    className={cn(
                                        "rounded-xl h-9 px-4 font-bold text-[10px] uppercase tracking-widest gap-2",
                                        isScanning && "bg-amber-500 text-black"
                                    )}
                                >
                                    <Camera className="w-3.5 h-3.5" />
                                    {isScanning ? 'Stop Camera' : 'Use Camera'}
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 relative rounded-[1.5rem] overflow-hidden bg-muted/20 border border-border/50 min-h-[300px] flex flex-col items-center justify-center">
                            <div id="scanner-region" className={cn("w-full h-full", !isScanning && "hidden")} />
                            <div id="scanner-region-static" className="hidden" />
                            
                            {!isScanning && (
                                <div className="text-center space-y-6 p-8">
                                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto opacity-40">
                                        <Scan className="w-10 h-10" />
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-sm font-bold opacity-60">Upload an image to scan or start the camera</p>
                                        <label className="block">
                                            <div className="h-14 px-8 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-black uppercase tracking-widest text-xs gap-3 shadow-lg border border-border/50 flex items-center justify-center cursor-pointer transition-all active:scale-95">
                                                <Upload className="w-4 h-4" />
                                                Choose File
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
                <div className="flex flex-col space-y-6">
                    <Card className="bg-card border-border/50 rounded-[2.5rem] shadow-xl overflow-hidden flex-1">
                        <CardContent className="p-8 space-y-6">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scan Result</Label>
                            <div className="flex-1 min-h-[150px] bg-muted/20 border border-border/50 rounded-[1.5rem] p-6 flex flex-col">
                                {scanResult ? (
                                    <div className="space-y-4">
                                        <div className="break-all text-sm font-bold font-mono py-2">{scanResult}</div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button 
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => copyToClipboard(scanResult)}
                                                className="rounded-xl h-9 font-bold text-[10px] uppercase tracking-widest"
                                            >
                                                <Copy className="w-3.5 h-3.5 mr-2" />
                                                Copy Result
                                            </Button>
                                            {scanResult.startsWith('http') && (
                                              <Button 
                                                size="sm"
                                                variant="outline"
                                                asChild
                                                className="rounded-xl h-9 font-bold text-[10px] uppercase tracking-widest"
                                              >
                                                <a href={scanResult} target="_blank" rel="noopener noreferrer">
                                                  Open Link
                                                </a>
                                              </Button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center opacity-20 space-y-3">
                                        <RefreshCw className="w-8 h-8 animate-spin-slow" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Waiting for Scan...</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs font-black uppercase tracking-widest text-amber-500">Security Note</h4>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    QR codes can contain malicious links. Always preview the result before opening it in your browser. ByteTools process everything locally on your device.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Button 
                        variant="ghost" 
                        onClick={() => { setScanResult(null); stopScanner(); }}
                        className="h-14 rounded-2xl border border-border/50 font-black uppercase tracking-widest text-[10px] opacity-40 hover:opacity-100"
                    >
                        Clear Results
                    </Button>
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
