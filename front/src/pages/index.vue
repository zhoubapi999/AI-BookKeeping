<script setup lang="ts">
import dayjs from 'dayjs'
import { Plus } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  type Category,
  createCategory,
  createTransaction,
  deleteCategory,
  deleteTransaction,
  getCategories,
  getSettings,
  getTransactions,
  type Settings,
  type Transaction,
  updateCategory,
  updateSettings,
  updateTransaction,
} from '~/api'

import BudgetDrawer from '~/components/BudgetDrawer.vue'
import CategoryDrawer from '~/components/CategoryDrawer.vue'
import DashboardHeader from '~/components/DashboardHeader.vue'
import StatsView from '~/components/StatsView.vue'
import TransactionDrawer from '~/components/TransactionDrawer.vue'
import TransactionsList from '~/components/TransactionsList.vue'

const router = useRouter()
const transactions = ref<Transaction[]>([])
const categories = ref<Category[]>([])
const settings = ref<Settings>({ monthlyBudget: 0 })
const loading = ref(false)

const showAddTransaction = ref(false)
const showCategoryDrawer = ref(false)
const showBudgetDrawer = ref(false)

const activeTab = ref<'transactions' | 'stats'>('transactions')
const editingTransaction = ref<Transaction | null>(null)

async function fetchData() {
  loading.value = true
  try {
    const [tData, cData, sData] = await Promise.all([
      getTransactions(),
      getCategories(),
      getSettings(),
    ])
    transactions.value = tData
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

onMounted(fetchData)

// Computed Stats for Header
const todayIncome = computed(() =>
  transactions.value
    .filter(t => t.type === 'income' && dayjs(t.date).isSame(dayjs(), 'day'))
    .reduce((acc, t) => acc + t.amount, 0),
)

const todayExpense = computed(() =>
  transactions.value
    .filter(t => t.type === 'expense' && dayjs(t.date).isSame(dayjs(), 'day'))
    .reduce((acc, t) => acc + t.amount, 0),
)

const currentMonthExpense = computed(() =>
  transactions.value
    .filter(t => t.type === 'expense' && dayjs(t.date).isSame(dayjs(), 'month'))
    .reduce((acc, t) => acc + t.amount, 0),
)

// Handlers
function handleOpenAddTransaction() {
  editingTransaction.value = null
  showAddTransaction.value = true
}

function handleEditTransaction(t: Transaction) {
  editingTransaction.value = t
  showAddTransaction.value = true
}

function handleDateSelect(date: string) {
  router.push(`/history?date=${date}`)
}

async function handleSaveTransaction(data: Partial<Transaction>) {
  try {
    if (editingTransaction.value) {
      await updateTransaction(editingTransaction.value.id, data)
    }
    else {
      // Ensure required fields for creation
      if (!data.amount || !data.categoryId)
        return
      await createTransaction(data as Omit<Transaction, 'id'>)
    }
    showAddTransaction.value = false
    await fetchData()
  }
  catch (error) {
    console.error('Failed to save transaction', error)
    // eslint-disable-next-line no-alert
    alert('保存失败，请重试')
  }
}

async function handleDeleteTransaction(id: string) {
  if (!confirm('确定要删除吗？'))
    return
  try {
    await deleteTransaction(id)
    showAddTransaction.value = false
    await fetchData()
  }
  catch (error) {
    console.error('Failed to delete transaction', error)
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
    // Don't close drawer as user might want to continue managing categories
    // showCategoryDrawer.value = false
    await fetchData()
  }
  catch (error) {
    console.error('Failed to save category', error)
  }
}

async function handleDeleteCategory(id: string) {
  if (!confirm('确定要删除吗？'))
    return
  try {
    await deleteCategory(id)
    await fetchData()
  }
  catch (error) {
    console.error('Failed to delete category', error)
  }
}

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

function openAddCategory() {
  showAddTransaction.value = false
  setTimeout(() => {
    showCategoryDrawer.value = true
  }, 300) // Wait for drawer close animation
}
</script>

<template>
  <div class="mx-auto pb-20 bg-gray-50 max-w-md min-h-screen shadow-xl relative">
    <DashboardHeader
      :today-income="todayIncome"
      :today-expense="todayExpense"
      :monthly-budget="settings.monthlyBudget"
      :current-month-expense="currentMonthExpense"
      @edit-budget="showBudgetDrawer = true"
      @manage-categories="showCategoryDrawer = true"
    />

    <!-- Content -->
    <div class="p-4 space-y-4">
      <!-- Tabs -->
      <div class="mb-6 p-1 rounded-xl bg-secondary/50 flex">
        <button
          class="text-sm font-bold py-2 rounded-lg flex-1 transition-all"
          :class="activeTab === 'transactions' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'"
          @click="activeTab = 'transactions'"
        >
          明细
        </button>
        <button
          class="text-sm font-bold py-2 rounded-lg flex-1 transition-all"
          :class="activeTab === 'stats' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'"
          @click="activeTab = 'stats'"
        >
          统计
        </button>
      </div>

      <!-- Transactions List -->
      <div v-if="activeTab === 'transactions'" class="space-y-4">
        <TransactionsList
          :transactions="transactions"
          :categories="categories"
          @edit="handleEditTransaction"
        />
      </div>

      <!-- Statistics -->
      <div v-else>
        <StatsView
          :transactions="transactions"
          :categories="categories"
          @date-select="handleDateSelect"
        />
      </div>
    </div>

    <!-- Floating Action Button -->
    <button
      class="text-white rounded-full bg-primary flex h-14 w-14 shadow-lg shadow-primary/40 transition-transform items-center bottom-6 right-6 justify-center fixed z-40 hover:bg-primary/90 active:scale-90"
      @click="handleOpenAddTransaction"
    >
      <Plus class="h-8 w-8" />
    </button>

    <!-- Drawers -->
    <TransactionDrawer
      v-model:open="showAddTransaction"
      :transaction="editingTransaction"
      :categories="categories"
      @save="handleSaveTransaction"
      @delete="handleDeleteTransaction"
      @add-category="openAddCategory"
    />

    <CategoryDrawer
      v-model:open="showCategoryDrawer"
      :categories="categories"
      @save="handleSaveCategory"
      @delete="handleDeleteCategory"
    />

    <BudgetDrawer
      v-model:open="showBudgetDrawer"
      :initial-budget="settings.monthlyBudget"
      @save="handleSaveBudget"
    />
  </div>
</template>

<style scoped>
/* Hide scrollbar for cleaner UI */
::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
</style>
