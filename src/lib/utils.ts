import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCOP(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-CO')
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#f97316']

export function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function daysSince(date: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000))
}
