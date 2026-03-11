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
