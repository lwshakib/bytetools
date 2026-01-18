import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cities } from '@/lib/timezone-data';

export interface TimezoneItem {
  id: string;
  city: string;
  country: string;
  timezone: string;
}

interface TimezoneStore {
  selectedTimezones: TimezoneItem[];
  baseTime: number; // timestamp in ms
  selectedId: string | null;
  addTimezone: (item: TimezoneItem) => void;
  updateTimezone: (id: string, item: Partial<TimezoneItem>) => void;
  removeTimezone: (id: string) => void;
  setBaseTime: (time: number) => void;
  resetTime: () => void;
  setSelectedId: (id: string | null) => void;
}

const getLocalTimezoneItem = (): TimezoneItem => {
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const match = cities.find(c => c.timezone === localTz);
  
  return {
    id: 'local',
    city: match ? `${match.city} (Local)` : 'Current Location',
    country: match ? match.country : '',
    timezone: localTz
  };
};

export const useTimezoneStore = create<TimezoneStore>()(
  persist(
    (set) => ({
      selectedTimezones: [getLocalTimezoneItem()],
      baseTime: Date.now(),
      selectedId: 'local',
      addTimezone: (item) => set((state) => ({
        selectedTimezones: [...state.selectedTimezones, item],
        selectedId: item.id
      })),
      updateTimezone: (id, newItem) => set((state) => ({
        selectedTimezones: state.selectedTimezones.map((tz) => 
          tz.id === id ? { ...tz, ...newItem } : tz
        )
      })),
      removeTimezone: (id) => set((state) => ({
        selectedTimezones: state.selectedTimezones.filter((t) => t.id !== id),
        selectedId: state.selectedId === id ? (state.selectedTimezones.length > 1 ? state.selectedTimezones[0].id : null) : state.selectedId
      })),
      setBaseTime: (time) => set({ baseTime: time }),
      resetTime: () => set({ baseTime: Date.now() }),
      setSelectedId: (id) => set({ selectedId: id }),
    }),
    {
      name: 'timezone-storage',
    }
  )
);
