"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  ArrowRightLeft, 
  Scale, 
  RotateCcw
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

const convertWeight = (value: number, from: string, to: string): number => {
  if (from === to) return value;
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
  /* The numerical string input for the source unit */
  const [amount, setAmount] = useState('1');
  
  /* The unit codes for conversion (e.g., 'kg', 'lb') */
  const [fromUnit, setFromUnit] = useState('kg');
  const [toUnit, setToUnit] = useState('lb');
  
  /* The calculated result of the weight transformation */
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

  const sourceUnit = WEIGHT_UNITS.find(u => u.code === fromUnit) || WEIGHT_UNITS[0];
  const targetUnit = WEIGHT_UNITS.find(u => u.code === toUnit) || WEIGHT_UNITS[0];

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-y-auto">
      <div className="flex-1 flex flex-col p-6 md:p-12">
        <div className="max-w-5xl mx-auto w-full flex flex-col items-center">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center space-y-4 mb-20 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-border/50 text-foreground text-[10px] font-bold uppercase tracking-widest"
            >
              <Scale className="w-3.5 h-3.5 text-primary" />
              Weight Conversion
            </motion.div>
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.2em] opacity-40">High-Precision Mass Translation</p>
          </div>

          {/* Main Converter card */}
          <div className="relative mb-24 w-full">
            <div className="absolute -inset-20 bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50" />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex flex-col p-8 md:p-14 bg-card/40 border border-border/50 rounded-xl shadow-xl backdrop-blur-md w-full overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-8 lg:gap-12">
                {/* Source Section */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">From</Label>
                    <span className="text-[10px] font-bold text-primary/60">{sourceUnit.name}</span>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-20 text-4xl font-bold bg-background/40 border-border/50 rounded-lg pr-12 tabular-nums"
                        placeholder="0.00"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-bold uppercase tracking-widest text-xs">
                        {sourceUnit.symbol}
                      </div>
                    </div>
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger className="h-12 bg-background/40 border-border/50 rounded-lg font-bold text-xs uppercase tracking-widest">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border shadow-2xl">
                        {WEIGHT_UNITS.map((u) => (
                          <SelectItem key={u.code} value={u.code} className="text-xs font-bold uppercase tracking-widest">
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center lg:pt-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSwap}
                    className="w-12 h-12 rounded-full bg-primary/5 border border-border/50 hover:bg-primary/10 transition-all group"
                  >
                    <ArrowRightLeft className="w-5 h-5 text-primary rotate-90 lg:rotate-0 transition-transform group-active:scale-90" />
                  </Button>
                </div>

                {/* Target Section */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">To</Label>
                    <span className="text-[10px] font-bold text-primary/60">{targetUnit.name}</span>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="h-20 flex items-center px-6 bg-primary/5 border border-primary/20 rounded-lg overflow-hidden group">
                        <span className="text-4xl font-bold tracking-tighter tabular-nums text-primary truncate">
                          {convertedAmount === "0.00" ? "0" : convertedAmount}
                        </span>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 font-bold uppercase tracking-widest text-xs">
                          {targetUnit.symbol}
                        </div>
                      </div>
                    </div>
                    <Select value={toUnit} onValueChange={setToUnit}>
                      <SelectTrigger className="h-12 bg-background/40 border-border/50 rounded-lg font-bold text-xs uppercase tracking-widest">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border shadow-2xl">
                        {WEIGHT_UNITS.map((u) => (
                          <SelectItem key={u.code} value={u.code} className="text-xs font-bold uppercase tracking-widest">
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Conversion Stats */}
              <div className="mt-12 pt-8 border-t border-border/50 flex flex-wrap items-center justify-between gap-6">
                <div className="flex flex-wrap gap-10">
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 block">Reference Rate</span>
                    <p className="text-xs font-bold tabular-nums">1 {sourceUnit.code} = {(parseFloat(convertedAmount) / (parseFloat(amount) || 1)).toFixed(4)} {targetUnit.code}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 block">Precision</span>
                    <div className="flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <p className="text-xs font-bold uppercase tracking-widest">Active Resolution</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full border border-border/50 hover:bg-muted transition-all text-muted-foreground"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Quick Stats Grid */}
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
            {[
              { label: 'Kilograms', value: convertWeight(parseFloat(amount) || 0, fromUnit, 'kg').toFixed(2), unit: 'kg' },
              { label: 'Pounds', value: convertWeight(parseFloat(amount) || 0, fromUnit, 'lb').toFixed(2), unit: 'lb' },
              { label: 'Ounces', value: convertWeight(parseFloat(amount) || 0, fromUnit, 'oz').toFixed(2), unit: 'oz' },
              { label: 'Grams', value: convertWeight(parseFloat(amount) || 0, fromUnit, 'g').toFixed(2), unit: 'g' },
            ].map((conv, i) => (
              <div key={i} className="p-6 bg-card/40 border border-border/50 rounded-xl space-y-2">
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30">{conv.label}</span>
                <p className="text-lg font-bold tabular-nums text-foreground">{conv.value} <span className="text-[10px] text-muted-foreground ml-1">{conv.unit}</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
