<script setup lang="ts">
import type { Transaction } from '~/api'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string // YYYY-MM-DD
  transactions: Transaction[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', date: string): void
}>()

const currentMonth = ref(dayjs(props.modelValue))

// When modelValue changes externally, update currentMonth if needed
watch(() => props.modelValue, (val) => {
  const newVal = dayjs(val)
  if (!newVal.isSame(currentMonth.value, 'month')) {
    currentMonth.value = newVal
  }
})

// Calculate daily expenses for the current month view
const dailyExpenses = computed(() => {
  const expenses = new Map<string, number>()
  props.transactions.forEach((t) => {
    if (t.type === 'expense') {
      const date = dayjs(t.date).format('YYYY-MM-DD')
      expenses.set(date, (expenses.get(date) || 0) + t.amount)
    }
  })
  return expenses
})

const calendarDays = computed(() => {
  const startOfMonth = currentMonth.value.startOf('month')
  const endOfMonth = currentMonth.value.endOf('month')

  const startDayOfWeek = startOfMonth.day() // 0 (Sunday) - 6 (Saturday)

  const days = []

  // Previous month padding
  for (let i = 0; i < startDayOfWeek; i++) {
    const d = startOfMonth.subtract(startDayOfWeek - i, 'day')
    days.push({
      date: d.format('YYYY-MM-DD'),
      day: d.date(),
      isCurrentMonth: false,
    })
  }

  // Current month days
  for (let i = 1; i <= endOfMonth.date(); i++) {
    const d = startOfMonth.date(i)
    days.push({
      date: d.format('YYYY-MM-DD'),
      day: i,
      isCurrentMonth: true,
    })
  }

  // Next month padding to fill 6 rows (42 days) or just enough to fill row
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = endOfMonth.add(i, 'day')
    days.push({
      date: d.format('YYYY-MM-DD'),
      day: d.date(),
      isCurrentMonth: false,
    })
  }

  return days
})

function prevMonth() {
  currentMonth.value = currentMonth.value.subtract(1, 'month')
}

function nextMonth() {
  currentMonth.value = currentMonth.value.add(1, 'month')
}

function selectDate(date: string) {
  emit('update:modelValue', date)
  // If user clicks a date from prev/next month, switch view
  const d = dayjs(date)
  if (!d.isSame(currentMonth.value, 'month')) {
    currentMonth.value = d
  }
}

const weekDays = ['日', '一', '二', '三', '四', '五', '六']
</script>

<template>
  <div class="border border-gray-100 rounded-xl bg-white shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="p-4 border-b border-gray-50 flex items-center justify-between">
      <button
        class="p-1 rounded-full transition-colors hover:bg-gray-100"
        @click="prevMonth"
      >
        <ChevronLeft class="text-gray-500 h-5 w-5" />
      </button>
      <span class="text-gray-700 font-bold">
        {{ currentMonth.format('YYYY年 MM月') }}
      </span>
      <button
        class="p-1 rounded-full transition-colors hover:bg-gray-100"
        @click="nextMonth"
      >
        <ChevronRight class="text-gray-500 h-5 w-5" />
      </button>
    </div>

    <!-- Week Days -->
    <div class="py-2 text-center bg-gray-50/50 grid grid-cols-7">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-xs text-gray-400 font-medium"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="p-2 gap-y-2 grid grid-cols-7">
      <button
        v-for="day in calendarDays"
        :key="day.date"
        class="rounded-lg flex flex-col h-14 transition-all items-center justify-center relative"
        :class="[
          !day.isCurrentMonth ? 'opacity-30' : '',
          modelValue === day.date ? 'bg-primary text-primary-foreground shadow-md scale-105 z-10' : 'hover:bg-gray-50 text-gray-700',
        ]"
        @click="selectDate(day.date)"
      >
        <span class="text-sm font-medium">{{ day.day }}</span>
        <span
          v-if="dailyExpenses.has(day.date)"
          class="text-[10px] mt-0.5"
          :class="modelValue === day.date ? 'text-primary-foreground/90' : 'text-gray-400'"
        >
          ¥{{ dailyExpenses.get(day.date) }}
        </span>
      </button>
    </div>
  </div>
</template>
