<script setup lang="ts">
import dayjs from 'dayjs'
import { ChevronLeft } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  type Category,
  createCategory,
  createTransaction,
  deleteCategory,
  deleteTransaction,
  getCategories,
  getTransactions,
  type Transaction,
  updateCategory,
  updateTransaction,
} from '~/api'

import CategoryDrawer from '~/components/CategoryDrawer.vue'
import ExpenseCalendar from '~/components/ExpenseCalendar.vue'
import TransactionDrawer from '~/components/TransactionDrawer.vue'
import TransactionsList from '~/components/TransactionsList.vue'

const route = useRoute()
const router = useRouter()

const transactions = ref<Transaction[]>([])
const categories = ref<Category[]>([])
const loading = ref(false)
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))

const showAddTransaction = ref(false)
const showCategoryDrawer = ref(false)
const editingTransaction = ref<Transaction | null>(null)

async function fetchData() {
  loading.value = true
  try {
    const [tData, cData] = await Promise.all([
      getTransactions(),
      getCategories(),
    ])
    transactions.value = tData
    categories.value = cData
  }
  catch (error) {
    console.error('Failed to fetch data', error)
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.query.date) {
    selectedDate.value = route.query.date as string
  }
  fetchData()
})

// Update URL when date changes
watch(selectedDate, (val) => {
  router.replace({ query: { ...route.query, date: val } })
})

// Filter transactions by selected date
const filteredTransactions = computed(() => {
  return transactions.value.filter(t => dayjs(t.date).isSame(selectedDate.value, 'day'))
})

// Handlers
function handleEditTransaction(t: Transaction) {
  editingTransaction.value = t
  showAddTransaction.value = true
}

async function handleSaveTransaction(data: Partial<Transaction>) {
  try {
    if (editingTransaction.value) {
      await updateTransaction(editingTransaction.value.id, data)
    }
    else {
      if (!data.amount || !data.categoryId)
        return
      await createTransaction(data as Omit<Transaction, 'id'>)
    }
    showAddTransaction.value = false
    await fetchData()
  }
  catch (error) {
    console.error('Failed to save transaction', error)
  }
}

async function handleDeleteTransaction(id: number) {
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

async function handleSaveCategory(data: Partial<Category>, id?: number) {
  try {
    if (id) {
      await updateCategory(id, data)
    }
    else {
      await createCategory(data as Omit<Category, 'id'>)
    }
    await fetchData()
  }
  catch (error) {
    console.error('Failed to save category', error)
  }
}

async function handleDeleteCategory(id: number) {
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

function openAddCategory() {
  showAddTransaction.value = false
  setTimeout(() => {
    showCategoryDrawer.value = true
  }, 300)
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="mx-auto pb-20 bg-gray-50 max-w-md min-h-screen shadow-xl relative">
    <!-- Header -->
    <div class="px-4 py-3 bg-white flex gap-3 shadow-sm items-center top-0 sticky z-10">
      <button
        class="p-2 rounded-full transition-colors -ml-2 hover:bg-gray-100"
        @click="goBack"
      >
        <ChevronLeft class="text-gray-700 h-6 w-6" />
      </button>
      <h1 class="text-lg text-gray-800 font-bold">
        全部记录
      </h1>
    </div>

    <div class="p-4 space-y-4">
      <ExpenseCalendar
        v-model="selectedDate"
        :transactions="transactions"
      />

      <TransactionsList
        :transactions="filteredTransactions"
        :categories="categories"
        @edit="handleEditTransaction"
      />
    </div>

    <!-- Edit Drawer -->
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
  </div>
</template>
