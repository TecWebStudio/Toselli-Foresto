'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace('#', '');
  const len = cleaned.length;
  if (len === 3) {
    return {
      r: parseInt(cleaned[0] + cleaned[0], 16),
      g: parseInt(cleaned[1] + cleaned[1], 16),
      b: parseInt(cleaned[2] + cleaned[2], 16),
    };
  }
  if (len === 6) {
    return {
      r: parseInt(cleaned.slice(0, 2), 16),
      g: parseInt(cleaned.slice(2, 4), 16),
      b: parseInt(cleaned.slice(4, 6), 16),
    };
  }
  return null;
}

/**
 * Reads the logged-in user's theme_color (or falls back to avatar_color)
 * and injects it as CSS custom properties on :root so the entire UI
 * respects the chosen accent colour.
 *
 * Renders nothing — purely a side-effect component.
 */
export default function ThemeApplier() {
  const { user } = useAuth();

  useEffect(() => {
    const color = user?.theme_color || user?.avatar_color || '#6366f1';
    const rgb = hexToRgb(color);
    const root = document.documentElement;

    root.style.setProperty('--accent-primary', color);
    root.style.setProperty('--color-accent', color);

    if (rgb) {
      const { r, g, b } = rgb;
      root.style.setProperty('--accent-primary-rgb', `${r}, ${g}, ${b}`);
      root.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.25)`);
      root.style.setProperty('--accent-glow-strong', `rgba(${r}, ${g}, ${b}, 0.45)`);
      // Subtle tinted background used in active nav items, tags, etc.
      root.style.setProperty('--accent-bg', `rgba(${r}, ${g}, ${b}, 0.08)`);
      root.style.setProperty('--accent-border', `rgba(${r}, ${g}, ${b}, 0.35)`);
    }
  }, [user?.theme_color, user?.avatar_color]);

  return null;
}
