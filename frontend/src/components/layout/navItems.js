import { LayoutDashboard, Library, MessageSquareText, BrainCircuit } from 'lucide-react';

// Primary workspace routes, shared by the header and the mobile drawer.
export const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
  { label: 'Library', path: '/materials', icon: Library },
  { label: 'Ask Synapse', path: '/chat', icon: MessageSquareText },
  { label: 'Practice', path: '/practice', icon: BrainCircuit },
];
