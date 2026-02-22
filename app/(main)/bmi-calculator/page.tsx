'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BMIResult {
  value: number;
  category: string;
  color: string;
  bg: string;
  description: string;
}

/**
 * Utility function to determine BMI category and associated styling.
 * @param bmi - The calculated Body Mass Index value.
 * @returns An object containing category details, colors, and descriptions.
 */
const getBMICategory = (bmi: number): BMIResult => {
  if (bmi < 18.5) {
    return {
      value: bmi,
      category: 'Underweight',
      color: 'text-blue-500',
      bg: 'bg-blue-500',
      description:
        'You may need to gain weight. Consult with a healthcare provider.',
    };
  } else if (bmi < 25) {
    return {
      value: bmi,
      category: 'Normal',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500',
      description:
        'You have a healthy body weight. Maintain your current lifestyle.',
    };
  } else if (bmi < 30) {
    return {
      value: bmi,
      category: 'Overweight',
      color: 'text-amber-500',
      bg: 'bg-amber-500',
      description:
        'Consider a balanced diet and regular exercise to reach a healthy weight.',
    };
  } else {
    return {
      value: bmi,
      category: 'Obese',
      color: 'text-red-500',
      bg: 'bg-red-500',
      description:
        'Consult with a healthcare provider for a personalized weight management plan.',
    };
  }
};

export default function BMICalculatorPage() {
  /* State to track measurement unit (Metric vs Imperial) */
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  /* State for Metric inputs */
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');

  /* State for Imperial inputs */
  const [heightFeet, setHeightFeet] = useState('5');
  const [heightInches, setHeightInches] = useState('7');
  const [weightPounds, setWeightPounds] = useState('154');

  /* State to store the final BMI calculation result */
  const [bmiResult, setBmiResult] = useState<BMIResult | null>(null);

  /**
   * Effect hook to recalculate BMI whenever any input changes.
   */
  useEffect(() => {
    let bmi = 0;
    if (unit === 'metric') {
      /* BMI Formula (Metric): kg / m^2 */
      const heightM = parseFloat(height) / 100;
      const weightKg = parseFloat(weight);
      if (heightM > 0 && weightKg > 0) {
        bmi = weightKg / (heightM * heightM);
      }
    } else {
      /* BMI Formula (Imperial): (lbs / inches^2) * 703 */
      const heightInchesTotal =
        parseFloat(heightFeet) * 12 + parseFloat(heightInches);
      const weightLbs = parseFloat(weightPounds);
      if (heightInchesTotal > 0 && weightLbs > 0) {
        bmi = (weightLbs / (heightInchesTotal * heightInchesTotal)) * 703;
      }
    }

    if (bmi > 0) {
      /* Update the result state with category breakdown */
      setBmiResult(getBMICategory(bmi));
    } else {
      setBmiResult(null);
    }
  }, [unit, height, weight, heightFeet, heightInches, weightPounds]);

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-y-auto">
      <div className="flex-1 flex flex-col p-4 md:p-12">
        <div className="max-w-5xl mx-auto w-full flex flex-col items-center">
          {/* 
              Header Section: Title and branding for the BMI Analysis tool.
          */}
          <div className="flex flex-col items-center text-center space-y-4 mb-12 md:mb-20 w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-border/50 text-foreground text-[10px] font-bold uppercase tracking-widest"
            >
              <Scale className="w-3.5 h-3.5 text-primary" />
              BMI Analysis
            </motion.div>
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.2em] opacity-40">
              Precision body mass index computation
            </p>
          </div>

          {/* Main Calculator card */}
          {/* 
              Main Calculator card: Container for measurement inputs. 
              Features a blurred background glow for modern SaaS aesthetics.
          */}
          <div className="relative mb-24 w-full">
            <div className="absolute -inset-20 bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex flex-col p-6 sm:p-8 md:p-14 bg-card/40 border border-border/50 rounded-xl shadow-xl backdrop-blur-md w-full overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-8 md:gap-12">
                <Tabs
                  value={unit}
                  onValueChange={(v) => setUnit(v as 'metric' | 'imperial')}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/20 p-1 rounded-lg border border-border/50">
                    <TabsTrigger
                      value="metric"
                      className="rounded-md text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-background"
                    >
                      Metric
                    </TabsTrigger>
                    <TabsTrigger
                      value="imperial"
                      className="rounded-md text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-background"
                    >
                      Imperial
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="metric"
                    className="mt-8 md:mt-10 space-y-8 md:space-y-10"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">
                          Height (cm)
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="h-14 text-2xl font-bold bg-background/40 border-border/50 rounded-lg pr-4 tabular-nums"
                            placeholder="170"
                          />
                        </div>
                        <Slider
                          value={[parseFloat(height) || 100]}
                          onValueChange={(val) => setHeight(val[0].toString())}
                          min={50}
                          max={250}
                          step={1}
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">
                          Weight (kg)
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="h-14 text-2xl font-bold bg-background/40 border-border/50 rounded-lg pr-4 tabular-nums"
                            placeholder="70"
                          />
                        </div>
                        <Slider
                          value={[parseFloat(weight) || 30]}
                          onValueChange={(val) => setWeight(val[0].toString())}
                          min={20}
                          max={200}
                          step={0.1}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="imperial"
                    className="mt-8 md:mt-10 space-y-8 md:space-y-10"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">
                          Feet
                        </Label>
                        <Input
                          type="number"
                          value={heightFeet}
                          onChange={(e) => setHeightFeet(e.target.value)}
                          className="h-14 text-2xl font-bold bg-background/40 border-border/50 rounded-lg tabular-nums text-center"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">
                          Inches
                        </Label>
                        <Input
                          type="number"
                          value={heightInches}
                          onChange={(e) => setHeightInches(e.target.value)}
                          className="h-14 text-2xl font-bold bg-background/40 border-border/50 rounded-lg tabular-nums text-center"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">
                          Pounds
                        </Label>
                        <Input
                          type="number"
                          value={weightPounds}
                          onChange={(e) => setWeightPounds(e.target.value)}
                          className="h-14 text-2xl font-bold bg-background/40 border-border/50 rounded-lg tabular-nums text-center"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* 
                    Results Display: Shown when BMI is successfully calculated.
                */}
                {bmiResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-10 pt-10 border-t border-border/50"
                  >
                    {/* Numeric and Categorical Analysis */}
                    <div className="text-center space-y-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
                        Result Analysis
                      </span>
                      <div className="flex items-baseline justify-center gap-2 md:gap-3">
                        <span
                          className={cn(
                            'text-[60px] sm:text-[80px] md:text-[120px] font-bold tracking-tighter tabular-nums leading-none',
                            bmiResult.color
                          )}
                        >
                          {bmiResult.value.toFixed(1)}
                        </span>
                        <span
                          className={cn(
                            'text-xl md:text-2xl font-bold uppercase tracking-widest opacity-40',
                            bmiResult.color
                          )}
                        >
                          BMI
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-6">
                        <span
                          className={cn(
                            'px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border',
                            bmiResult.bg === 'bg-blue-500' &&
                              'bg-blue-500/10 text-blue-500 border-blue-500/20',
                            bmiResult.bg === 'bg-emerald-500' &&
                              'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                            bmiResult.bg === 'bg-amber-500' &&
                              'bg-amber-500/10 text-amber-500 border-amber-500/20',
                            bmiResult.bg === 'bg-red-500' &&
                              'bg-red-500/10 text-red-500 border-red-500/20'
                          )}
                        >
                          {bmiResult.category}
                        </span>
                        <p className="text-[11px] font-medium text-muted-foreground/60 max-w-sm uppercase tracking-tight leading-relaxed">
                          {bmiResult.description}
                        </p>
                      </div>
                    </div>

                    {/* Visual Slider: Shows BMI position on a scale */}
                    <div className="space-y-4">
                      <div className="relative h-1.5 bg-muted/20 rounded-full overflow-hidden">
                        <div className="absolute inset-0 flex">
                          <div className="flex-[18.5] bg-blue-500/20" />
                          <div className="flex-[6.5] bg-emerald-500/20" />
                          <div className="flex-[5] bg-amber-500/20" />
                          <div className="flex-[10] bg-red-500/20" />
                        </div>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            left: `${Math.min(100, (bmiResult.value / 40) * 100)}%`,
                          }}
                          className="absolute top-0 bottom-0 w-1 bg-foreground rounded-full shadow-lg h-full"
                        />
                      </div>
                      <div className="flex justify-between px-1 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30">
                        <span>18.5</span>
                        <span>25.0</span>
                        <span>30.0</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
