import {
  Bus,
  Gamepad,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Shirt,
  ShoppingBag,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
} from 'lucide-vue-next'
import type { Component } from 'vue'

export const iconMap: Record<string, Component> = {
  // Legacy mappings
  'utensils': Utensils,
  'car': Bus,
  'shopping-bag': ShoppingBag,
  'film': Gamepad,
  'wallet': Wallet,
  'trending-up': TrendingUp,
  // Standard mappings
  'food': Utensils,
  'shopping': ShoppingBag,
  'transport': Bus,
  'home': Home,
  'utilities': Zap,
  'entertainment': Gamepad,
  'clothing': Shirt,
  'gift': Gift,
  'education': GraduationCap,
  'health': HeartPulse,
  'other': Wallet,
}

export const availableIcons = [
  { value: 'food', label: '餐饮', icon: Utensils },
  { value: 'shopping', label: '购物', icon: ShoppingBag },
  { value: 'transport', label: '交通', icon: Bus },
  { value: 'home', label: '居住', icon: Home },
  { value: 'utilities', label: '生活', icon: Zap },
  { value: 'entertainment', label: '娱乐', icon: Gamepad },
  { value: 'clothing', label: '服饰', icon: Shirt },
  { value: 'gift', label: '人情', icon: Gift },
  { value: 'education', label: '教育', icon: GraduationCap },
  { value: 'health', label: '医疗', icon: HeartPulse },
  { value: 'other', label: '其他', icon: Wallet },
]

export function getCategoryIcon(iconName?: string) {
  if (iconName && iconMap[iconName]) {
    return iconMap[iconName]
  }
  return Wallet
}
