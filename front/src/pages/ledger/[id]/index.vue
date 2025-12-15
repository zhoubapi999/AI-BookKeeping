<script setup lang="ts">
import dayjs from 'dayjs'
import { Share, Plus, ArrowLeft } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import {
  type Category,
  createCategory,
  createTransaction,
  deleteCategory,
  deleteTransaction,
  getCategories,
  getLedger,
  joinLedger,
  type Ledger,
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
import LedgerBottomNav from '~/components/LedgerBottomNav.vue'

const route = useRoute()
const router = useRouter()
const ledgerId = computed(() => route.params.id as string)
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const ledger = ref<Ledger | null>(null)
const transactions = ref<Transaction[]>([])
const categories = ref<Category[]>([])
const settings = ref<Settings>({ userId: '', monthlyBudget: 0 })
const loading = ref(false)

const isMember = computed(() => {
  if (!ledger.value || !user.value)
    return false

  const currentUserId = String(user.value.id)

  const normalizeId = (u: any) => {
    if (!u) return ''
    if (typeof u === 'string') return u
    return String(u.id || u._id || '')
  }

  // Check Creator
  const creatorId = normalizeId(ledger.value.createdBy)
  if (creatorId === currentUserId)
    return true

  // Check Users
  return (ledger.value.users || []).some((u: any) => {
    return normalizeId(u) === currentUserId
  })
})

const members = computed(() => {
  if (!ledger.value) return []

  const normalize = (u: any) => {
    if (!u) return { id: 'unknown', username: 'Unknown', avatar: '' }
    if (typeof u === 'string') return { id: u, username: 'Unknown', avatar: '' }

    // Handle object
    const id = u.id || u._id
    return {
      ...u,
      id: String(id), // Ensure string ID
      username: u.username || 'Unknown',
      avatar: u.avatar || ''
    }
  }

  const creator = normalize(ledger.value.createdBy)
  const users = (ledger.value.users || []).map(normalize)

  // Combine and deduplicate by ID
  const all = [creator, ...users]
  const unique = new Map()
  for (const m of all) {
    if (m.id && m.id !== 'unknown') unique.set(m.id, m)
  }
  return Array.from(unique.values())
})

const showAddTransaction = ref(false)
const showCategoryDrawer = ref(false)
const showBudgetDrawer = ref(false)

const activeTab = ref<'transactions' | 'stats'>('transactions')
const editingTransaction = ref<Transaction | null>(null)

async function fetchData() {
  loading.value = true
  try {
    const [lData, tData, cData, sData] = await Promise.all([
      getLedger(ledgerId.value),
      getTransactions(ledgerId.value),
      getCategories(),
      getSettings(),
    ])
    ledger.value = lData
    transactions.value = tData
    categories.value = cData
    settings.value = sData

    // Check membership and redirect if needed
    if (user.value && lData) {
      const currentUserId = String(user.value.id || user.value._id)
      const normalize = (u: any) => String(typeof u === 'string' ? u : (u.id || u._id || ''))

      const isCreator = normalize(lData.createdBy) === currentUserId
      const isUser = (lData.users || []).some((u: any) => normalize(u) === currentUserId)

      if (!isCreator && !isUser) {
        router.replace(`/invite/${ledgerId.value}`)
        return
      }
    }

    // Debug info
    console.log('Ledger:', lData)
    console.log('User:', user.value)
    console.log('IsMember:', isMember.value)
  }
  catch (error) {
    console.error('Failed to fetch data', error)
  }
  finally {
    loading.value = false
  }
}

function handleShare() {
  const url = `${window.location.origin}/invite/${ledgerId.value}`
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => toast.success('邀请链接已复制，快发给小伙伴吧！'))
      .catch(() => {
        // Fallback
        const input = document.createElement('input')
        input.value = url
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
        toast.success('邀请链接已复制，快发给小伙伴吧！')
      })
  } else {
    // Fallback for non-secure contexts
    const input = document.createElement('input')
    input.value = url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    toast.success('邀请链接已复制，快发给小伙伴吧！')
  }
}

onMounted(fetchData)

// Computed Stats for Header
const todayIncome = computed(() => {
  return transactions.value
    .filter(t => t.type === 'income' && dayjs(t.date).isSame(dayjs(), 'day'))
    .reduce((sum, t) => sum + t.amount, 0)
})

const todayExpense = computed(() => {
  return transactions.value
    .filter(t => t.type === 'expense' && dayjs(t.date).isSame(dayjs(), 'day'))
    .reduce((sum, t) => sum + t.amount, 0)
})

const totalExpense = computed(() => {
  return transactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
})

const myExpense = computed(() => {
  if (!user.value)
    return 0
  return transactions.value
    .filter(t => t.type === 'expense' && t.userId === user.value.id)
    .reduce((sum, t) => sum + t.amount, 0)
})

const currentMonthExpense = computed(() => {
  return transactions.value
    .filter(t => t.type === 'expense' && dayjs(t.date).isSame(dayjs(), 'month'))
    .reduce((sum, t) => sum + t.amount, 0)
})

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
  // router.push(`/history?date=${date}`)
  // TODO: History view for specific ledger?
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

      const newTransaction = {
        ...data,
        ledgerId: ledgerId.value
      } as Omit<Transaction, 'id'>

      await createTransaction(newTransaction)
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
  // eslint-disable-next-line no-alert
  if (!window.confirm('确定要删除吗？'))
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
  // eslint-disable-next-line no-alert
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
  <div v-if="loading" class="flex justify-center items-center min-h-screen">
    <div class="animate-spin text-black">Loading...</div>
  </div>

  <div v-else-if="ledger" class="mx-auto pb-20 bg-gray-50 max-w-md min-h-screen shadow-xl relative animate-fade-in">
    <!-- Custom Ledger Header -->
    <div class="relative h-64 text-white p-6 flex flex-col justify-end overflow-hidden rounded-b-[2.5rem] bg-zinc-900 shadow-xl">
      <!-- Decorative Background Elements -->
      <div class="rounded-full bg-white/5 h-64 w-64 pointer-events-none right-0 top-0 absolute blur-3xl -mr-16 -mt-16" />
      <div class="rounded-full bg-white/5 h-48 w-48 pointer-events-none bottom-0 left-0 absolute blur-3xl -mb-10 -ml-10" />

      <!-- Header Buttons -->
      <div class="absolute top-0 left-0 right-0 p-6 pt-8 flex justify-between items-start z-20">
        <button
          class="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all active:scale-95"
          @click="router.push('/')"
        >
          <ArrowLeft class="w-6 h-6" />
        </button>
        <div class="flex gap-2">
          <button
            class="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all active:scale-95"
            @click="handleShare"
          >
            <Share class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="relative z-10">
        <h1 class="text-3xl font-bold mb-2 tracking-tight">
          {{ ledger.title }}
        </h1>
        <p class="text-gray-400 text-sm mb-6 flex items-center gap-2">
          <span class="inline-block w-2 h-2 rounded-full bg-green-500" />
          {{ ledger.description || '暂无描述' }}
        </p>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-white/70">总支出</div>
            <div class="text-xl font-bold">¥{{ totalExpense.toFixed(2) }}</div>
          </div>
          <div>
            <div class="text-xs text-white/70">我的支出</div>
            <div class="text-xl font-bold">¥{{ myExpense.toFixed(2) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4 space-y-4 mb-14 -mt-6 relative z-20">
      <!-- Tabs -->
      <div class="mb-6 p-1 rounded-xl bg-gray-100 flex border border-transparent">
        <button
          class="text-sm font-bold py-2 rounded-lg flex-1 transition-all"
          :class="activeTab === 'transactions' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'transactions'"
        >
          明细
        </button>
        <button
          class="text-sm font-bold py-2 rounded-lg flex-1 transition-all"
          :class="activeTab === 'stats' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'"
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
      class="text-white rounded-full bg-black flex h-14 w-14 shadow-lg shadow-black/20 transition-transform items-center bottom-20 right-6 justify-center fixed z-40 hover:bg-gray-900 active:scale-90"
      @click="handleOpenAddTransaction"
    >
      <Plus class="h-8 w-8" />
    </button>

    <!-- Drawers -->
    <TransactionDrawer
      v-model:open="showAddTransaction"
      :transaction="editingTransaction"
      :categories="categories"
      :members="members"
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

    <LedgerBottomNav />
  </div>
</template>

<style scoped>
/* Hide scrollbar for cleaner UI */
::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
</style>
