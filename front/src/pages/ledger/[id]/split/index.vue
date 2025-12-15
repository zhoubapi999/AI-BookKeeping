<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTransactions, getLedger, type Transaction, type Ledger } from '~/api'
import LedgerBottomNav from '~/components/LedgerBottomNav.vue'
import { useUserStore } from '~/stores/user'
import { storeToRefs } from 'pinia'
import { ArrowLeft, Share } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const ledgerId = computed(() => route.params.id as string)

const ledger = ref<Ledger | null>(null)
const transactions = ref<Transaction[]>([])
const loading = ref(false)

async function fetchData() {
  loading.value = true
  try {
    const [lData, tData] = await Promise.all([
      getLedger(ledgerId.value),
      getTransactions(ledgerId.value),
    ])
    ledger.value = lData
    transactions.value = tData
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function handleShare() {
  const url = window.location.href.replace('/split', '')
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

const members = computed(() => {
  if (!ledger.value) return []
  const creator = typeof ledger.value.createdBy === 'object' ? ledger.value.createdBy : { id: ledger.value.createdBy, username: 'Unknown', avatar: '' }
  const users = ledger.value.users.map((u: any) => typeof u === 'object' ? u : { id: u, username: 'Unknown', avatar: '' })

  const all = [creator, ...users]
  const unique = new Map()
  for (const m of all) {
    if (m.id) unique.set(m.id, m)
  }
  return unique
})

const getMemberName = (id: string) => {
  const m = members.value.get(id)
  return m ? m.username : 'Unknown'
}

const getMemberAvatar = (id: string) => {
  const m = members.value.get(id)
  return m ? (m.avatar || `https://ui-avatars.com/api/?name=${m.username}&background=random`) : ''
}

// Calculate Balances
const balances = computed(() => {
  const bal = new Map<string, number>()

  // Initialize all members with 0
  for (const id of members.value.keys()) {
    bal.set(id, 0)
  }

  transactions.value.forEach(t => {
    if (t.type !== 'expense') return

    const amount = t.amount
    // Handle populated or ID string
    const payerId = (t as any).payerId?.id || (t as any).payerId || t.userId

    // Beneficiaries
    let beneficiaries = (t as any).beneficiaryIds || []

    // If empty beneficiaryIds, assume all members (default behavior for ledger)
    if (!beneficiaries || beneficiaries.length === 0) {
       beneficiaries = Array.from(members.value.keys())
    } else {
       beneficiaries = beneficiaries.map((b: any) => b.id || b)
    }

    if (beneficiaries.length === 0) return

    const share = amount / beneficiaries.length

    // Credit Payer
    bal.set(payerId, (bal.get(payerId) || 0) + amount)

    // Debit Beneficiaries
    beneficiaries.forEach((bId: string) => {
      bal.set(bId, (bal.get(bId) || 0) - share)
    })
  })

  return bal
})

// Calculate Transfers needed to settle debts
const transfers = computed(() => {
  const debtors: { id: string, amount: number }[] = []
  const creditors: { id: string, amount: number }[] = []

  balances.value.forEach((amount, id) => {
    if (amount < -0.01) debtors.push({ id, amount }) // Negative amount means they owe money
    else if (amount > 0.01) creditors.push({ id, amount }) // Positive means they are owed money
  })

  debtors.sort((a, b) => a.amount - b.amount) // Ascending (most negative first)
  creditors.sort((a, b) => b.amount - a.amount) // Descending (most positive first)

  const result: { from: string, to: string, amount: number }[] = []

  let i = 0 // debtor index
  let j = 0 // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]

    // The amount to settle is min(abs(debtor.amount), creditor.amount)
    const amount = Math.min(Math.abs(debtor.amount), creditor.amount)

    result.push({
      from: debtor.id,
      to: creditor.id,
      amount
    })

    debtor.amount += amount
    creditor.amount -= amount

    if (Math.abs(debtor.amount) < 0.01) i++
    if (creditor.amount < 0.01) j++
  }

  return result
})

const myBalance = computed(() => {
  if (!user.value) return 0
  return balances.value.get(user.value.id) || 0
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 text-gray-900 animate-fade-in">
    <!-- Header -->
    <div class="text-white p-6 pb-10 rounded-b-[2.5rem] bg-zinc-900 shadow-xl relative overflow-hidden">
      <!-- Decorative Background Elements -->
      <div class="rounded-full bg-white/5 h-64 w-64 pointer-events-none right-0 top-0 absolute blur-3xl -mr-16 -mt-16" />
      <div class="rounded-full bg-white/5 h-48 w-48 pointer-events-none bottom-0 left-0 absolute blur-3xl -mb-10 -ml-10" />

      <!-- Header Buttons -->
      <div class="absolute top-0 left-0 right-0 p-6 pt-8 flex justify-between items-start z-20">
        <button
          class="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all active:scale-95"
          @click="router.push(`/ledger/${ledgerId}`)"
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

      <div class="flex items-center justify-center relative z-10 pt-4">
        <h1 class="text-xl font-bold">多人分账</h1>
      </div>

      <!-- My Balance Summary in Header -->
      <div class="mt-8 text-center relative z-10">
        <div class="text-zinc-400 text-sm mb-1">我的结余</div>
        <div class="text-4xl font-bold mb-4 tracking-tight">
          {{ myBalance >= 0 ? '+' : '' }}¥{{ Math.abs(myBalance).toFixed(2) }}
        </div>
        <div class="inline-flex items-center text-sm text-zinc-100 bg-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm border border-white/10">
          <span v-if="myBalance > 0">🎉 还有 {{ myBalance.toFixed(2) }} 元待收回</span>
          <span v-else-if="myBalance < 0">💸 需要支付 {{ Math.abs(myBalance).toFixed(2) }} 元</span>
          <span v-else>✨ 账目已结清</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="p-8 text-center text-gray-500">
      Loading...
    </div>

    <div v-else class="px-4 -mt-6 space-y-6 relative z-20">
      <!-- Transfers List -->
      <div v-if="transfers.length > 0">
        <h2 class="text-sm font-bold text-gray-500 mb-3 ml-2 uppercase tracking-wider">建议转账方案</h2>
        <div class="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
          <div
            v-for="(transfer, index) in transfers"
            :key="index"
            class="p-4 flex items-center justify-between"
          >
            <div class="flex items-center space-x-3">
              <!-- From -->
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-full bg-gray-100 overflow-hidden mb-1 ring-2 ring-white">
                  <img :src="getMemberAvatar(transfer.from)" class="w-full h-full object-cover" />
                </div>
                <span class="text-xs text-gray-500 font-medium">{{ getMemberName(transfer.from) }}</span>
              </div>

              <!-- Arrow -->
              <div class="flex flex-col items-center px-2">
                <span class="text-xs text-gray-400 mb-1">支付给</span>
                <div class="h-[1px] w-12 bg-gray-200 relative">
                  <div class="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-gray-300 rotate-45"></div>
                </div>
              </div>

              <!-- To -->
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-full bg-gray-100 overflow-hidden mb-1 ring-2 ring-white">
                  <img :src="getMemberAvatar(transfer.to)" class="w-full h-full object-cover" />
                </div>
                <span class="text-xs text-gray-500 font-medium">{{ getMemberName(transfer.to) }}</span>
              </div>
            </div>

            <div class="font-bold text-lg text-gray-900">
              ¥{{ transfer.amount.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-10 text-gray-500 bg-white rounded-2xl shadow-sm">
        🎉 账目已平，无需转账
      </div>

      <!-- Balances Detail -->
      <div>
        <h2 class="text-sm font-bold text-gray-500 mb-3 ml-2 uppercase tracking-wider">收支结余明细</h2>
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div
            v-for="[id, amount] in balances"
            :key="id"
            class="p-4 flex items-center justify-between border-b border-gray-50 last:border-0"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-gray-100 overflow-hidden ring-2 ring-white">
                <img :src="getMemberAvatar(id)" class="w-full h-full object-cover" />
              </div>
              <span class="font-medium text-gray-900">{{ getMemberName(id) }}</span>
            </div>

            <div
              class="font-bold"
              :class="amount >= 0 ? 'text-green-600' : 'text-gray-900'"
            >
              {{ amount >= 0 ? '收' : '付' }} ¥{{ Math.abs(amount).toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <LedgerBottomNav />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
