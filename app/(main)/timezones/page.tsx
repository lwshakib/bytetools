'use client';

import React, { useState, useEffect } from 'react';
import { useTimezoneStore } from '@/hooks/use-timezone-store';
import { TimezoneItem } from '@/hooks/use-timezone-store';
import { TimezoneCard } from '@/components/timezone-tool/timezone-card';
import { AddTimezoneCard } from '@/components/timezone-tool/add-timezone-card';
import { useSession } from '@/lib/auth-client';
import { Skeleton } from '@/components/ui/skeleton';

export default function TimezonesPage() {
  /* Selected timezones managed by the global store */
  const {
    selectedTimezones,
    setAllTimezones,
  } = useTimezoneStore();

  /* Authentication session data */
  const { data: session } = useSession();

  /* Loading state for fetching data from the cloud */
  const [isLoading, setIsLoading] = useState(false);

  const syncToCloud = React.useCallback(async (items: TimezoneItem[]) => {
    try {
      await fetch('/api/sync/timezones', {
        method: 'POST',
        body: JSON.stringify(items),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Failed to sync timezones:', err);
    }
  }, []);

  // Sync with DB
  useEffect(() => {
    if (session?.user) {
      Promise.resolve().then(() => setIsLoading(true));
      // Fetch from DB
      fetch('/api/sync/timezones')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            // Merge or overwrite? Usually overwrite from cloud is safer for "Sync"
            setAllTimezones(data);
          } else {
            // If cloud is empty, push local to cloud
            syncToCloud(selectedTimezones);
          }
        })
        .catch((err) => console.error('Failed to fetch timezones:', err))
        .finally(() => setIsLoading(false));
    }
  }, [session?.user, syncToCloud, selectedTimezones, setAllTimezones]);

  // Sync to DB when selectedTimezones change
  useEffect(() => {
    if (session?.user) {
      const timeout = setTimeout(() => {
        syncToCloud(selectedTimezones);
      }, 2000); // Debounce sync
      return () => clearTimeout(timeout);
    }
  }, [selectedTimezones, session?.user, syncToCloud]);

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-y-auto">
      <div className="w-full space-y-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 3xl:grid-cols-6 gap-6 items-start pb-12">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-card/40 border border-border/50 w-full h-[220px] rounded-xl flex flex-col p-0 overflow-hidden relative"
              >
                <div className="flex-1 flex flex-col justify-between px-6 py-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <Skeleton className="h-12 w-32" />
                      <Skeleton className="h-6 w-10" />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Skeleton className="h-4 w-12 rounded" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>

                  <div className="relative h-14 mt-auto">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-border/30" />
                    <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-muted/40" />
                    <div className="absolute bottom-0 inset-x-0 flex justify-between">
                      <Skeleton className="h-2 w-3" />
                      <Skeleton className="h-2 w-3" />
                      <Skeleton className="h-2 w-3" />
                      <Skeleton className="h-2 w-3" />
                      <Skeleton className="h-2 w-3" />
                    </div>
                  </div>
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
