export const palette = {
  background: '#F8FAFC',       // Branco Gelo (slate-50)
  surface: '#FFFFFF',          // Branco Puro (white)
  primary: '#1D4ED8',          // Azul Cobalto (blue-700)
  primaryHover: '#1E40AF',     // Azul Cobalto Escuro (blue-800)
  primaryLight: '#EFF6FF',     // Azul Suave (blue-50)
  primaryDark: '#0F172A',      // Azul Marinho (slate-900)
  accent: '#0EA5E9',           // Azul Céu (sky-500)
  accentHover: '#0284C7',      // Azul Céu Escuro (sky-600)
  accentLight: '#F0F9FF',      // Azul Céu Suave (sky-50)
  success: '#10B981',          // Verde Esmeralda (emerald-500)
  successHover: '#059669',     // Verde Esmeralda Escuro (emerald-600)
  successLight: '#ECFDF5',     // Verde Menta Claro (emerald-50)
  border: '#E2E8F0',           // Cinza Azulado (slate-200)
  borderHover: '#CBD5E1',      // Cinza Azulado Médio (slate-300)
  secondary: '#F1F5F9',        // Slate 100
  muted: '#475569',            // Slate 600
  mutedLight: '#64748B',       // Slate 500
  placeholder: '#94A3B8',      // Slate 400
  warning: '#D97706',          // Amber 600
  warningLight: '#FFFBEB',     // Amber 50
  danger: '#DC2626',           // Red 600
  dangerLight: '#FEF2F2',      // Red 50
} as const;

export type Palette = typeof palette;
