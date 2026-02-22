'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  RotateCcw,
  User,
  Cpu,
  Trophy,
  Settings2,
  X,
  Circle,
  Hash,
  Activity,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Player = 'X' | 'O' | null;
type GameMode = 'PvP' | 'PvE';

export default function TicTacToePage() {
  /* Matrix representation of the game board */
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));

  /* Turn management (true for X, false for O) */
  const [isXNext, setIsXNext] = useState(true);

  /* Game outcome and winning visual marks */
  const [winner, setWinner] = useState<Player | 'Draw'>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  /* Mode selection (vs Player or vs AI) */
  const [gameMode, setGameMode] = useState<GameMode>('PvE');

  /* Local session record */
  const [scores, setScores] = useState({ X: 0, O: 0, Draws: 0 });

  const calculateWinner = useCallback((squares: Player[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    if (squares.every((s) => s !== null))
      return { winner: 'Draw' as const, line: null };
    return null;
  }, []);

  const minimax = useCallback(
    (squares: Player[], depth: number, isMaximizing: boolean): number => {
      const result = calculateWinner(squares);
      if (result?.winner === 'O') return 10 - depth;
      if (result?.winner === 'X') return depth - 10;
      if (result?.winner === 'Draw') return 0;

      if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
          if (!squares[i]) {
            squares[i] = 'O';
            const score = minimax(squares, depth + 1, false);
            squares[i] = null;
            bestScore = Math.max(score, bestScore);
          }
        }
        return bestScore;
      } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
          if (!squares[i]) {
            squares[i] = 'X';
            const score = minimax(squares, depth + 1, true);
            squares[i] = null;
            bestScore = Math.min(score, bestScore);
          }
        }
        return bestScore;
      }
    },
    [calculateWinner]
  );

  const makeAIMove = useCallback(
    (currentBoard: Player[]) => {
      let bestScore = -Infinity;
      let move = -1;
      for (let i = 0; i < 9; i++) {
        if (!currentBoard[i]) {
          currentBoard[i] = 'O';
          const score = minimax(currentBoard, 0, false);
          currentBoard[i] = null;
          if (score > bestScore) {
            bestScore = score;
            move = i;
          }
        }
      }
      if (move !== -1) {
        const newBoard = [...currentBoard];
        newBoard[move] = 'O';
        setBoard(newBoard);
        setIsXNext(true);
        const result = calculateWinner(newBoard);
        if (result) {
          setWinner(result.winner);
          setWinningLine(result.line);
          updateScores(result.winner);
        }
      }
    },
    [minimax, calculateWinner]
  );

  useEffect(() => {
    if (gameMode === 'PvE' && !isXNext && !winner) {
      const timer = setTimeout(() => makeAIMove(board), 600);
      return () => clearTimeout(timer);
    }
  }, [isXNext, winner, gameMode, board, makeAIMove]);

  const updateScores = (w: Player | 'Draw') => {
    setScores((prev) => ({
      ...prev,
      [w === 'X' ? 'X' : w === 'O' ? 'O' : 'Draws']:
        prev[w === 'X' ? 'X' : w === 'O' ? 'O' : 'Draws'] + 1,
    }));
  };

  const handleClick = (i: number) => {
    if (board[i] || winner) return;
    if (gameMode === 'PvE' && !isXNext) return;

    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const result = calculateWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      updateScores(result.winner);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background overflow-y-auto">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-12 items-center py-6">
        {/* Left Side: Stats/Config */}
        <div className="md:col-span-4 space-y-8 px-4">
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/50">
                Tactical Node
              </h2>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    isXNext ? 'bg-blue-500 animate-pulse' : 'bg-muted'
                  )}
                />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {isXNext ? 'X Input Active' : 'O Input Active'}
                </span>
              </div>
            </div>

            <div className="flex p-1 bg-muted/40 rounded-xl border border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setGameMode('PvE');
                  resetGame();
                }}
                className={cn(
                  'flex-1 h-9 rounded-lg text-[10px] font-bold uppercase',
                  gameMode === 'PvE'
                    ? 'bg-background shadow-sm text-primary'
                    : 'text-muted-foreground'
                )}
              >
                AI Neural
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setGameMode('PvP');
                  resetGame();
                }}
                className={cn(
                  'flex-1 h-9 rounded-lg text-[10px] font-bold uppercase',
                  gameMode === 'PvP'
                    ? 'bg-background shadow-sm text-primary'
                    : 'text-muted-foreground'
                )}
              >
                Local
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'X Wins', val: scores.X, color: 'text-blue-500' },
              { label: 'O Wins', val: scores.O, color: 'text-rose-500' },
              {
                label: 'Draws',
                val: scores.Draws,
                color: 'text-muted-foreground',
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-card/40 border border-border/10 p-4 rounded-2xl flex flex-col items-center gap-2"
              >
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  {s.label}
                </span>
                <span className={cn('text-xl font-mono font-bold', s.color)}>
                  {s.val}
                </span>
              </div>
            ))}
          </div>

          <Button
            onClick={resetGame}
            variant="outline"
            className="w-full h-12 rounded-xl border-border/50 hover:bg-muted text-[10px] font-bold uppercase tracking-widest gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Board
          </Button>
        </div>

        {/* Center: Board */}
        <div className="md:col-span-8 flex justify-center p-4">
          <div className="relative">
            <div className="absolute -inset-20 bg-primary/5 blur-3xl rounded-full opacity-30" />
            <div className="grid grid-cols-3 gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/20 border border-border/50 rounded-[1.5rem] sm:rounded-[2rem] relative z-10 backdrop-blur-xl">
              {board.map((cell, i) => {
                const isWinning = winningLine?.includes(i);
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: cell || winner ? 1 : 0.98 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleClick(i)}
                    className={cn(
                      'w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-xl sm:rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-light transition-all duration-300 border-2',
                      cell === 'X'
                        ? 'bg-blue-500/5 border-blue-500/10 text-blue-500'
                        : cell === 'O'
                          ? 'bg-rose-500/5 border-rose-500/10 text-rose-500'
                          : 'bg-background/40 border-transparent hover:border-border/30',
                      isWinning &&
                        cell === 'X' &&
                        'bg-blue-500 text-white border-blue-400 shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)]',
                      isWinning &&
                        cell === 'O' &&
                        'bg-rose-500 text-white border-rose-400 shadow-[0_0_30px_-5px_rgba(244,63,94,0.5)]'
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {cell === 'X' && (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                        >
                          <X className="w-12 h-12 stroke-[1.5px]" />
                        </motion.div>
                      )}
                      {cell === 'O' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Circle className="w-10 h-10 stroke-[1.5px]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {winner && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-16 left-0 right-0 text-center"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-primary animate-pulse">
                    {winner === 'Draw'
                      ? 'Network Saturated (Draw)'
                      : `${winner} Dominance Established`}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
