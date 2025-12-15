<script setup lang="ts">
import { Edit, Settings as SettingsIcon, TrendingDown, TrendingUp, User } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from '~/components/ui/button/Button.vue'

const props = defineProps<{
  todayIncome: number
  todayExpense: number
  monthlyBudget: number
  currentMonthExpense: number
}>()

const emit = defineEmits<{
  (e: 'editBudget'): void
  (e: 'manageCategories'): void
}>()

const router = useRouter()

const remainingBudget = computed(() => props.monthlyBudget - props.currentMonthExpense)
const budgetPercent = computed(() => {
  if (props.monthlyBudget === 0)
    return 0
  return Math.min((props.currentMonthExpense / props.monthlyBudget) * 100, 100)
})
</script>

<template>
  <div class="text-white p-6 rounded-b-[2.5rem] bg-zinc-900 shadow-xl relative overflow-hidden">
    <!-- Decorative Background Elements -->
    <div class="rounded-full bg-white/5 h-64 w-64 pointer-events-none right-0 top-0 absolute blur-3xl -mr-16 -mt-16" />
    <div class="rounded-full bg-white/5 h-48 w-48 pointer-events-none bottom-0 left-0 absolute blur-3xl -mb-10 -ml-10" />

    <div class="mb-6 flex items-center justify-between relative z-10">
      <div class="flex gap-3 items-center">
        <Button variant="ghost" size="icon" class="text-white rounded-full bg-white/10 transition-all backdrop-blur-sm hover:text-white/80 hover:bg-white/20" @click="router.push('/my')">
          <User class="h-5 w-5" />
        </Button>
        <h1 class="text-xl tracking-tight font-bold">
          我的钱包
        </h1>
      </div>
      <Button variant="ghost" size="icon" class="text-white rounded-full bg-white/10 transition-all backdrop-blur-sm hover:text-white/80 hover:bg-white/20" @click="emit('manageCategories')">
        <Edit class="h-5 w-5" />
      </Button>
    </div>

    <div class="mb-6 gap-4 grid grid-cols-2 relative z-10">
      <div class="p-3 border border-white/5 rounded-2xl bg-zinc-800/50 flex gap-3 shadow-sm transition-all duration-300 items-center backdrop-blur-md hover:bg-zinc-800/80">
        <div class="p-2 rounded-xl bg-white/10">
          <TrendingUp class="text-white h-5 w-5" />
        </div>
        <div>
          <p class="text-xs text-zinc-400 font-medium mb-0.5">
            今日收入
          </p>
          <p class="text-white tracking-wide font-bold">
            ¥{{ todayIncome.toFixed(2) }}
          </p>
        </div>
      </div>
      <div class="p-3 border border-white/5 rounded-2xl bg-zinc-800/50 flex gap-3 shadow-sm transition-all duration-300 items-center backdrop-blur-md hover:bg-zinc-800/80">
        <div class="p-2 rounded-xl bg-white/10">
          <TrendingDown class="text-white h-5 w-5" />
        </div>
        <div>
          <p class="text-xs text-zinc-400 font-medium mb-0.5">
            今日支出
          </p>
          <p class="text-white tracking-wide font-bold">
            ¥{{ todayExpense.toFixed(2) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Budget Card -->
    <div class="p-4 border border-white/5 rounded-2xl bg-zinc-800/50 shadow-sm transition-all duration-300 relative z-10 backdrop-blur-md hover:bg-zinc-800/80">
      <div class="mb-2 flex items-center justify-between">
        <p class="text-sm text-zinc-300 font-medium">
          月预算
        </p>
        <Button variant="ghost" size="icon" class="text-zinc-400 rounded-full h-6 w-6 transition-colors hover:text-white hover:bg-white/10" @click="emit('editBudget')">
          <SettingsIcon class="h-4 w-4" />
        </Button>
      </div>
      <div class="mb-3 flex gap-1 items-end">
        <span class="text-2xl tracking-tight font-bold">¥{{ remainingBudget.toFixed(2) }}</span>
        <span class="text-sm text-zinc-500 mb-1">/ ¥{{ monthlyBudget }}</span>
      </div>
      <div class="border border-white/5 rounded-full bg-zinc-950/50 h-2 overflow-hidden">
        <div
          class="bg-white h-full shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all duration-500"
          :style="{ width: `${budgetPercent}%`, backgroundColor: budgetPercent > 90 ? '#fb7185' : '#fff' }"
        />
      </div>
      <p class="text-xs text-zinc-500 mt-2 text-right">
        本月已用 ¥{{ currentMonthExpense.toFixed(2) }}
      </p>
    </div>
  </div>
</template>
