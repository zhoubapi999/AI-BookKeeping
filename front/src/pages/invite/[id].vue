<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { getLedger, joinLedger, type Ledger } from '~/api'
import { useUserStore } from '~/stores/user'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const ledgerId = computed(() => route.params.id as string)
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const ledger = ref<Ledger | null>(null)
const loading = ref(false)

async function fetchLedger() {
  loading.value = true
  try {
    ledger.value = await getLedger(ledgerId.value)
    
    // Check if already a member
    if (ledger.value && user.value) {
      const currentUserId = String(user.value.id)
      const isMember = (ledger.value.users || []).some((u: any) => {
         const uid = typeof u === 'string' ? u : (u.id || u._id)
         return String(uid) === currentUserId
      }) || String(ledger.value.createdBy) === currentUserId || (typeof ledger.value.createdBy === 'object' && String((ledger.value.createdBy as any)._id) === currentUserId)

      if (isMember) {
        router.replace(`/ledger/${ledgerId.value}`)
      }
    }
  }
  catch (error) {
    console.error('Failed to fetch ledger', error)
    toast.error('获取账本信息失败')
  }
  finally {
    loading.value = false
  }
}

async function handleJoin() {
  try {
    loading.value = true
    await joinLedger(ledgerId.value)
    toast.success('成功加入账本！')
    router.replace(`/ledger/${ledgerId.value}`)
  }
  catch (error) {
    console.error('Failed to join ledger', error)
    toast.error('加入失败，请重试')
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLedger()
})
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center min-h-screen">
    <div class="animate-spin text-black">Loading...</div>
  </div>

  <div v-else-if="ledger" class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="h-48 bg-gray-100 relative">
        <img v-if="ledger.coverImage" :src="ledger.coverImage" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
           <span class="text-4xl">📔</span>
        </div>
      </div>
      <div class="p-6 text-center">
        <h1 class="text-2xl font-bold mb-2 text-gray-900">{{ ledger.title }}</h1>
        <p class="text-gray-500 mb-6">{{ ledger.description || '邀请你加入这个账本' }}</p>
        <button
          class="w-full bg-black text-white py-3 rounded-xl font-bold shadow-lg shadow-black/20 active:scale-95 transition-transform"
          @click="handleJoin"
        >
          加入账本
        </button>
      </div>
    </div>
  </div>
  
  <div v-else class="flex justify-center items-center min-h-screen text-gray-500">
    账本不存在或已被删除
  </div>
</template>
