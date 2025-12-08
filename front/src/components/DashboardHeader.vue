<script setup lang="ts">
import { computed } from 'vue'
import { Edit, Settings as SettingsIcon, TrendingDown, TrendingUp } from 'lucide-vue-next'
import Button from '~/components/ui/button/Button.vue'

const props = defineProps<{
  todayIncome: number
  todayExpense: number
  monthlyBudget: number
  currentMonthExpense: number
}>()

const emit = defineEmits<{
  (e: 'edit-budget'): void
  (e: 'manage-categories'): void
}>()

const remainingBudget = computed(() => props.monthlyBudget - props.currentMonthExpense)
const budgetPercent = computed(() => {
  if (props.monthlyBudget === 0)
    return 0
  return Math.min((props.currentMonthExpense / props.monthlyBudget) * 100, 100)
})
</script>

<template>
  <div class="bg-primary text-primary-foreground p-6 rounded-b-[2rem] shadow-lg">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold">
        我的钱包
      </h1>
      <Button variant="ghost" size="icon" class="text-primary-foreground hover:text-primary-foreground/80" @click="emit('manage-categories')">
        <Edit class="h-5 w-5" />
      </Button>
    </div>

    <div class="mb-6 gap-4 grid grid-cols-2">
      <div class="p-3 border border-white/10 rounded-xl bg-white/20 flex gap-3 items-center backdrop-blur-md">
        <div class="p-2 rounded-lg bg-white/20">
          <TrendingUp class="text-white h-5 w-5" />
        </div>
        <div>
          <p class="text-xs text-white font-medium">
            今日收入
          </p>
          <p class="text-white font-bold">
            ¥{{ todayIncome.toFixed(2) }}
          </p>
        </div>
      </div>
      <div class="p-3 border border-white/10 rounded-xl bg-white/20 flex gap-3 items-center backdrop-blur-md">
        <div class="p-2 rounded-lg bg-white/20">
          <TrendingDown class="text-white h-5 w-5" />
        </div>
        <div>
          <p class="text-xs text-white font-medium">
            今日支出
          </p>
          <p class="text-white font-bold">
            ¥{{ todayExpense.toFixed(2) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Budget Card -->
    <div class="p-4 border border-white/10 rounded-xl bg-white/10 backdrop-blur-md">
      <div class="mb-2 flex items-center justify-between">
        <p class="text-sm text-white font-medium">
          月预算
        </p>
        <Button variant="ghost" size="icon" class="text-white/80 h-6 w-6 hover:text-white" @click="emit('edit-budget')">
          <SettingsIcon class="h-4 w-4" />
        </Button>
      </div>
      <div class="mb-2 flex gap-1 items-end">
        <span class="text-2xl font-bold">¥{{ remainingBudget.toFixed(2) }}</span>
        <span class="text-sm text-white/60 mb-1">/ ¥{{ monthlyBudget }}</span>
      </div>
      <div class="rounded-full bg-white/20 h-2 overflow-hidden">
        <div
          class="bg-white h-full transition-all duration-500"
          :style="{ width: `${budgetPercent}%`, backgroundColor: budgetPercent > 90 ? '#ef4444' : '#fff' }"
        />
      </div>
      <p class="text-xs text-white/60 mt-2 text-right">
        本月已用 ¥{{ currentMonthExpense.toFixed(2) }}
      </p>
    </div>
  </div>
</template>
