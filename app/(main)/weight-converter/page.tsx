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
    <div className="flex flex-1 flex-col h-full bg-background overflow-y-auto">
      <div className="flex-1 flex flex-col p-6 md:p-12">
        <div className="max-w-2xl mx-auto w-full flex flex-col items-center">
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
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.2em] opacity-40">Precision Unit Transformation Interface</p>
          </div>

          {/* Main Converter card */}
          <div className="relative mb-24 w-full">
            <div className="absolute -inset-20 bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50" />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex flex-col p-8 md:p-14 bg-card/40 border border-border/50 rounded-xl shadow-xl backdrop-blur-md w-full overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-12">
                <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-6 items-start">
                  {/* From Unit */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Source</Label>
                    <div className="space-y-3">
                      <Select value={fromUnit} onValueChange={setFromUnit}>
                        <SelectTrigger className="h-12 bg-muted/20 border-border/50 rounded-lg text-[11px] font-bold uppercase tracking-widest">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-border/50">
                          {WEIGHT_UNITS.map((unit) => (
                            <SelectItem key={unit.code} value={unit.code} className="text-[10px] font-bold uppercase tracking-widest">
                              {unit.code.toUpperCase()} — {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="relative">
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="h-14 text-2xl font-bold bg-background/40 border-border/50 rounded-lg pr-4 tabular-nums"
                          placeholder="0.00"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 text-xs font-bold uppercase tracking-widest">
                          {fromUnitData?.symbol}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Swap Button container */}
                  <div className="flex md:flex-col items-center justify-center pt-8 md:pt-14 h-full">
                    <Button
                      onClick={handleSwap}
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-lg border border-border/50 bg-muted/5 hover:bg-primary/5 hover:border-primary/20 transition-all active:scale-95 group"
                    >
                      <ArrowRightLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Button>
                  </div>

                  {/* To Unit */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Target</Label>
                    <div className="space-y-3">
                      <Select value={toUnit} onValueChange={setToUnit}>
                        <SelectTrigger className="h-12 bg-muted/20 border-border/50 rounded-lg text-[11px] font-bold uppercase tracking-widest">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-border/50">
                          {WEIGHT_UNITS.map((unit) => (
                            <SelectItem key={unit.code} value={unit.code} className="text-[10px] font-bold uppercase tracking-widest">
                              {unit.code.toUpperCase()} — {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="relative">
                        <Input
                          readOnly
                          value={convertedAmount}
                          className="h-14 text-2xl font-bold bg-primary/5 border-primary/20 rounded-lg text-primary pr-4 tabular-nums shadow-[0_0_15px_-5px_rgba(var(--primary),0.1)]"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30 text-xs font-bold uppercase tracking-widest">
                          {toUnitData?.symbol}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conversion Rate Display */}
                <div className="pt-8 border-t border-border/50">
                  <div className="flex items-center justify-between p-5 bg-muted/5 rounded-lg border border-border/50">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">Conversion Formula</span>
                      <p className="text-sm font-bold font-mono tracking-tight text-foreground">
                        1 {fromUnit.toUpperCase()} = {convertWeight(1, fromUnit, toUnit).toFixed(6).replace(/\.?0+$/, '')} {toUnit.toUpperCase()}
                      </p>
                    </div>
                    <Button
                      onClick={handleReset}
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-lg border border-border/50 hover:bg-muted transition-all text-muted-foreground"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Quick Conversions Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Kilograms', value: convertWeight(parseFloat(amount) || 0, fromUnit, 'kg').toFixed(2), unit: 'kg' },
                    { label: 'Pounds', value: convertWeight(parseFloat(amount) || 0, fromUnit, 'lb').toFixed(2), unit: 'lb' },
                    { label: 'Ounces', value: convertWeight(parseFloat(amount) || 0, fromUnit, 'oz').toFixed(2), unit: 'oz' },
                    { label: 'Grams', value: convertWeight(parseFloat(amount) || 0, fromUnit, 'g').toFixed(2), unit: 'g' },
                  ].map((conv, i) => (
                    <div key={i} className="p-4 bg-muted/10 border border-border/50 rounded-lg text-center space-y-1 group hover:border-primary/20 transition-colors">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30 block group-hover:text-primary/40 transition-colors">
                        {conv.label}
                      </span>
                      <p className="text-sm font-bold font-mono tabular-nums text-foreground">
                        {conv.value} {conv.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
