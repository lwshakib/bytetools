"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, RotateCcw, User, Cpu, Circle, X, ShieldCheck, Zap, Activity, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type SquareValue = 'X' | 'O' | null;

export default function TicTacToePage() {
  const [board, setBoard] = useState<SquareValue[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<SquareValue | 'Draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isCpuActive, setIsCpuActive] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, Draw: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('bt-ttt-scores');
    if (saved) { try { setScores(JSON.parse(saved)); } catch (e) {} }
  }, []);

  useEffect(() => {
    localStorage.setItem('bt-ttt-scores', JSON.stringify(scores));
  }, [scores]);

  const calculateWinner = (squares: SquareValue[]) => {
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return { winner: squares[a], line: [a, b, c] };
    }
    if (squares.every(s => s !== null)) return { winner: 'Draw' as const, line: null };
    return null;
  };

  const handleSquareClick = (i: number) => {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    const outcome = calculateWinner(newBoard);
    if (outcome) { setWinner(outcome.winner); setWinningLine(outcome.line); updateScore(outcome.winner); }
    else setIsXNext(!isXNext);
  };

  const updateScore = (result: SquareValue | 'Draw') => {
    if (result === 'X') setScores(p => ({ ...p, X: p.X + 1 }));
    else if (result === 'O') setScores(p => ({ ...p, O: p.O + 1 }));
    else setScores(p => ({ ...p, Draw: p.Draw + 1 }));
    if (result === 'Draw') toast.info("Grid Saturate. Draw.");
    else toast.success(`Node ${result} secured victory.`);
  };

  const makeCpuMove = useCallback(() => {
    const available = board.map((v, i) => v === null ? i : null).filter((v) : v is number => v !== null);
    if (available.length === 0 || winner) return;
    const move = available[Math.floor(Math.random() * available.length)];
    handleSquareClick(move);
  }, [board, winner]);

  useEffect(() => {
    if (isCpuActive && !isXNext && !winner) {
      const timer = setTimeout(makeCpuMove, 600);
      return () => clearTimeout(timer);
    }
  }, [isXNext, isCpuActive, winner, makeCpuMove]);

  const resetBoard = () => { setBoard(Array(9).fill(null)); setIsXNext(true); setWinner(null); setWinningLine(null); };
  const resetScores = () => { setScores({ X: 0, O: 0, Draw: 0 }); toast.success("Historical parity reset."); };

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
                <Hash className="w-3.5 h-3.5" />
                Grid Logic Simulation
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase">NODE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">TACTICS</span></h1>
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.3em] opacity-40">Tic-Tac-Toe Neural Matrix</p>
        </div>

        {/* Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-12 items-start max-w-6xl mx-auto w-full">
            {/* Left: Configuration */}
            <div className="space-y-8 flex flex-col">
                <div className="bg-card/40 border border-border/50 rounded-[2.5rem] p-8 space-y-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                        <Cpu className="w-32 h-32" />
                    </div>
                    <div className="space-y-2 relative z-10 text-center lg:text-left">
                        <h3 className="text-xs font-black uppercase tracking-widest">Protocol Sync</h3>
                        <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest leading-relaxed">Adjust operational engagement mode.</p>
                    </div>
                    <div className="flex p-1.5 bg-muted/30 rounded-2xl border border-border/50 relative z-10">
                        <Button
                            variant={isCpuActive ? 'secondary' : 'ghost'}
                            onClick={() => { setIsCpuActive(true); resetBoard(); }}
                            className={cn("flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", isCpuActive ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "opacity-40")}
                        >
                            vs Neural Core
                        </Button>
                        <Button
                            variant={!isCpuActive ? 'secondary' : 'ghost'}
                            onClick={() => { setIsCpuActive(false); resetBoard(); }}
                            className={cn("flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", !isCpuActive ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "opacity-40")}
                        >
                            Local Link
                        </Button>
                    </div>
                </div>

                <div className="bg-card/40 border border-border/50 rounded-[2.5rem] p-8 flex flex-col items-center gap-6 shadow-xl">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Active Sector</span>
                    <div className="flex items-center gap-6">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all shadow-2xl", isXNext ? "bg-amber-500/10 border-amber-500 text-amber-500 scale-110" : "border-border/50 opacity-10")}>
                            <X className="w-7 h-7" />
                        </div>
                        <div className="text-xl font-black text-muted-foreground/20 animate-pulse">➔</div>
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all shadow-2xl", !isXNext ? "bg-white/5 border-white text-white scale-110 shadow-white/5" : "border-border/50 opacity-10")}>
                            <Circle className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle: Grid */}
            <div className="flex flex-col items-center gap-12">
                <div className="grid grid-cols-3 gap-4 p-5 bg-muted/20 border-2 border-border/50 rounded-[3.5rem] shadow-inner relative group">
                    <div className="absolute -inset-10 bg-amber-500/5 blur-[80px] rounded-full opacity-50 group-hover:opacity-100 transition-all duration-1000" />
                    {board.map((square, i) => {
                    const isWinningSquare = winningLine?.includes(i);
                    return (
                        <motion.button
                        key={i}
                        whileHover={!square && !winner ? { scale: 1.05, backgroundColor: 'rgba(255,255,255,0.03)' } : {}}
                        whileTap={!square && !winner ? { scale: 0.95 } : {}}
                        onClick={() => handleSquareClick(i)}
                        className={cn(
                            "w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-2xl transition-all duration-500 relative z-10",
                            !square && !winner && "bg-background/20 border border-border/50",
                            square === 'X' && "text-amber-500 bg-amber-500/5 border-2 border-amber-500/20",
                            square === 'O' && "text-white bg-white/5 border-2 border-white/10",
                            isWinningSquare && "bg-amber-500 text-black scale-110 shadow-[0_0_50px_rgba(245,158,11,0.4)] border-amber-400 z-20"
                        )}
                        >
                        <AnimatePresence mode="wait">
                            {square === 'X' && (
                            <motion.div initial={{ scale: 0.2, rotate: -90, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }}>
                                <X className={cn("w-12 h-12 md:w-16 md:h-16", isWinningSquare && "text-black")} />
                            </motion.div>
                            )}
                            {square === 'O' && (
                            <motion.div initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                <Circle className={cn("w-10 h-10 md:w-14 md:h-14", isWinningSquare && "text-black")} />
                            </motion.div>
                            )}
                        </AnimatePresence>
                        </motion.button>
                    );
                    })}
                </div>
            </div>

            {/* Right: Scores */}
            <div className="bg-card/40 border border-border/50 rounded-[2.5rem] p-10 flex flex-col items-center gap-10 shadow-xl overflow-hidden relative">
                <div className="absolute -bottom-10 -right-10 p-10 opacity-[0.02]">
                    <Trophy className="w-48 h-48" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 relative z-10">Historical Parity</h3>
                
                <div className="space-y-10 w-full relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                                <X className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Sector X</span>
                        </div>
                        <span className="text-3xl font-black tabular-nums">{scores.X}</span>
                    </div>
                    <div className="flex items-center justify-between opacity-40">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center">
                                <Hash className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Parity</span>
                        </div>
                        <span className="text-3xl font-black tabular-nums">{scores.Draw}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center text-white">
                                <Circle className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Sector O</span>
                        </div>
                        <span className="text-3xl font-black tabular-nums">{scores.O}</span>
                    </div>
                </div>

                <div className="pt-10 border-t border-border/10 w-full flex flex-col gap-3">
                    <Button variant="ghost" onClick={resetBoard} className="h-12 w-full rounded-xl text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-muted">
                        <RotateCcw className="w-4 h-4" /> Refresh Grid
                    </Button>
                    <Button variant="ghost" onClick={resetScores} className="h-12 w-full rounded-xl text-[9px] font-black uppercase tracking-widest text-red-500/40 hover:text-red-500 hover:bg-red-500/5 gap-2">
                        <Activity className="w-4 h-4" /> Clear Parity
                    </Button>
                </div>
            </div>
        </div>

        {/* Tactical Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-border/10 pt-16 max-w-5xl mx-auto">
            {[
                { icon: ShieldCheck, title: "Neural Sync", desc: "Automated decision logic for high-frequency engagement cycles.", color: "text-amber-500", bg: "bg-amber-500/10" },
                { icon: Zap, title: "Real-time Parity", desc: "Instant grid saturation analysis and outcome verification.", color: "text-blue-500", bg: "bg-blue-500/10" },
                { icon: Activity, title: "Persistence", desc: "Historical performance data synchronization across sessions.", color: "text-emerald-500", bg: "bg-emerald-500/10" }
            ].map((item, i) => (
                <div key={i} className="p-8 rounded-[2rem] bg-card/40 border border-border/50 relative overflow-hidden group shadow-lg">
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
