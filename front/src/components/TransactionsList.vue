<script setup lang="ts">
import type { Category, Transaction } from '~/api'
import dayjs from 'dayjs'
import { computed } from 'vue'
import { getCategoryIcon } from '~/composables/useIcons'

const props = defineProps<{
  transactions: Transaction[]
  categories: Category[]
}>()

const emit = defineEmits<{
  (e: 'edit', transaction: Transaction): void
}>()

const groupedTransactions = computed(() => {
  const groups = new Map<string, Transaction[]>()
  // Sort transactions by date desc, then by id desc (newest first)
  const sorted = [...props.transactions].sort((a, b) => {
    const dateDiff = dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
    if (dateDiff !== 0)
      return dateDiff
    // If same date, sort by id descending (assuming mongo object id roughly corresponds to time)
    return b.id.localeCompare(a.id)
  })

  sorted.forEach((t) => {
    if (!groups.has(t.date)) {
      groups.set(t.date, [])
    }
    groups.get(t.date)?.push(t)
  })

  return Array.from(groups.entries()).map(([date, list]) => {
    const dayIncome = list.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
    const dayExpense = list.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
    return {
      date,
      dayIncome,
      dayExpense,
      transactions: list,
    }
  })
})

function getCategoryName(id: string) {
  return props.categories.find(c => c.id === id)?.name || '未知'
}

function getCategoryColor(id: string) {
  return props.categories.find(c => c.id === id)?.color || '#ccc'
}

function getCategoryIconName(id: string) {
  return props.categories.find(c => c.id === id)?.icon
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="groupedTransactions.length === 0" class="text-gray-500 font-medium py-10 text-center">
      暂无记录
    </div>
    <div
      v-for="group in groupedTransactions"
      :key="group.date"
      class="space-y-2"
    >
      <!-- Date Header -->
      <div class="text-sm text-gray-500 px-2 flex justify-between">
        <span>{{ group.date }}</span>
        <div class="flex gap-3">
          <span v-if="group.dayIncome > 0">收 ¥{{ group.dayIncome.toFixed(2) }}</span>
          <span v-if="group.dayExpense > 0">支 ¥{{ group.dayExpense.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Transactions -->
      <div class="rounded-xl bg-white shadow-sm overflow-hidden">
        <div
          v-for="(t, index) in group.transactions"
          :key="t.id"
          class="p-4 flex cursor-pointer transition-colors items-center justify-between hover:bg-gray-50"
          :class="{ 'border-b border-gray-100': index < group.transactions.length - 1 }"
          @click="emit('edit', t)"
        >
          <div class="flex gap-3 items-center">
            <div
              class="text-white font-bold rounded-full flex h-10 w-10 shadow-sm items-center justify-center"
              :style="{ backgroundColor: getCategoryColor(t.categoryId) }"
            >
              <component :is="getCategoryIcon(getCategoryIconName(t.categoryId))" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-base text-gray-900 font-bold">
                {{ getCategoryName(t.categoryId) }}
              </p>
              <p v-if="t.note" class="text-sm text-gray-500 mt-0.5">
                {{ t.note }}
              </p>
            </div>
          </div>
          <div class="flex gap-3 items-center">
            <p
              class="text-lg font-bold"
              :class="t.type === 'income' ? 'text-green-600' : 'text-red-600'"
            >
              {{ t.type === 'income' ? '+' : '-' }}{{ t.amount }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
