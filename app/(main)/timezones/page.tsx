"use client";

import React, { useEffect } from 'react';
import { useTimezoneStore } from '@/hooks/use-timezone-store';
import { TimezoneCard } from '@/components/timezone-tool/timezone-card';
import { AddTimezoneCard } from '@/components/timezone-tool/add-timezone-card';

export default function TimezonesPage() {
  const { selectedTimezones } = useTimezoneStore();

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap gap-6 items-start justify-center md:justify-start">
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
  );
}
