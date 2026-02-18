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

import { Skeleton } from '@/components/ui/skeleton';

export default function TimezonesPage() {
  const { selectedTimezones, setBaseTime, setAllTimezones, baseTime, timeOffset } = useTimezoneStore();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Time Tick removed to improve slider performance as requested

  // Sync with DB
  useEffect(() => {
    if (session?.user) {
      setIsLoading(true);
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
        .catch(err => console.error('Failed to fetch timezones:', err))
        .finally(() => setIsLoading(false));
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
      <div className="w-full space-y-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 3xl:grid-cols-6 gap-6 items-start pb-12">
            {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="aspect-[4/5] w-full bg-card/40 border border-border/50 rounded-3xl p-6 space-y-6">
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-8 w-2/3" />
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <Skeleton className="h-32 w-32 rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="h-4 w-1/2 mx-auto" />
                        </div>
                    </div>
                ))
            ) : (
                <>
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
                </>
            )}
        </div>
      </div>
    </div>
  );
}
