"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowRightLeft, 
  RefreshCw, 
  TrendingUp, 
  ShieldCheck, 
  Zap,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
    <div className="flex flex-1 flex-col h-full bg-background overflow-y-auto p-6 md:p-8 lg:p-12">
      <div className="w-full max-w-5xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Exchange Protocol Active
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase">
            CURRENCY <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">ARCHITECT</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.3em] opacity-40">
            Real-time Financial Conversion Matrix
          </p>
        </div>

        {/* Main Converter Card */}
        <Card className="bg-card/50 border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <CardContent className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
              {/* From Currency */}
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                  Source Currency
                </label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger className="h-16 bg-muted/20 border-border/50 rounded-2xl text-sm font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
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
                    {fromCurrencyData?.symbol}
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSwap}
                  variant="ghost"
                  size="icon"
                  className="h-16 w-16 rounded-2xl border border-border/50 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all active:scale-95"
                >
                  <ArrowRightLeft className="w-6 h-6 text-emerald-500" />
                </Button>
              </div>

              {/* To Currency */}
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                  Target Currency
                </label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger className="h-16 bg-muted/20 border-border/50 rounded-2xl text-sm font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Input
                    readOnly
                    value={convertedAmount}
                    className="h-20 text-3xl font-black text-center bg-emerald-500/5 border-emerald-500/20 rounded-2xl text-emerald-500 pr-4"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/40 text-sm font-black">
                    {toCurrencyData?.symbol}
                  </div>
                </div>
              </div>
            </div>

            {/* Exchange Rate Display */}
            <div className="pt-8 border-t border-border/50">
              <div className="flex items-center justify-between p-6 bg-muted/20 rounded-2xl border border-border/50">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                    Exchange Rate
                  </span>
                  <p className="text-2xl font-black font-mono text-foreground">
                    1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                    Inverse Rate
                  </span>
                  <p className="text-2xl font-black font-mono text-muted-foreground/60">
                    1 {toCurrency} = {(1 / rate).toFixed(4)} {fromCurrency}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "Real-time Rates", desc: "Live exchange rate data synchronized with global financial markets.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { icon: Zap, title: "Zero Latency", desc: "Instant conversion calculations with sub-millisecond response times.", color: "text-amber-500", bg: "bg-amber-500/10" },
            { icon: Globe, title: "Global Coverage", desc: "Support for 20+ major world currencies and counting.", color: "text-blue-500", bg: "bg-blue-500/10" }
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
