"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, User, Cpu, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Choice = 'rock' | 'paper' | 'scissors';

const choices: { id: Choice; label: string; icon: string }[] = [
  { id: 'rock', label: 'Rock', icon: '✊' },
  { id: 'paper', label: 'Paper', icon: '✋' },
  { id: 'scissors', label: 'Scissors', icon: '✌️' },
];

export default function RockPaperScissorsPage() {
  const [userChoice, setUserChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [scores, setScores] = useState({ user: 0, computer: 0 });
  const [isPlaying, setIsPlaying] = useState(false);

  // Load scores
  useEffect(() => {
    const saved = localStorage.getItem('bt-rps-scores');
    if (saved) {
      try { setScores(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  // Save scores
  useEffect(() => {
    localStorage.setItem('bt-rps-scores', JSON.stringify(scores));
  }, [scores]);

  const playGame = (choice: Choice) => {
    if (isPlaying) return;
    setIsPlaying(true);
    setUserChoice(choice);
    setComputerChoice(null);
    setResult(null);

    // Simulate "thinking"
    setTimeout(() => {
      const randomChoice = choices[Math.floor(Math.random() * choices.length)].id;
      setComputerChoice(randomChoice);
      
      const gameResult = determineWinner(choice, randomChoice);
      setResult(gameResult);

      if (gameResult === 'win') {
        setScores(prev => ({ ...prev, user: prev.user + 1 }));
        toast.success("You won!");
      } else if (gameResult === 'lose') {
        setScores(prev => ({ ...prev, computer: prev.computer + 1 }));
        toast.error("Computer won!");
      } else {
        toast.info("It's a draw!");
      }

      setIsPlaying(false);
    }, 1000);
  };

  const determineWinner = (user: Choice, computer: Choice): 'win' | 'lose' | 'draw' => {
    if (user === computer) return 'draw';
    if (
      (user === 'rock' && computer === 'scissors') ||
      (user === 'paper' && computer === 'rock') ||
      (user === 'scissors' && computer === 'paper')
    ) {
      return 'win';
    }
    return 'lose';
  };

  const resetGame = () => {
    setUserChoice(null);
    setComputerChoice(null);
    setResult(null);
  };

  const resetScores = () => {
    setScores({ user: 0, computer: 0 });
    toast.success("Scores reset!");
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-hidden p-6 md:p-8 lg:p-12 items-center justify-center">
      <div className="w-full max-w-4xl space-y-12">
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="p-3 bg-amber-500/10 rounded-2xl mb-2">
              <Gamepad2 className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Rock Paper Scissors</h1>
            <p className="text-muted-foreground text-xs font-bold opacity-60 uppercase tracking-widest">Beat the CPU in a classic duel</p>
          </div>

          <Card className="bg-card/50 border-border/50 rounded-[2rem] shadow-xl min-w-[300px]">
            <CardContent className="p-6 flex items-center justify-around">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">You</span>
                </div>
                <span className="text-4xl font-black tabular-nums">{scores.user}</span>
              </div>
              <div className="h-12 w-px bg-border/50 mx-4" />
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">CPU</span>
                </div>
                <span className="text-4xl font-black tabular-nums">{scores.computer}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Arena */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
          {/* User Side */}
          <div className="flex flex-col items-center space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Your Move</h4>
            <div className="grid grid-cols-3 gap-4">
              {choices.map((choice) => (
                <Button
                  key={choice.id}
                  disabled={isPlaying}
                  onClick={() => playGame(choice.id)}
                  className={cn(
                    "h-24 w-24 md:h-32 md:w-32 flex-col rounded-[2.5rem] border-4 transition-all duration-300 bg-card hover:bg-muted active:scale-95 group shadow-lg",
                    userChoice === choice.id ? "border-amber-500 bg-amber-500/5 shadow-amber-500/10" : "border-border/50 hover:border-amber-500/30"
                  )}
                >
                  <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform">{choice.icon}</span>
                  <span className="mt-2 text-[10px] font-black uppercase tracking-tighter opacity-60">{choice.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Battle Visual */}
          <div className="flex flex-col items-center justify-center space-y-8 min-h-[300px] border-t md:border-t-0 md:border-l border-border/50 md:pl-8 pt-8 md:pt-0">
            <AnimatePresence mode="wait">
              {userChoice && (
                <motion.div 
                  key="battle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center space-y-8"
                >
                  <div className="flex items-center gap-8 md:gap-16">
                    {/* User Choice Visual */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted flex items-center justify-center text-4xl shadow-inner border border-border/50">
                        {choices.find(c => c.id === userChoice)?.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">You</span>
                    </div>

                    <div className="text-2xl font-black text-amber-500">VS</div>

                    {/* Computer Choice Visual */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted flex items-center justify-center text-4xl shadow-inner border border-border/50">
                        {isPlaying ? (
                          <motion.span 
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="text-amber-500"
                          >
                            ❓
                          </motion.span>
                        ) : (
                          computerChoice ? choices.find(c => c.id === computerChoice)?.icon : '?'
                        )}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">CPU</span>
                    </div>
                  </div>

                  {/* Result Banner */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={cn(
                      "px-8 py-3 rounded-2xl text-xl font-black uppercase tracking-[0.2em]",
                      result === 'win' ? "bg-green-500/10 text-green-500" :
                      result === 'lose' ? "bg-red-500/10 text-red-500" :
                      result === 'draw' ? "bg-zinc-500/10 text-zinc-500" : "opacity-0"
                    )}
                  >
                    {result === 'win' ? 'Victory' : result === 'lose' ? 'Defeat' : result === 'draw' ? 'Draw' : result}
                  </motion.div>
                </motion.div>
              )}

              {!userChoice && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  className="flex flex-col items-center text-center space-y-4"
                >
                  <Trophy className="w-16 h-16" />
                  <p className="text-sm font-bold uppercase tracking-widest">Select your weapon<br/>to start the duel</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="ghost"
            onClick={resetGame}
            disabled={!userChoice || isPlaying}
            className="rounded-xl h-12 px-6 font-black uppercase tracking-widest text-[10px] gap-2 opacity-60 hover:opacity-100"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Arena
          </Button>
          <Button
            variant="ghost"
            onClick={resetScores}
            className="rounded-xl h-12 px-6 font-black uppercase tracking-widest text-[10px] gap-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-colors"
          >
            Reset Scores
          </Button>
        </div>
      </div>
    </div>
  );
}
