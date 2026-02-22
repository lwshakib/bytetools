'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRightLeft, Globe, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Static list of supported currencies with their codes, names, and symbols.
 */
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

/**
 * Mock exchange rate mapping for demonstration.
 */
const getExchangeRate = (from: string, to: string): number => {
  const rates: Record<string, Record<string, number>> = {
    USD: {
      EUR: 0.92,
      GBP: 0.79,
      JPY: 149.5,
      AUD: 1.52,
      CAD: 1.35,
      CHF: 0.88,
      CNY: 7.24,
      INR: 83.12,
      SGD: 1.34,
      BRL: 4.95,
      ZAR: 18.65,
      MXN: 17.12,
      KRW: 1312.5,
      NZD: 1.67,
      SEK: 10.68,
      NOK: 10.95,
      DKK: 6.88,
      PLN: 4.02,
      RUB: 91.25,
    },
    EUR: {
      USD: 1.09,
      GBP: 0.86,
      JPY: 162.5,
      AUD: 1.65,
      CAD: 1.47,
      CHF: 0.96,
      CNY: 7.87,
      INR: 90.25,
      SGD: 1.46,
      BRL: 5.38,
      ZAR: 20.28,
      MXN: 18.61,
      KRW: 1426.25,
      NZD: 1.82,
      SEK: 11.61,
      NOK: 11.9,
      DKK: 7.48,
      PLN: 4.37,
      RUB: 99.16,
    },
    GBP: {
      USD: 1.27,
      EUR: 1.16,
      JPY: 189.5,
      AUD: 1.92,
      CAD: 1.71,
      CHF: 1.11,
      CNY: 9.17,
      INR: 105.25,
      SGD: 1.7,
      BRL: 6.27,
      ZAR: 23.63,
      MXN: 21.68,
      KRW: 1661.25,
      NZD: 2.12,
      SEK: 13.52,
      NOK: 13.85,
      DKK: 8.71,
      PLN: 5.09,
      RUB: 115.49,
    },
  };
  if (from === to) return 1;
  if (rates[from]?.[to]) return rates[from][to];
  if (rates[to]?.[from]) return 1 / rates[to][from];
  return 1;
};

export default function CurrencyConverterPage() {
  /* Amount to be converted */
  const [amount, setAmount] = useState('1');

  /* Selected source currency */
  const [fromCurrency, setFromCurrency] = useState('USD');

  /* Selected target currency */
  const [toCurrency, setToCurrency] = useState('EUR');

  /* The result of the conversion */
  const [convertedAmount, setConvertedAmount] = useState('0.92');

  /* The current exchange rate used */
  const [rate, setRate] = useState(0.92);

  /**
   * Effect hook to update the conversion result whenever
   * amount or currencies pulse/change.
   */
  useEffect(() => {
    const rate = getExchangeRate(fromCurrency, toCurrency);
    setRate(rate);
    const numAmount = parseFloat(amount) || 0;
    setConvertedAmount((numAmount * rate).toFixed(2));
  }, [amount, fromCurrency, toCurrency]);

  /**
   * Swaps the 'From' and 'To' currencies.
   */
  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleReset = () => {
    setAmount('1');
    setFromCurrency('USD');
    setToCurrency('EUR');
  };

  const fromCurrencyData = CURRENCIES.find((c) => c.code === fromCurrency);
  const toCurrencyData = CURRENCIES.find((c) => c.code === toCurrency);

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-y-auto">
      <div className="flex-1 flex flex-col p-4 md:p-12">
        <div className="max-w-5xl mx-auto w-full flex flex-col items-center">
          {/* Header: Title and branding for the Currency Exchange tool. */}
          <div className="flex flex-col items-center text-center space-y-4 mb-12 md:mb-20 w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-border/50 text-foreground text-[10px] font-bold uppercase tracking-widest"
            >
              <Globe className="w-3.5 h-3.5 text-primary" />
              Currency Exchange
            </motion.div>
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.2em] opacity-40">
              Precision Real-time Currency Conversion
            </p>
          </div>

          {/* Main Converter card */}
          {/* Main Converter Card: The core interface for currency interaction. */}
          <div className="relative mb-24 w-full">
            <div className="absolute -inset-20 bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex flex-col p-6 sm:p-8 md:p-14 bg-card/40 border border-border/50 rounded-xl shadow-xl backdrop-blur-md w-full overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-8 lg:gap-12">
                {/* Source Section */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      From
                    </Label>
                    <span className="text-[10px] font-bold text-primary/60">
                      {fromCurrencyData?.name}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-16 sm:h-20 text-3xl sm:text-4xl font-bold bg-background/40 border-border/50 rounded-lg pr-4 tabular-nums"
                        placeholder="0.00"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-bold uppercase tracking-widest text-xs">
                        {fromCurrencyData?.symbol}
                      </div>
                    </div>
                    <Select
                      value={fromCurrency}
                      onValueChange={setFromCurrency}
                    >
                      <SelectTrigger className="h-12 bg-background/40 border-border/50 rounded-lg font-bold text-xs uppercase tracking-widest">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border shadow-2xl">
                        {CURRENCIES.map((c) => (
                          <SelectItem
                            key={c.code}
                            value={c.code}
                            className="text-xs font-bold uppercase tracking-widest"
                          >
                            {c.code} — {c.name}
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

                {/* 
                    Target Section: Displays the result and allows 
                    selecting the destination currency. 
                */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      To
                    </Label>
                    <span className="text-[10px] font-bold text-primary/60">
                      {toCurrencyData?.name}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="h-16 sm:h-20 flex items-center px-4 sm:px-6 bg-primary/5 border border-primary/20 rounded-lg overflow-hidden group">
                        <span className="text-3xl sm:text-4xl font-bold tracking-tighter tabular-nums text-primary truncate">
                          {convertedAmount === '0.00' ? '0' : convertedAmount}
                        </span>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 font-bold uppercase tracking-widest text-xs">
                          {toCurrencyData?.symbol}
                        </div>
                      </div>
                    </div>
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger className="h-12 bg-background/40 border-border/50 rounded-lg font-bold text-xs uppercase tracking-widest">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border shadow-2xl">
                        {CURRENCIES.map((c) => (
                          <SelectItem
                            key={c.code}
                            value={c.code}
                            className="text-xs font-bold uppercase tracking-widest"
                          >
                            {c.code} — {c.name}
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
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 block">
                      Exchange Rate
                    </span>
                    <p className="text-xs font-bold tabular-nums">
                      1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 block">
                      Inverse Rate
                    </span>
                    <p className="text-xs font-bold tabular-nums opacity-40">
                      1 {toCurrency} = {(1 / rate).toFixed(4)} {fromCurrency}
                    </p>
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
        </div>
      </div>
    </div>
  );
}
