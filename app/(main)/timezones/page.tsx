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

  // Dynamic Time Tick removed to improve slider performance as requested

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
        <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Global Timezones</h1>
            <p className="text-muted-foreground text-sm">Monitor and synchronize time across your preferred global regions.</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 items-start pb-12">
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
