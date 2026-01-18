"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, RotateCcw, User, Cpu, Circle, X } from 'lucide-react';
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

  // Load scores
  useEffect(() => {
    const saved = localStorage.getItem('bt-ttt-scores');
    if (saved) {
      try { setScores(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  // Save scores
  useEffect(() => {
    localStorage.setItem('bt-ttt-scores', JSON.stringify(scores));
  }, [scores]);

  const calculateWinner = (squares: SquareValue[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    if (squares.every(s => s !== null)) {
      return { winner: 'Draw' as const, line: null };
    }
    return null;
  };

  const handleSquareClick = (i: number) => {
    if (board[i] || winner) return;

    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    
    const outcome = calculateWinner(newBoard);
    if (outcome) {
      setWinner(outcome.winner);
      setWinningLine(outcome.line);
      updateScore(outcome.winner);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const updateScore = (result: SquareValue | 'Draw') => {
    if (result === 'X') setScores(p => ({ ...p, X: p.X + 1 }));
    else if (result === 'O') setScores(p => ({ ...p, O: p.O + 1 }));
    else setScores(p => ({ ...p, Draw: p.Draw + 1 }));

    if (result === 'Draw') toast.info("It's a draw!");
    else toast.success(`Player ${result} won!`);
  };

  const makeCpuMove = useCallback(() => {
    const available = board.map((v, i) => v === null ? i : null).filter((v) : v is number => v !== null);
    if (available.length === 0 || winner) return;

    // Very simple CPU: try to win, then try to block, otherwise random
    const move = available[Math.floor(Math.random() * available.length)];
    handleSquareClick(move);
  }, [board, winner, handleSquareClick]);

  useEffect(() => {
    if (isCpuActive && !isXNext && !winner) {
      const timer = setTimeout(makeCpuMove, 600);
      return () => clearTimeout(timer);
    }
  }, [isXNext, isCpuActive, winner, makeCpuMove]);

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, Draw: 0 });
    toast.success("Scores reset!");
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-hidden p-6 md:p-8 lg:p-12 items-center justify-center">
      <div className="w-full max-w-4xl space-y-12">
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="p-3 bg-amber-500/10 rounded-2xl mb-2">
              <Hash className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Tic Tac Toe</h1>
            <p className="text-muted-foreground text-xs font-bold opacity-60 uppercase tracking-widest">
              {isCpuActive ? "You (X) vs CPU (O)" : "X vs O (Local Multiplier)"}
            </p>
          </div>

          <Card className="bg-card/50 border-border/50 rounded-[2rem] shadow-xl overflow-hidden">
            <CardContent className="p-6 flex items-center gap-8">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  <X className="w-3 h-3 text-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Player X</span>
                </div>
                <span className="text-2xl font-black tabular-nums">{scores.X}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="w-3 h-3 text-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Draws</span>
                </div>
                <span className="text-2xl font-black tabular-nums">{scores.Draw}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  <Circle className="w-3 h-3 text-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Player O</span>
                </div>
                <span className="text-2xl font-black tabular-nums">{scores.O}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Area */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
          {/* Controls */}
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="p-1 bg-muted/30 rounded-2xl border border-border/50 flex">
              <Button
                variant={isCpuActive ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => { setIsCpuActive(true); resetBoard(); }}
                className={cn(
                    "flex-1 md:w-32 rounded-xl text-[10px] font-black uppercase tracking-widest h-10",
                    isCpuActive && "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                )}
              >
                vs CPU
              </Button>
              <Button
                variant={!isCpuActive ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => { setIsCpuActive(false); resetBoard(); }}
                className={cn(
                    "flex-1 md:w-32 rounded-xl text-[10px] font-black uppercase tracking-widest h-10",
                    !isCpuActive && "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                )}
              >
                Local PvP
              </Button>
            </div>
            
            <div className="bg-card/30 border border-border/50 p-6 rounded-[2rem] text-center space-y-3">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Next Turn</div>
                <div className="flex items-center justify-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all",
                        isXNext ? "border-amber-500 bg-amber-500/10 text-amber-500 scale-110 shadow-lg" : "border-border/50 opacity-20"
                    )}>
                        <X className="w-5 h-5" />
                    </div>
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all",
                        !isXNext ? "border-amber-500 bg-amber-500/10 text-amber-500 scale-110 shadow-lg" : "border-border/50 opacity-20"
                    )}>
                        <Circle className="w-4 h-4" />
                    </div>
                </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-muted/20 border border-border/50 rounded-[3rem] shadow-2xl relative">
            {board.map((square, i) => {
              const isWinningSquare = winningLine?.includes(i);
              return (
                <motion.button
                  key={i}
                  whileHover={!square && !winner ? { scale: 0.95 } : {}}
                  whileTap={!square && !winner ? { scale: 0.9 } : {}}
                  onClick={() => handleSquareClick(i)}
                  className={cn(
                    "w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-4xl shadow-lg transition-all duration-300",
                    !square && !winner && "bg-card hover:bg-muted border border-border sm:border-transparent",
                    square === 'X' && "text-amber-500 bg-amber-500/5 border-2 border-amber-500/20",
                    square === 'O' && "text-foreground bg-foreground/5 border-2 border-foreground/10",
                    isWinningSquare && "bg-amber-500 text-black scale-105 shadow-2xl shadow-amber-500/40 border-amber-500"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {square === 'X' && (
                      <motion.div initial={{ scale: 0.5, rotate: -45, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }}>
                        <X className={cn("w-10 h-10 md:w-14 md:h-14", isWinningSquare && "text-black")} />
                      </motion.div>
                    )}
                    {square === 'O' && (
                      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <Circle className={cn("w-8 h-8 md:w-12 md:h-12", isWinningSquare && "text-black")} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="ghost"
            onClick={resetBoard}
            className="rounded-xl h-12 px-6 font-black uppercase tracking-widest text-[10px] gap-2 opacity-60 hover:opacity-100"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Board
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
