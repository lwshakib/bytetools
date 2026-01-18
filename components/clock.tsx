"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ClockProps {
  international?: boolean;
  clockType?: "digital" | "analog" | "both";
  theme?: "default" | "sunset" | "ocean" | "forest" | "neon";
  size?: "sm" | "md" | "lg" | "xl";
  showSeconds?: boolean;
  showDate?: boolean;
  animationSpeed?: "slow" | "normal" | "fast";
  className?: string;
  time?: Date;
  onTimeChange?: (time: Date) => void;
  updateInterval?: number;
}

export default function Clock({
  international = true,
  clockType = "both",
  theme = "default",
  size = "md",
  showSeconds = true,
  showDate = true,
  animationSpeed = "normal",
  className = "",
  time: externalTime,
  onTimeChange,
  updateInterval = 1000,
}: ClockProps) {
  const [internalTime, setInternalTime] = useState(new Date());
  const time = externalTime || internalTime;

  useEffect(() => {
    if (!externalTime) {
      const timer = setInterval(() => {
        const newTime = new Date();
        setInternalTime(newTime);
        onTimeChange?.(newTime);
      }, updateInterval);

      return () => clearInterval(timer);
    }
  }, [externalTime, onTimeChange, updateInterval]);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDegrees = (hours + minutes / 60) * 30;
  const minuteDegrees = (minutes + seconds / 60) * 6;
  const secondDegrees = seconds * 6;

  // Extremely delicate proportions for a professional look
  const config = {
    sm: { dimension: 140, multiplier: 0.6, markerLarge: 2.5, markerSmall: 1.2, labelOffset: "7%", numSize: "text-[7px]" },
    md: { dimension: 200, multiplier: 0.8, markerLarge: 4, markerSmall: 2, labelOffset: "9%", numSize: "text-[9px]" },
    lg: { dimension: 260, multiplier: 1.0, markerLarge: 5, markerSmall: 2.5, labelOffset: "11%", numSize: "text-[10px]" },
    xl: { dimension: 320, multiplier: 1.2, markerLarge: 7, markerSmall: 3.5, labelOffset: "13%", numSize: "text-xs" },
  }[size];

  const digitalTextSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  // Theme configuration using Shadcn UI semantic tokens
  const themeStyles = {
    default: {
      clockFace: "border-border/40 bg-card/50 shadow-sm",
      hourMarker: "bg-foreground/20",
      minuteMarker: "bg-foreground/5",
      hourHand: "bg-foreground",
      minuteHand: "bg-muted-foreground",
      secondHand: "bg-primary",
      centerDot: "bg-foreground",
      centerDotInner: "bg-primary",
      digitalTime: "text-foreground",
      digitalDate: "text-muted-foreground",
    },
    sunset: {
      clockFace: "border-orange-500/20 bg-orange-500/5 shadow-sm",
      hourMarker: "bg-orange-500/30",
      minuteMarker: "bg-orange-500/10",
      hourHand: "bg-orange-500",
      minuteHand: "bg-orange-400/60",
      secondHand: "bg-primary",
      centerDot: "bg-orange-500",
      centerDotInner: "bg-primary",
      digitalTime: "text-orange-600 dark:text-orange-400",
      digitalDate: "text-orange-500/40",
    },
    ocean: {
      clockFace: "border-blue-500/20 bg-blue-500/5 shadow-sm",
      hourMarker: "bg-blue-500/30",
      minuteMarker: "bg-blue-500/10",
      hourHand: "bg-blue-500",
      minuteHand: "bg-blue-400/60",
      secondHand: "bg-primary",
      centerDot: "bg-blue-500",
      centerDotInner: "bg-primary",
      digitalTime: "text-blue-600 dark:text-blue-400",
      digitalDate: "text-blue-500/40",
    },
    forest: {
      clockFace: "border-emerald-500/20 bg-emerald-500/5 shadow-sm",
      hourMarker: "bg-emerald-500/30",
      minuteMarker: "bg-emerald-500/10",
      hourHand: "bg-emerald-500",
      minuteHand: "bg-emerald-400/60",
      secondHand: "bg-primary",
      centerDot: "bg-emerald-500",
      centerDotInner: "bg-primary",
      digitalTime: "text-emerald-600 dark:text-emerald-400",
      digitalDate: "text-emerald-500/40",
    },
    neon: {
      clockFace: "border-primary/20 bg-primary/5 shadow-sm",
      hourMarker: "bg-primary/30",
      minuteMarker: "bg-muted/40",
      hourHand: "bg-primary",
      minuteHand: "bg-muted-foreground",
      secondHand: "bg-foreground",
      centerDot: "bg-primary",
      centerDotInner: "bg-foreground",
      digitalTime: "text-primary",
      digitalDate: "text-muted-foreground/40",
    },
  }[theme];

  const animationClass = {
    slow: "transition-transform duration-1000",
    normal: "transition-transform duration-500",
    fast: "transition-transform duration-300",
  }[animationSpeed];

  return (
    <div 
      className={cn("relative flex flex-col items-center justify-center select-none", className)}
      style={{ width: config.dimension, height: config.dimension }}
    >
      {/* Analog Face */}
      {clockType !== "digital" && (
        <div
          className={cn(
            "absolute inset-0 rounded-full border backdrop-blur-md flex items-center justify-center transition-colors duration-500",
            themeStyles.clockFace
          )}
        >
          {/* Numbers & Markers */}
          {[...Array(60)].map((_, i) => {
            const isHour = i % 5 === 0;
            return (
              <div
                key={i}
                className="absolute inset-0 flex justify-center"
                style={{ transform: `rotate(${i * 6}deg)` }}
              >
                <div
                  className={cn(
                    "rounded-full transition-colors duration-500",
                    isHour ? themeStyles.hourMarker : themeStyles.minuteMarker
                  )}
                  style={{
                    width: isHour ? 1.2 : 0.4,
                    height: isHour ? config.markerLarge : config.markerSmall,
                    marginTop: 3,
                  }}
                />
                {isHour && (
                  <div
                    className={cn(
                        "absolute font-black tracking-tighter opacity-20 uppercase transition-colors duration-500",
                        config.numSize,
                        themeStyles.digitalTime
                    )}
                    style={{
                      top: config.labelOffset,
                      transform: `rotate(${-i * 6}deg)`,
                    }}
                  >
                    {i / 5 === 0 ? 12 : i / 5}
                  </div>
                )}
              </div>
            );
          })}

          {/* Hands - Even thinner and shorter per feedback */}
          {/* Hour hand */}
          <div
            className={cn("absolute w-[1px] rounded-full origin-bottom z-10 transition-colors duration-500", themeStyles.hourHand, animationClass)}
            style={{
              height: `${14 * config.multiplier}%`,
              bottom: "50%",
              transform: `rotate(${hourDegrees}deg)`,
            }}
          />

          {/* Minute hand */}
          <div
            className={cn("absolute w-[0.8px] rounded-full origin-bottom z-20 opacity-70 transition-colors duration-500", themeStyles.minuteHand, animationClass)}
            style={{
              height: `${20 * config.multiplier}%`,
              bottom: "50%",
              transform: `rotate(${minuteDegrees}deg)`,
            }}
          />

          {/* Second hand */}
          {showSeconds && (
            <div
              className={cn("absolute w-[0.4px] rounded-full origin-bottom z-30 transition-colors duration-500", themeStyles.secondHand, animationClass)}
              style={{
                height: `${24 * config.multiplier}%`,
                bottom: "50%",
                transform: `rotate(${secondDegrees}deg)`,
              }}
            />
          )}

          {/* Center dot - more subtle */}
          <div
            className={cn("absolute w-1.2 h-1.2 rounded-full z-40 flex items-center justify-center transition-colors duration-500", themeStyles.centerDot)}
          >
            <div className={cn("w-0.4 h-0.4 rounded-full transition-colors duration-500", themeStyles.centerDotInner)} />
          </div>
        </div>
      )}

      {/* Digital Section */}
      {clockType !== "analog" && (
        <div
          className={cn(
            "text-center z-50 pointer-events-none transition-colors duration-500",
            clockType === "both" ? "mt-4 absolute -bottom-10" : ""
          )}
        >
          <div className={cn("font-black tracking-[0.2em] tabular-nums transition-colors duration-500", digitalTextSizes[size], themeStyles.digitalTime)}>
            {time.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: showSeconds ? "2-digit" : undefined,
              hour12: !international,
            }).toUpperCase()}
          </div>
          {showDate && (
            <div className={cn("text-[8px] uppercase font-black tracking-[0.3em] mt-0.5 opacity-60 transition-colors duration-500 text-foreground/60", themeStyles.digitalDate)}>
              {time.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
