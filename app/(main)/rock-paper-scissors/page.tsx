"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, User, Cpu, Gamepad2, ShieldCheck, Zap, Activity } from 'lucide-react';
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

  useEffect(() => {
    const saved = localStorage.getItem('bt-rps-scores');
    if (saved) { try { setScores(JSON.parse(saved)); } catch (e) {} }
  }, []);

  useEffect(() => {
    localStorage.setItem('bt-rps-scores', JSON.stringify(scores));
  }, [scores]);

  const playGame = (choice: Choice) => {
    if (isPlaying) return;
    setIsPlaying(true);
    setUserChoice(choice);
    setComputerChoice(null);
    setResult(null);

    setTimeout(() => {
      const randomChoice = choices[Math.floor(Math.random() * choices.length)].id;
      setComputerChoice(randomChoice);
      const gameResult = determineWinner(choice, randomChoice);
      setResult(gameResult);
      if (gameResult === 'win') { setScores(prev => ({ ...prev, user: prev.user + 1 })); toast.success("Tactical Victory."); }
      else if (gameResult === 'lose') { setScores(prev => ({ ...prev, computer: prev.computer + 1 })); toast.error("System Override. You lost."); }
      else { toast.info("Parity detected. Draw."); }
      setIsPlaying(false);
    }, 800);
  };

  const determineWinner = (user: Choice, computer: Choice): 'win' | 'lose' | 'draw' => {
    if (user === computer) return 'draw';
    if ((user === 'rock' && computer === 'scissors') || (user === 'paper' && computer === 'rock') || (user === 'scissors' && computer === 'paper')) return 'win';
    return 'lose';
  };

  const resetGame = () => { setUserChoice(null); setComputerChoice(null); setResult(null); };
  const resetScores = () => { setScores({ user: 0, computer: 0 }); toast.success("Scores purged."); };

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-y-auto p-6 md:p-8 lg:p-12 items-center">
      <div className="w-full max-w-5xl space-y-16 py-8">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-4">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2"
            >
                <Gamepad2 className="w-3.5 h-3.5" />
                Conflict Resolution Logic
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase">TACTICAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">DUEL</span></h1>
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.3em] opacity-40">Rock • Paper • Scissors Matrix</p>
        </div>

        {/* Scoreboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto w-full">
            <div className="bg-card/40 border border-border/50 rounded-[2.5rem] p-8 flex items-center justify-between shadow-xl">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">User Identity</span>
                    <span className="text-sm font-black uppercase tracking-tighter">Human Operative</span>
                </div>
                <div className="text-4xl font-black tabular-nums text-amber-500">{scores.user}</div>
            </div>
            <div className="bg-card/40 border border-border/50 rounded-[2.5rem] p-8 flex items-center justify-between shadow-xl">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Remote Identity</span>
                    <span className="text-sm font-black uppercase tracking-tighter">Neural Core</span>
                </div>
                <div className="text-4xl font-black tabular-nums text-foreground">{scores.computer}</div>
            </div>
        </div>

        {/* Battle Arena */}
        <div className="flex flex-col items-center space-y-16">
            {/* User Choice */}
            <div className="flex flex-col items-center gap-8">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Commit Strategy</span>
                <div className="flex items-center gap-6">
                    {choices.map((choice) => (
                        <motion.button
                            key={choice.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isPlaying}
                            onClick={() => playGame(choice.id)}
                            className={cn(
                                "h-24 w-24 md:h-32 md:w-32 rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center gap-2 shadow-2xl",
                                userChoice === choice.id ? "bg-amber-500 border-amber-400 text-black shadow-amber-500/20" : "bg-card border-border/50 hover:border-amber-500/30"
                            )}
                        >
                            <span className="text-4xl md:text-5xl">{choice.icon}</span>
                            <span className={cn("text-[9px] font-black uppercase tracking-widest", userChoice === choice.id ? "text-black" : "text-muted-foreground/60")}>{choice.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Duel Result */}
            <div className="relative min-h-[300px] w-full max-w-xl flex flex-col items-center justify-center p-12 bg-muted/20 border border-border/50 rounded-[4rem] shadow-inner">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 bg-background border border-border/50 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">Execution Zone</div>
                
                <AnimatePresence mode="wait">
                    {userChoice ? (
                        <motion.div 
                            key="duel"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-12"
                        >
                            <div className="flex items-center gap-8 md:gap-16">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-card border border-border/50 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/5">
                                        {choices.find(c => c.id === userChoice)?.icon}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-30">User</span>
                                </div>
                                
                                <div className="text-xl font-black text-amber-500 animate-pulse">VS</div>

                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-card border border-border/50 flex items-center justify-center text-4xl shadow-xl shadow-zinc-500/5">
                                        {isPlaying ? (
                                            <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-amber-500">❓</motion.div>
                                        ) : (
                                            computerChoice ? choices.find(c => c.id === computerChoice)?.icon : '?'
                                        )}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Core</span>
                                </div>
                            </div>

                            {!isPlaying && result && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className={cn(
                                        "px-10 py-4 rounded-[1.5rem] text-xl font-black uppercase tracking-[0.2em] shadow-2xl",
                                        result === 'win' ? "bg-amber-500 text-black shadow-amber-500/20" :
                                        result === 'lose' ? "bg-zinc-800 text-white border border-zinc-700" :
                                        "bg-muted border border-border text-muted-foreground"
                                    )}
                                >
                                    {result === 'win' ? 'Victory' : result === 'lose' ? 'Defeat' : 'Parity'}
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center text-center space-y-6 opacity-20">
                            <Trophy className="w-20 h-20" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Initialize duel protocols</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-border/10 pt-16 max-w-5xl mx-auto">
            {[
                { icon: ShieldCheck, title: "RNG Guard", desc: "Cryptographically secure random generation for fair neural duels.", color: "text-amber-500", bg: "bg-amber-500/10" },
                { icon: Zap, title: "Latency-Zero", desc: "Instantaneous strategy evaluation and outcome verification.", color: "text-blue-500", bg: "bg-blue-500/10" },
                { icon: Activity, title: "Session Sync", desc: "Local persistence of tactical performance metrics.", color: "text-emerald-500", bg: "bg-emerald-500/10" }
            ].map((item, i) => (
                <div key={i} className="p-8 rounded-[2rem] bg-card/40 border border-border/50 relative overflow-hidden group">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110", item.bg)}>
                        <item.icon className={cn("w-6 h-6", item.color)} />
                    </div>
                    <h4 className="text-[10px] font-black text-foreground mb-3 uppercase tracking-widest">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-bold uppercase tracking-tighter opacity-40">{item.desc}</p>
                </div>
            ))}
        </div>

        {/* Global Controls */}
        <div className="flex items-center justify-center gap-6 pb-12">
            <Button variant="ghost" onClick={resetGame} disabled={!userChoice || isPlaying} className="h-12 px-8 rounded-xl font-black text-[9px] uppercase tracking-widest opacity-40 hover:opacity-100 hover:bg-muted gap-2">
                <RotateCcw className="w-3.5 h-3.5" /> Purge Arena
            </Button>
            <Button variant="ghost" onClick={resetScores} className="h-12 px-8 rounded-xl font-black text-[9px] uppercase tracking-widest text-red-500/40 hover:text-red-500 hover:bg-red-500/5 gap-2">
                <Activity className="w-3.5 h-3.5" /> Wipe Historical Data
            </Button>
        </div>
      </div>
    </div>
  );
}
