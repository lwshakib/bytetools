"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  ArrowRightLeft, 
  Scale, 
  ShieldCheck, 
  Zap,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const WEIGHT_UNITS = [
  { code: 'kg', name: 'Kilograms', symbol: 'kg' },
  { code: 'g', name: 'Grams', symbol: 'g' },
  { code: 'lb', name: 'Pounds', symbol: 'lb' },
  { code: 'oz', name: 'Ounces', symbol: 'oz' },
  { code: 'st', name: 'Stones', symbol: 'st' },
  { code: 'mg', name: 'Milligrams', symbol: 'mg' },
  { code: 't', name: 'Metric Tons', symbol: 't' },
];

// Convert to grams first, then to target unit
const convertWeight = (value: number, from: string, to: string): number => {
  if (from === to) return value;
  
  // Convert to grams
  let grams = 0;
  switch (from) {
    case 'kg': grams = value * 1000; break;
    case 'g': grams = value; break;
    case 'lb': grams = value * 453.592; break;
    case 'oz': grams = value * 28.3495; break;
    case 'st': grams = value * 6350.29; break;
    case 'mg': grams = value / 1000; break;
    case 't': grams = value * 1000000; break;
    default: grams = value;
  }
  
  // Convert from grams to target
  switch (to) {
    case 'kg': return grams / 1000;
    case 'g': return grams;
    case 'lb': return grams / 453.592;
    case 'oz': return grams / 28.3495;
    case 'st': return grams / 6350.29;
    case 'mg': return grams * 1000;
    case 't': return grams / 1000000;
    default: return grams;
  }
};

export default function WeightConverterPage() {
  const [amount, setAmount] = useState('1');
  const [fromUnit, setFromUnit] = useState('kg');
  const [toUnit, setToUnit] = useState('lb');
  const [convertedAmount, setConvertedAmount] = useState('2.20462');

  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    const converted = convertWeight(numAmount, fromUnit, toUnit);
    setConvertedAmount(converted.toFixed(6).replace(/\.?0+$/, ''));
  }, [amount, fromUnit, toUnit]);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleReset = () => {
    setAmount('1');
    setFromUnit('kg');
    setToUnit('lb');
  };

  const fromUnitData = WEIGHT_UNITS.find(u => u.code === fromUnit);
  const toUnitData = WEIGHT_UNITS.find(u => u.code === toUnit);

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-y-auto p-6 md:p-8 lg:p-12">
      <div className="w-full max-w-5xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2"
          >
            <Scale className="w-3.5 h-3.5" />
            Mass Conversion Protocol Active
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase">
            WEIGHT <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-600">ARCHITECT</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.3em] opacity-40">
            Precision Mass Unit Transformation
          </p>
        </div>

        {/* Main Converter Card */}
        <Card className="bg-card/50 border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500" />
          <CardContent className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
              {/* From Unit */}
              <div className="space-y-6">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                  Source Unit
                </Label>
                <Select value={fromUnit} onValueChange={setFromUnit}>
                  <SelectTrigger className="h-16 bg-muted/20 border-border/50 rounded-2xl text-sm font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEIGHT_UNITS.map((unit) => (
                      <SelectItem key={unit.code} value={unit.code}>
                        {unit.code.toUpperCase()} - {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-20 text-3xl font-black text-center bg-background/50 border-border/50 rounded-2xl pr-4"
                    placeholder="0.00"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 text-sm font-black">
                    {fromUnitData?.symbol}
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSwap}
                  variant="ghost"
                  size="icon"
                  className="h-16 w-16 rounded-2xl border border-border/50 hover:bg-teal-500/10 hover:border-teal-500/30 transition-all active:scale-95"
                >
                  <ArrowRightLeft className="w-6 h-6 text-teal-500" />
                </Button>
              </div>

              {/* To Unit */}
              <div className="space-y-6">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                  Target Unit
                </Label>
                <Select value={toUnit} onValueChange={setToUnit}>
                  <SelectTrigger className="h-16 bg-muted/20 border-border/50 rounded-2xl text-sm font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEIGHT_UNITS.map((unit) => (
                      <SelectItem key={unit.code} value={unit.code}>
                        {unit.code.toUpperCase()} - {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Input
                    readOnly
                    value={convertedAmount}
                    className="h-20 text-3xl font-black text-center bg-teal-500/5 border-teal-500/20 rounded-2xl text-teal-500 pr-4"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-500/40 text-sm font-black">
                    {toUnitData?.symbol}
                  </div>
                </div>
              </div>
            </div>

            {/* Conversion Rate Display */}
            <div className="pt-8 border-t border-border/50">
              <div className="flex items-center justify-between p-6 bg-muted/20 rounded-2xl border border-border/50">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                    Conversion Rate
                  </span>
                  <p className="text-2xl font-black font-mono text-foreground">
                    1 {fromUnit.toUpperCase()} = {convertWeight(1, fromUnit, toUnit).toFixed(6).replace(/\.?0+$/, '')} {toUnit.toUpperCase()}
                  </p>
                </div>
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-xl border border-border/50 hover:bg-muted transition-all"
                >
                  <RefreshCw className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Quick Conversions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-border/50">
              {[
                { label: 'Kilograms', value: convertWeight(parseFloat(amount) || 0, fromUnit, 'kg').toFixed(2), unit: 'kg' },
                { label: 'Pounds', value: convertWeight(parseFloat(amount) || 0, fromUnit, 'lb').toFixed(2), unit: 'lb' },
                { label: 'Ounces', value: convertWeight(parseFloat(amount) || 0, fromUnit, 'oz').toFixed(2), unit: 'oz' },
                { label: 'Grams', value: convertWeight(parseFloat(amount) || 0, fromUnit, 'g').toFixed(2), unit: 'g' },
              ].map((conv, i) => (
                <div key={i} className="p-4 bg-card border border-border/50 rounded-2xl text-center">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 block mb-2">
                    {conv.label}
                  </span>
                  <p className="text-xl font-black font-mono tabular-nums text-foreground">
                    {conv.value} {conv.unit}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "Precision Math", desc: "High-accuracy conversion calculations with up to 6 decimal places.", color: "text-teal-500", bg: "bg-teal-500/10" },
            { icon: Zap, title: "7 Unit Types", desc: "Support for kilograms, grams, pounds, ounces, stones, milligrams, and metric tons.", color: "text-amber-500", bg: "bg-amber-500/10" },
            { icon: Scale, title: "Instant Conversion", desc: "Real-time calculation updates as you type with zero latency.", color: "text-emerald-500", bg: "bg-emerald-500/10" }
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
    </div>
  );
}
