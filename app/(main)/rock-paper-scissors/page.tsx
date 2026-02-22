'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  RotateCcw,
  User,
  Cpu,
  ShieldCheck,
  Zap,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Choice = 'rock' | 'paper' | 'scissors';

const choices: { id: Choice; label: string; icon: string }[] = [
  { id: 'rock', label: 'Rock', icon: '✊' },
  { id: 'paper', label: 'Paper', icon: '✋' },
  { id: 'scissors', label: 'Scissors', icon: '✌️' },
];

export default function RockPaperScissorsPage() {
  /* Player and AI selection states */
  const [userChoice, setUserChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);

  /* Outcome of the current round */
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);

  /* Persistent leaderboard statistics */
  const [scores, setScores] = useState({ user: 0, computer: 0 });

  /* Operational state during AI calculation delay */
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bt-rps-scores');
    if (saved) {
      try {
        setScores(JSON.parse(saved));
      } catch (e) {}
    }
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
      const randomChoice =
        choices[Math.floor(Math.random() * choices.length)].id;
      setComputerChoice(randomChoice);
      const gameResult = determineWinner(choice, randomChoice);
      setResult(gameResult);
      if (gameResult === 'win') {
        setScores((prev) => ({ ...prev, user: prev.user + 1 }));
      } else if (gameResult === 'lose') {
        setScores((prev) => ({ ...prev, computer: prev.computer + 1 }));
      }
      setIsPlaying(false);
    }, 800);
  };

  const determineWinner = (
    user: Choice,
    computer: Choice
  ): 'win' | 'lose' | 'draw' => {
    if (user === computer) return 'draw';
    if (
      (user === 'rock' && computer === 'scissors') ||
      (user === 'paper' && computer === 'rock') ||
      (user === 'scissors' && computer === 'paper')
    )
      return 'win';
    return 'lose';
  };

  const resetGame = () => {
    setUserChoice(null);
    setComputerChoice(null);
    setResult(null);
  };
  const resetScores = () => {
    setScores({ user: 0, computer: 0 });
    toast.success('Scores have been reset');
  };

  return (
    <div className="flex flex-1 flex-col items-center overflow-y-auto bg-background py-6 px-4">
      <div className="w-full max-w-4xl space-y-12">
        {/* Arena Header */}
        <div className="flex flex-col items-center gap-8 md:gap-12">
          <div className="flex gap-2 sm:gap-4">
            {[
              { label: 'Agent 01', val: scores.user, color: 'text-primary' },
              {
                label: 'Neural Core',
                val: scores.computer,
                color: 'text-muted-foreground',
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-card/40 border border-border/10 px-4 sm:px-8 py-3 sm:py-4 rounded-2xl flex flex-col items-center gap-1"
              >
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  {s.label}
                </span>
                <span
                  className={cn(
                    'text-xl sm:text-2xl font-mono font-bold',
                    s.color
                  )}
                >
                  {s.val}
                </span>
              </div>
            ))}
          </div>

          <div className="relative group">
            <div className="absolute -inset-20 bg-primary/5 blur-3xl rounded-full opacity-30" />
            <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px] rounded-full border border-border/10 bg-muted/20 flex flex-col items-center justify-center p-8 sm:p-12 relative z-10 backdrop-blur-xl">
              <AnimatePresence mode="wait">
                {!userChoice ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center space-y-4 opacity-10"
                  >
                    <Zap className="w-12 h-12" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.6em]">
                      Choose your weapon
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="duel"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-8 sm:gap-12"
                  >
                    <div className="flex items-center gap-6 sm:gap-12">
                      <div className="flex flex-col items-center gap-3 sm:gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-background border border-border/50 flex items-center justify-center text-3xl sm:text-4xl shadow-sm">
                          {choices.find((c) => c.id === userChoice)?.icon}
                        </div>
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-30">
                          Agent
                        </span>
                      </div>

                      <span className="text-sm font-mono font-bold text-primary opacity-20">
                        VS
                      </span>

                      <div className="flex flex-col items-center gap-3 sm:gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-background border border-border/50 flex items-center justify-center text-3xl sm:text-4xl shadow-sm">
                          {isPlaying ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                repeat: Infinity,
                                duration: 1,
                                ease: 'linear',
                              }}
                            >
                              ⚙️
                            </motion.div>
                          ) : computerChoice ? (
                            choices.find((c) => c.id === computerChoice)?.icon
                          ) : (
                            '?'
                          )}
                        </div>
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-30">
                          Core
                        </span>
                      </div>
                    </div>

                    {!isPlaying && result && (
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-[0.4em] px-6 sm:px-8 py-2 rounded-full border',
                          result === 'win'
                            ? 'bg-primary/5 border-primary/20 text-primary'
                            : result === 'lose'
                              ? 'bg-red-500/5 border-red-500/20 text-red-500'
                              : 'bg-muted/40 border-border/50 text-muted-foreground'
                        )}
                      >
                        {result === 'win'
                          ? 'You Won!'
                          : result === 'lose'
                            ? 'You Lost!'
                            : "It's a Draw!"}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-4 flex-wrap justify-center">
            {choices.map((choice) => (
              <motion.button
                key={choice.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={isPlaying}
                onClick={() => playGame(choice.id)}
                className={cn(
                  'group flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-2xl border transition-all w-20 sm:w-24 md:w-32',
                  userChoice === choice.id
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-card/40 border-border/50 hover:border-primary/20'
                )}
              >
                <span className="text-2xl sm:text-3xl grayscale group-hover:grayscale-0 transition-all">
                  {choice.icon}
                </span>
                <span
                  className={cn(
                    'text-[8px] sm:text-[9px] font-bold uppercase tracking-widest transition-all',
                    userChoice === choice.id
                      ? 'text-primary'
                      : 'text-muted-foreground/40 group-hover:text-muted-foreground'
                  )}
                >
                  {choice.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 pt-12">
          <Button
            variant="ghost"
            onClick={resetGame}
            disabled={!userChoice || isPlaying}
            className="h-10 px-6 rounded-lg text-[9px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:bg-muted gap-2"
          >
            <RotateCcw className="w-3 h-3" /> Reset Round
          </Button>
          <Button
            variant="ghost"
            onClick={resetScores}
            className="h-10 px-6 rounded-lg text-[9px] font-bold uppercase tracking-widest text-red-500/40 hover:text-red-500 hover:bg-red-500/5 gap-2"
          >
            <Activity className="w-3 h-3" /> Reset Scores
          </Button>
        </div>
      </div>
    </div>
  );
}
