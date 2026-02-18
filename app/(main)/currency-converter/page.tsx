"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowRightLeft, 
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
];

// Mock exchange rates (in production, use a real API like exchangerate-api.com)
const getExchangeRate = (from: string, to: string): number => {
  const rates: Record<string, Record<string, number>> = {
    USD: { EUR: 0.92, GBP: 0.79, JPY: 149.50, AUD: 1.52, CAD: 1.35, CHF: 0.88, CNY: 7.24, INR: 83.12, SGD: 1.34, BRL: 4.95, ZAR: 18.65, MXN: 17.12, KRW: 1312.50, NZD: 1.67, SEK: 10.68, NOK: 10.95, DKK: 6.88, PLN: 4.02, RUB: 91.25 },
    EUR: { USD: 1.09, GBP: 0.86, JPY: 162.50, AUD: 1.65, CAD: 1.47, CHF: 0.96, CNY: 7.87, INR: 90.25, SGD: 1.46, BRL: 5.38, ZAR: 20.28, MXN: 18.61, KRW: 1426.25, NZD: 1.82, SEK: 11.61, NOK: 11.90, DKK: 7.48, PLN: 4.37, RUB: 99.16 },
    GBP: { USD: 1.27, EUR: 1.16, JPY: 189.50, AUD: 1.92, CAD: 1.71, CHF: 1.11, CNY: 9.17, INR: 105.25, SGD: 1.70, BRL: 6.27, ZAR: 23.63, MXN: 21.68, KRW: 1661.25, NZD: 2.12, SEK: 13.52, NOK: 13.85, DKK: 8.71, PLN: 5.09, RUB: 115.49 },
  };
  
  if (from === to) return 1;
  if (rates[from]?.[to]) return rates[from][to];
  if (rates[to]?.[from]) return 1 / rates[to][from];
  return 1; // Fallback
};

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [convertedAmount, setConvertedAmount] = useState('0.92');
  const [rate, setRate] = useState(0.92);

  useEffect(() => {
    const rate = getExchangeRate(fromCurrency, toCurrency);
    setRate(rate);
    const numAmount = parseFloat(amount) || 0;
    setConvertedAmount((numAmount * rate).toFixed(2));
  }, [amount, fromCurrency, toCurrency]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const fromCurrencyData = CURRENCIES.find(c => c.code === fromCurrency);
  const toCurrencyData = CURRENCIES.find(c => c.code === toCurrency);

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
              <Globe className="w-3.5 h-3.5 text-primary" />
              Currency Exchange
            </motion.div>
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.2em] opacity-40">Precision Financial Conversion Matrix</p>
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
                  {/* From Currency */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Source</Label>
                    <div className="space-y-3">
                      <Select value={fromCurrency} onValueChange={setFromCurrency}>
                        <SelectTrigger className="h-12 bg-muted/20 border-border/50 rounded-lg text-[11px] font-bold uppercase tracking-widest">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-border/50">
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code} className="text-[10px] font-bold uppercase tracking-widest">
                              {currency.code} — {currency.name}
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
                          {fromCurrencyData?.symbol}
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

                  {/* To Currency */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Target</Label>
                    <div className="space-y-3">
                      <Select value={toCurrency} onValueChange={setToCurrency}>
                        <SelectTrigger className="h-12 bg-muted/20 border-border/50 rounded-lg text-[11px] font-bold uppercase tracking-widest">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-border/50">
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code} className="text-[10px] font-bold uppercase tracking-widest">
                              {currency.code} — {currency.name}
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
                          {toCurrencyData?.symbol}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exchange Rate Display */}
                <div className="pt-8 border-t border-border/50">
                  <div className="flex items-center justify-between p-6 bg-muted/5 rounded-lg border border-border/50">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">Exchange Rate</span>
                      <p className="text-sm font-bold font-mono text-foreground tracking-tight">
                        1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">Inverse Rate</span>
                      <p className="text-sm font-bold font-mono text-muted-foreground/40 tracking-tight">
                        1 {toCurrency} = {(1 / rate).toFixed(4)} {fromCurrency}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
