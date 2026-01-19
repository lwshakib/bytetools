import { create } from 'zustand';
import { cities } from '@/lib/timezone-data';

export interface TimezoneItem {
  id: string;
  city: string;
  country: string;
  timezone: string;
}

interface TimezoneStore {
  selectedTimezones: TimezoneItem[];
  baseTime: number; // Current viewing timestamp in ms
  timeOffset: number; // User adjusted offset in ms
  selectedId: string | null;
  addTimezone: (item: TimezoneItem) => void;
  updateTimezone: (id: string, item: Partial<TimezoneItem>) => void;
  removeTimezone: (id: string) => void;
  setBaseTime: (time: number) => void;
  setTimeOffset: (offset: number) => void;
  resetTime: () => void;
  setSelectedId: (id: string | null) => void;
  setAllTimezones: (items: TimezoneItem[]) => void;
}

const getLocalTimezoneItem = (): TimezoneItem => {
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const match = cities.find(c => c.timezone === localTz);
  
  // Extract city from timezone if match not found (e.g. "Asia/Dhaka" -> "Dhaka")
  const cityFromTz = localTz.split('/').pop()?.replace(/_/g, ' ') || 'Unknown Location';

  return {
    id: 'local',
    city: match ? match.city : cityFromTz,
    country: match ? match.country : '',
    timezone: localTz
  };
};

export const useTimezoneStore = create<TimezoneStore>()((set) => ({
  selectedTimezones: [getLocalTimezoneItem()],
  baseTime: Date.now(),
  timeOffset: 0,
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
  setTimeOffset: (offset) => set({ timeOffset: offset }),
  resetTime: () => set({ baseTime: Date.now(), timeOffset: 0 }),
  setSelectedId: (id) => set({ selectedId: id }),
  setAllTimezones: (items) => set({ selectedTimezones: items }),
}));
