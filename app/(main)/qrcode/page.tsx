'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Link as LinkIcon,
  Type,
  Mail,
  Wifi,
  CloudDownload,
  Trash2,
  Package,
  Check,
  Camera,
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
  /* The content to be encoded into the QR code */
  const [value, setValue] = useState('https://bytetools.app');

  /* Current type of content (URL, Text, Email, WiFi) */
  const [qrType, setQrType] = useState<QRType>('url');

  /* Visual configuration for the QR code */
  const [fgColor, setFgColor] = useState('#000000');
  const [size, setSize] = useState(256);
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');

  interface SavedQRCode {
    id: string;
    name: string;
    content: string;
    fgColor: string;
    level: 'L' | 'M' | 'Q' | 'H';
  }

  /* State for saving QR configurations to the cloud vault */
  const [qrName, setQrName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedQrCodes, setSavedQrCodes] = useState<SavedQRCode[]>([]);
  const [copyingValue, setCopyingValue] = useState(false);

  /* Scanning logic states */
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  /* Reference for the HTML5 QR Scanner instance */
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const fetchSavedQrCodes = useCallback(async () => {
    if (!session?.user) return;
    try {
      const res = await fetch('/api/qrcode');
      const data = await res.json();
      setSavedQrCodes(data);
    } catch {
      // Failed to fetch QR codes
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      fetchSavedQrCodes();
    }
  }, [session?.user, fetchSavedQrCodes]);

  const handleSaveQr = async () => {
    if (!session?.user) {
      toast.error('Sign in required');
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
          level: level,
        }),
      });

      if (res.ok) {
        toast.success('Saved to vault');
        setQrName('');
        fetchSavedQrCodes();
      }
    } catch {
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
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success('Deleted');
        fetchSavedQrCodes();
      }
    } catch {
      toast.error('Delete failed');
    }
  };

  const loadSavedQr = (item: SavedQRCode) => {
    setValue(item.content);
    setFgColor(item.fgColor);
    setLevel(item.level);
    toast.success('Config Loaded');
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
    toast.success('Copied');
    setTimeout(() => setCopyingValue(false), 2000);
  };

  const startScanner = async () => {
    if (scannerRef.current) return;
    try {
      const scanner = new Html5Qrcode('scanner-region');
      scannerRef.current = scanner;
      setScanResult(null);
      setIsScanning(true);
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setScanResult(decodedText);
          scanner.stop();
          scannerRef.current = null;
          setIsScanning(false);
          toast.success('Decoded');
        },
        () => {}
      );
    } catch {
      toast.error('Camera access failed');
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

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-10 bg-muted/40 p-1 rounded-lg border border-border/50">
            <TabsTrigger
              value="generate"
              className="rounded-md text-[10px] font-bold uppercase transition-all"
            >
              Generator
            </TabsTrigger>
            <TabsTrigger
              value="scan"
              className="rounded-md text-[10px] font-bold uppercase transition-all"
            >
              Scanner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-7 space-y-6">
                <Card className="bg-card/40 border-border/50 rounded-2xl overflow-hidden shadow-sm">
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        Content Type
                      </Label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'url', icon: LinkIcon, label: 'URL' },
                          { id: 'text', icon: Type, label: 'Text' },
                          { id: 'email', icon: Mail, label: 'Email' },
                          { id: 'wifi', icon: Wifi, label: 'WiFi' },
                        ].map((type) => (
                          <Button
                            key={type.id}
                            variant="ghost"
                            onClick={() => setQrType(type.id as QRType)}
                            className={cn(
                              'h-14 flex-col gap-1 rounded-xl border transition-all',
                              qrType === type.id
                                ? 'bg-primary/5 border-primary/20 text-primary shadow-sm'
                                : 'border-border/50 text-muted-foreground'
                            )}
                          >
                            <type.icon className="w-4 h-4" />
                            <span className="text-[8px] font-bold uppercase">
                              {type.label}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        Data Stream
                      </Label>
                      <Input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="h-10 bg-muted/20 border-border/50 rounded-lg px-4 text-xs font-medium focus:ring-0"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                          Color Palette
                        </Label>
                        <div className="flex items-center gap-3 bg-muted/10 p-2 rounded-xl border border-border/50">
                          <input
                            type="color"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none"
                          />
                          <span className="text-[10px] font-mono font-bold uppercase opacity-50">
                            {fgColor}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                          Precision
                        </Label>
                        <div className="grid grid-cols-4 gap-1 bg-muted/10 p-1 rounded-xl border border-border/50">
                          {(['L', 'M', 'Q', 'H'] as const).map((l) => (
                            <Button
                              key={l}
                              variant="ghost"
                              size="sm"
                              onClick={() => setLevel(l)}
                              className={cn(
                                'h-8 rounded-lg text-[10px] font-bold',
                                level === l &&
                                  'bg-background shadow-sm text-primary'
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

                <div className="flex gap-2">
                  <Input
                    placeholder="Config name..."
                    value={qrName}
                    onChange={(e) => setQrName(e.target.value)}
                    disabled={!session?.user}
                    className="h-10 bg-muted/10 border-border/50 text-xs font-medium rounded-lg"
                  />
                  <Button
                    onClick={handleSaveQr}
                    disabled={isSaving || !session?.user}
                    size="sm"
                    className="h-10 px-4 bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-none"
                  >
                    <CloudDownload className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Vault'}
                  </Button>
                </div>
              </div>

              <div className="md:col-span-5 flex flex-col items-center justify-center space-y-8">
                <div className="relative group">
                  <div className="absolute -inset-10 bg-primary/5 blur-3xl rounded-full opacity-50" />
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-border/5 relative z-10 transition-transform hover:scale-105">
                    <QRCodeSVG
                      id="qr-gen-svg"
                      value={value || ' '}
                      size={180}
                      fgColor={fgColor}
                      bgColor="#ffffff00"
                      level={level}
                      includeMargin={false}
                    />
                  </div>
                </div>
                <div className="flex gap-3 w-full">
                  <Button
                    onClick={downloadQR}
                    className="h-10 flex-1 rounded-lg bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] gap-2 shadow-none"
                  >
                    <Download className="w-4 h-4" />
                    Export PNG
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(value)}
                    className="h-10 w-10 rounded-lg border-border/50"
                  >
                    {copyingValue ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {session?.user && (
              <Card className="bg-card/40 border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="p-8 pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/50">
                    Archive Vault
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  {savedQrCodes.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-20">
                      <QrCode className="w-8 h-8" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        Vault empty
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {savedQrCodes.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-3 bg-muted/20 border border-border/50 rounded-lg group hover:border-primary/20 transition-all cursor-pointer"
                          onClick={() => loadSavedQr(item)}
                        >
                          <div className="w-10 h-10 bg-white p-1 rounded-md border border-border/5">
                            <QRCodeSVG
                              value={item.content}
                              size={32}
                              fgColor={item.fgColor}
                              level={item.level}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">
                              {item.name}
                            </p>
                            <p className="text-[8px] text-muted-foreground/50 font-medium uppercase truncate">
                              {item.content}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQr(item.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground/40 hover:text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="scan" className="mt-8 space-y-8">
            <Card className="bg-card/40 border-border/50 rounded-3xl overflow-hidden shadow-sm aspect-video flex flex-col items-center justify-center relative">
              <div
                id="scanner-region"
                className={cn(
                  'w-full h-full object-cover',
                  !isScanning && 'hidden'
                )}
              />
              {!isScanning && (
                <div className="text-center space-y-6 flex flex-col items-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                    <Scan className="w-6 h-6 opacity-20" />
                  </div>
                  <Button
                    onClick={startScanner}
                    className="h-10 px-8 rounded-lg bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] gap-2 shadow-none"
                  >
                    <Camera className="w-4 h-4" />
                    Initialize Camera
                  </Button>
                </div>
              )}
              {isScanning && (
                <Button
                  onClick={stopScanner}
                  variant="destructive"
                  size="sm"
                  className="absolute top-4 right-4 rounded-lg h-9 text-[10px] font-bold uppercase tracking-widest shadow-lg"
                >
                  Stop Scanner
                </Button>
              )}
            </Card>

            {scanResult && (
              <Card className="bg-card/40 border-border/50 rounded-2xl overflow-hidden shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                    Decoded Payload
                  </Label>
                  <div className="p-4 bg-muted/20 border border-border/50 rounded-lg text-xs font-mono font-medium text-primary break-all">
                    {scanResult}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(scanResult)}
                      className="h-9 px-6 rounded-md bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-widest shadow-none gap-2"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </Button>
                    {scanResult.startsWith('http') && (
                      <Button
                        asChild
                        variant="outline"
                        className="h-9 px-6 rounded-md text-[10px] font-bold uppercase tracking-widest"
                      >
                        <a
                          href={scanResult}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open Link
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
