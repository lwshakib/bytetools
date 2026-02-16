"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  ShieldCheck, 
  Zap,
  Scale
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BMIResult {
  value: number;
  category: string;
  color: string;
  bg: string;
  description: string;
}

const getBMICategory = (bmi: number): BMIResult => {
  if (bmi < 18.5) {
    return {
      value: bmi,
      category: 'Underweight',
      color: 'text-blue-500',
      bg: 'bg-blue-500',
      description: 'You may need to gain weight. Consult with a healthcare provider.'
    };
  } else if (bmi < 25) {
    return {
      value: bmi,
      category: 'Normal',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500',
      description: 'You have a healthy body weight. Maintain your current lifestyle.'
    };
  } else if (bmi < 30) {
    return {
      value: bmi,
      category: 'Overweight',
      color: 'text-amber-500',
      bg: 'bg-amber-500',
      description: 'Consider a balanced diet and regular exercise to reach a healthy weight.'
    };
  } else {
    return {
      value: bmi,
      category: 'Obese',
      color: 'text-red-500',
      bg: 'bg-red-500',
      description: 'Consult with a healthcare provider for a personalized weight management plan.'
    };
  };
};

export default function BMICalculatorPage() {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const [heightFeet, setHeightFeet] = useState('5');
  const [heightInches, setHeightInches] = useState('7');
  const [weightPounds, setWeightPounds] = useState('154');
  const [bmiResult, setBmiResult] = useState<BMIResult | null>(null);

  useEffect(() => {
    let bmi = 0;
    if (unit === 'metric') {
      const heightM = parseFloat(height) / 100;
      const weightKg = parseFloat(weight);
      if (heightM > 0 && weightKg > 0) {
        bmi = weightKg / (heightM * heightM);
      }
    } else {
      const heightInchesTotal = parseFloat(heightFeet) * 12 + parseFloat(heightInches);
      const weightLbs = parseFloat(weightPounds);
      if (heightInchesTotal > 0 && weightLbs > 0) {
        bmi = (weightLbs / (heightInchesTotal * heightInchesTotal)) * 703;
      }
    }
    if (bmi > 0) {
      setBmiResult(getBMICategory(bmi));
    } else {
      setBmiResult(null);
    }
  }, [unit, height, weight, heightFeet, heightInches, weightPounds]);

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-y-auto p-6 md:p-8 lg:p-12">
      <div className="w-full max-w-5xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2"
          >
            <Scale className="w-3.5 h-3.5" />
            Body Mass Analysis Active
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase">
            BMI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-600">ARCHITECT</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.3em] opacity-40">
            Precision Body Composition Analysis
          </p>
        </div>

        {/* Main Calculator Card */}
        <Card className="bg-card/50 border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
          <CardContent className="p-10 space-y-10">
            {/* Unit Toggle */}
            <Tabs value={unit} onValueChange={(v) => setUnit(v as 'metric' | 'imperial')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-16 bg-muted/30 p-1.5 rounded-2xl border border-border/50">
                <TabsTrigger value="metric" className="rounded-xl text-xs font-black uppercase tracking-widest data-[state=active]:bg-background">
                  Metric (kg/cm)
                </TabsTrigger>
                <TabsTrigger value="imperial" className="rounded-xl text-xs font-black uppercase tracking-widest data-[state=active]:bg-background">
                  Imperial (lbs/ft)
                </TabsTrigger>
              </TabsList>

              {/* Metric Inputs */}
              <TabsContent value="metric" className="space-y-10 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Height (cm)
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="h-20 text-3xl font-black text-center bg-background/50 border-border/50 rounded-2xl"
                        placeholder="170"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 text-sm font-black">
                        cm
                      </div>
                    </div>
                    <Slider
                      value={[parseFloat(height) || 100]}
                      onValueChange={(val) => setHeight(val[0].toString())}
                      min={50}
                      max={250}
                      step={1}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-6">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Weight (kg)
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="h-20 text-3xl font-black text-center bg-background/50 border-border/50 rounded-2xl"
                        placeholder="70"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 text-sm font-black">
                        kg
                      </div>
                    </div>
                    <Slider
                      value={[parseFloat(weight) || 30]}
                      onValueChange={(val) => setWeight(val[0].toString())}
                      min={20}
                      max={200}
                      step={0.1}
                      className="py-4"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Imperial Inputs */}
              <TabsContent value="imperial" className="space-y-10 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-6">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Height (feet)
                    </Label>
                    <Input
                      type="number"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(e.target.value)}
                      className="h-20 text-3xl font-black text-center bg-background/50 border-border/50 rounded-2xl"
                      placeholder="5"
                    />
                  </div>

                  <div className="space-y-6">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Height (inches)
                    </Label>
                    <Input
                      type="number"
                      value={heightInches}
                      onChange={(e) => setHeightInches(e.target.value)}
                      className="h-20 text-3xl font-black text-center bg-background/50 border-border/50 rounded-2xl"
                      placeholder="7"
                    />
                  </div>

                  <div className="space-y-6">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Weight (lbs)
                    </Label>
                    <Input
                      type="number"
                      value={weightPounds}
                      onChange={(e) => setWeightPounds(e.target.value)}
                      className="h-20 text-3xl font-black text-center bg-background/50 border-border/50 rounded-2xl"
                      placeholder="154"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* BMI Result Display */}
            {bmiResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="relative group">
                  <div className="absolute -inset-10 bg-indigo-500/5 blur-[100px] rounded-full opacity-50" />
                  <div className={cn(
                    "relative p-12 border rounded-[3rem] shadow-2xl",
                    bmiResult.bg === 'bg-blue-500' && "bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20",
                    bmiResult.bg === 'bg-emerald-500' && "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
                    bmiResult.bg === 'bg-amber-500' && "bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20",
                    bmiResult.bg === 'bg-red-500' && "bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20"
                  )}>
                    <div className="text-center space-y-6">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                        Body Mass Index
                      </span>
                      <div className="flex items-baseline justify-center gap-4">
                        <span className={cn("text-[120px] md:text-[180px] font-black tracking-tighter tabular-nums leading-none", bmiResult.color)}>
                          {bmiResult.value.toFixed(1)}
                        </span>
                        <span className={cn("text-4xl font-black uppercase tracking-widest", bmiResult.color)}>
                          BMI
                        </span>
                      </div>
                      <div className="pt-4">
                        <span className={cn(
                          "inline-block px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest border",
                          bmiResult.bg === 'bg-blue-500' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                          bmiResult.bg === 'bg-emerald-500' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                          bmiResult.bg === 'bg-amber-500' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                          bmiResult.bg === 'bg-red-500' && "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          {bmiResult.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BMI Scale */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                    BMI Scale
                  </Label>
                  <div className="relative h-16 bg-muted/20 rounded-2xl border border-border/50 overflow-hidden">
                    <div className="absolute inset-0 flex">
                      <div className="flex-1 bg-blue-500/20" />
                      <div className="flex-1 bg-emerald-500/20" />
                      <div className="flex-1 bg-amber-500/20" />
                      <div className="flex-1 bg-red-500/20" />
                    </div>
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-foreground shadow-lg"
                      style={{ left: `${Math.min(100, (bmiResult.value / 40) * 100)}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-4 text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                      <span>18.5</span>
                      <span>25</span>
                      <span>30</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="p-6 bg-muted/20 border border-border/50 rounded-2xl">
                  <p className="text-sm font-bold text-muted-foreground leading-relaxed text-center">
                    {bmiResult.description}
                  </p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "Medical Standard", desc: "BMI calculation based on WHO and CDC medical guidelines.", color: "text-indigo-500", bg: "bg-indigo-500/10" },
            { icon: Zap, title: "Dual Units", desc: "Support for both metric (kg/cm) and imperial (lbs/ft) measurement systems.", color: "text-amber-500", bg: "bg-amber-500/10" },
            { icon: Activity, title: "Health Insights", desc: "Comprehensive category analysis with personalized recommendations.", color: "text-emerald-500", bg: "bg-emerald-500/10" }
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
