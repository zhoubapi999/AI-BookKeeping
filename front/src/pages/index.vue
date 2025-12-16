<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  getTransactions,
  getCategories,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSettings,
  updateSettings,
  createCategory,
  updateCategory,
  deleteCategory,
  type Transaction,
  type Category,
  type Settings
} from '~/api'
import { Plus } from 'lucide-vue-next'
import dayjs from 'dayjs'
import { toast } from 'vue-sonner'
import TransactionsList from '~/components/TransactionsList.vue'
import StatsView from '~/components/StatsView.vue'
import TransactionDrawer from '~/components/TransactionDrawer.vue'
import AppBottomNav from '~/components/AppBottomNav.vue'
import DashboardHeader from '~/components/DashboardHeader.vue'
import BudgetDrawer from '~/components/BudgetDrawer.vue'
import CategoryDrawer from '~/components/CategoryDrawer.vue'

// Data
const personalTransactions = ref<Transaction[]>([])
const categories = ref<Category[]>([])
const settings = ref<Settings>({ userId: '', monthlyBudget: 0 })
const loading = ref(false)

// UI State
const showAddTransaction = ref(false)
const showBudgetDrawer = ref(false)
const showCategoryDrawer = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const personalViewMode = ref<'list' | 'stats'>('list')

async function fetchData() {
  loading.value = true
  try {
    const [tData, cData, sData] = await Promise.all([
      getTransactions(), // Returns all transactions for user
      getCategories(),
      getSettings(),
    ])
    // Filter transactions that don't belong to a ledger (Personal)
    personalTransactions.value = tData.filter(t => !t.ledgerId)
    categories.value = cData
    settings.value = sData
  }
  catch (error) {
    console.error('Failed to fetch data', error)
  }
  finally {
    loading.value = false
  }
}

// Personal Transaction Handlers
async function handleSaveBudget(amount: number) {
  try {
    await updateSettings({ monthlyBudget: amount })
    settings.value.monthlyBudget = amount
    showBudgetDrawer.value = false
  }
  catch (error) {
    console.error('Failed to save budget', error)
  }
}

async function handleSaveCategory(data: Partial<Category>, id?: string) {
  try {
    if (id) {
      await updateCategory(id, data)
    }
    else {
      await createCategory(data as Omit<Category, 'id'>)
    }
    await fetchData()
  }
  catch (error: any) {
    console.error('Failed to save category', error)
    toast.error(error.response?.data?.message || '保存失败')
  }
}

async function handleDeleteCategory(id: string) {
  if (!window.confirm('确定要删除吗？'))
    return
  try {
    await deleteCategory(id)
    await fetchData()
  }
  catch (error) {
    console.error('Failed to delete category', error)
  }
}

async function handleSaveTransaction(data: Partial<Transaction>) {
  try {
    if (editingTransaction.value) {
      await updateTransaction(editingTransaction.value.id, data)
    }
    else {
      if (!data.amount || !data.categoryId) return
      // Ensure no ledgerId is passed for personal transactions
      const { ledgerId, ...rest } = data as any
      await createTransaction(rest)
    }
    showAddTransaction.value = false
    await fetchData()
  } catch (error) {
    console.error('Failed to save', error)
  }
}

async function handleDeleteTransaction(id: string) {
  if (!confirm('确定删除吗？')) return
  try {
    await deleteTransaction(id)
    showAddTransaction.value = false
    await fetchData()
  } catch (error) {
    console.error('Failed to delete', error)
  }
}

function handleEditTransaction(t: Transaction) {
  editingTransaction.value = t
  showAddTransaction.value = true
}

function openAdd() {
  editingTransaction.value = null
  showAddTransaction.value = true
}

function openAddCategory() {
  showAddTransaction.value = false
  setTimeout(() => {
    showCategoryDrawer.value = true
  }, 300)
}

// Stats
const todayIncome = computed(() => {
  return personalTransactions.value
    .filter(t => t.type === 'income' && dayjs(t.date).isSame(dayjs(), 'day'))
    .reduce((sum, t) => sum + t.amount, 0)
})

const todayExpense = computed(() => {
  return personalTransactions.value
    .filter(t => t.type === 'expense' && dayjs(t.date).isSame(dayjs(), 'day'))
    .reduce((sum, t) => sum + t.amount, 0)
})

const currentMonthExpense = computed(() => {
  return personalTransactions.value
    .filter(t => t.type === 'expense' && dayjs(t.date).isSame(dayjs(), 'month'))
    .reduce((sum, t) => sum + t.amount, 0)
})

onMounted(fetchData)
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Personal View -->
    <div class="animate-fade-in">
      <!-- Summary Card -->
      <DashboardHeader
        :today-income="todayIncome"
        :today-expense="todayExpense"
        :monthly-budget="settings.monthlyBudget"
        :current-month-expense="currentMonthExpense"
        @edit-budget="showBudgetDrawer = true"
        @manage-categories="showCategoryDrawer = true"
      />

      <div class="px-4 -mt-8 relative z-10">
        <!-- View Toggle -->
        <div class="bg-white p-1 rounded-xl shadow-sm flex mb-4">
          <button
            class="flex-1 py-2 text-sm font-bold rounded-lg transition-all"
            :class="personalViewMode === 'list' ? 'bg-gray-100 text-gray-800' : 'text-gray-400'"
            @click="personalViewMode = 'list'"
          >
            明细
          </button>
          <button
            class="flex-1 py-2 text-sm font-bold rounded-lg transition-all"
            :class="personalViewMode === 'stats' ? 'bg-gray-100 text-gray-800' : 'text-gray-400'"
            @click="personalViewMode = 'stats'"
          >
            统计
          </button>
        </div>

        <div v-if="loading" class="text-center py-10 text-gray-400">Loading...</div>

        <div v-else-if="personalViewMode === 'list'">
          <TransactionsList
            :transactions="personalTransactions"
            :categories="categories"
            @edit="handleEditTransaction"
          />
          <div v-if="personalTransactions.length === 0" class="text-center py-10 text-gray-400">
            本月还没有记账哦
          </div>
        </div>

        <div v-else>
          <StatsView
            :transactions="personalTransactions"
            :categories="categories"
          />
        </div>
      </div>

      <!-- Add Button -->
      <button
        class="text-white rounded-full bg-black flex h-14 w-14 shadow-lg shadow-black/40 transition-transform items-center bottom-24 right-6 justify-center fixed z-30 hover:bg-zinc-800 active:scale-90"
        @click="openAdd"
      >
        <Plus class="h-8 w-8" />
      </button>

      <TransactionDrawer
        v-model:open="showAddTransaction"
        :transaction="editingTransaction"
        :categories="categories"
        @save="handleSaveTransaction"
        @delete="handleDeleteTransaction"
        @add-category="openAddCategory"
      />

      <BudgetDrawer
        v-model:open="showBudgetDrawer"
        :initial-budget="settings.monthlyBudget"
        @save="handleSaveBudget"
      />

      <CategoryDrawer
        v-model:open="showCategoryDrawer"
        :categories="categories"
        @save="handleSaveCategory"
        @delete="handleDeleteCategory"
      />
    </div>

    <AppBottomNav />
  </div>
</template>
