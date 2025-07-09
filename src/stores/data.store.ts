import { create } from 'zustand';
import type { Message } from '../utils/data';

export const useData = create<{
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  chatFile: File | null;
  setChatFile: (chatFile: File | null) => void;
  pastedText: string;
  setPastedText: (text: string) => void;
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  clearDateFilters: () => void;
  clearData: () => void;
}>((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
  chatFile: null,
  setChatFile: (chatFile) => set({ chatFile }),
  pastedText: '',
  setPastedText: (text) => set({ pastedText: text }),
  startDate: null,
  endDate: null,
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
  clearDateFilters: () => set({ startDate: null, endDate: null }),
  clearData: () => set({ messages: [], chatFile: null, pastedText: '', startDate: null, endDate: null }),
}));
