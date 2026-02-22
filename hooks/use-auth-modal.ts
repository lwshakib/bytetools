/**
 * Global state management for controlling the Authentication Modal visibility and content view.
 * Utilizes Zustand for lightweight, unopinionated state management.
 */
import { create } from 'zustand';

// Defines the possible states the auth modal can be in, representing different screens to the user.
export type AuthView = 'login' | 'signup' | 'forgot-password' | 'verification-sent';

// Interface detailing the properties and actions available in the auth modal store.
export interface AuthModalStore {
  isOpen: boolean; // Indicates if the modal is currently visible on the screen
  view: AuthView;  // Tracks the specific interactive view rendered inside the modal
  onOpen: (view?: AuthView) => void; // Function to trigger modal opening, optionally overriding its initial view
  onClose: () => void; // Function to trigger modal closing hiding it from the screen
  setView: (view: AuthView) => void; // Function to change the inner view sequentially without closing the modal
}

// Create and export the Zustand store initializing typed state variables and their update dispatchers.
export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false, // Modal is closed by default upon application load
  view: 'login', // Initial view defaults to the user login interface
  
  // Method to set isOpen to true and overrides the view if a specific one is passed dynamically, else defaults to 'login'.
  onOpen: (view = 'login') => set({ isOpen: true, view }),
  
  // Method to set isOpen back to false to dismiss the modal.
  onClose: () => set({ isOpen: false }),
  
  // Method meant to dynamically change the presented screen/view internally within the open modal.
  setView: (view) => set({ view }),
}));
