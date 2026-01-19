"use client";

import React, { useState, useEffect } from 'react';
import { useTimezoneStore } from '@/hooks/use-timezone-store';
import { TimezoneItem } from '@/hooks/use-timezone-store';
import { TimezoneCard } from '@/components/timezone-tool/timezone-card';
import { AddTimezoneCard } from '@/components/timezone-tool/add-timezone-card';
import { useSession } from '@/lib/auth-client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Clock, Globe, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TimezonesPage() {
  const { selectedTimezones, setBaseTime, setAllTimezones, baseTime, timeOffset } = useTimezoneStore();
  const { data: session } = useSession();

  // Dynamic Time Tick - Always updates based on the current system time + user offset
  useEffect(() => {
    const interval = setInterval(() => {
      setBaseTime(Date.now() + timeOffset);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timeOffset, setBaseTime]);

  // Sync with DB
  useEffect(() => {
    if (session?.user) {
      // Fetch from DB
      fetch('/api/sync/timezones')
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                // Merge or overwrite? Usually overwrite from cloud is safer for "Sync"
                setAllTimezones(data);
            } else {
                // If cloud is empty, push local to cloud
                syncToCloud(selectedTimezones);
            }
        })
        .catch(err => console.error('Failed to fetch timezones:', err));
    }
  }, [session?.user]);

  // Sync to DB when selectedTimezones change
  useEffect(() => {
    if (session?.user) {
        const timeout = setTimeout(() => {
            syncToCloud(selectedTimezones);
        }, 2000); // Debounce sync
        return () => clearTimeout(timeout);
    }
  }, [selectedTimezones, session?.user]);

  const syncToCloud = async (items: TimezoneItem[]) => {
    try {
        await fetch('/api/sync/timezones', {
            method: 'POST',
            body: JSON.stringify(items),
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('Failed to sync timezones:', err);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-y-auto p-6 md:p-8 lg:p-12">
      <div className="w-full max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-4">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2"
            >
                <Globe className="w-3.5 h-3.5" />
                Chronos Engine Active
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase">CHRONO <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">SYNCC</span></h1>
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.3em] opacity-40">Global temporal synchronization & logic</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { icon: Clock, title: "Real-time Drift", desc: "Sub-millisecond synchronization across all temporal zones.", color: "text-blue-500", bg: "bg-blue-500/10" },
                { icon: Globe, title: "Spatial Mapping", desc: "Precision coordinate-based timezone identification.", color: "text-indigo-500", bg: "bg-indigo-500/10" },
                { icon: ShieldCheck, title: "Cloud Mesh", desc: "Encrypted persistence of your custom global layout.", color: "text-emerald-500", bg: "bg-emerald-500/10" }
            ].map((item, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-[2rem] bg-card border border-border/50 relative overflow-hidden group shadow-xl"
                >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110", item.bg)}>
                        <item.icon className={cn("w-6 h-6", item.color)} />
                    </div>
                    <h4 className="text-[10px] font-black text-foreground mb-3 uppercase tracking-widest">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-bold uppercase tracking-tighter opacity-40">{item.desc}</p>
                </motion.div>
            ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8 items-start pb-12">
            {selectedTimezones.map((tz) => (
            <TimezoneCard
                key={tz.id}
                id={tz.id}
                city={tz.city}
                country={tz.country}
                timezone={tz.timezone}
            />
            ))}
            <AddTimezoneCard />
        </div>
      </div>
    </div>
  );
}
