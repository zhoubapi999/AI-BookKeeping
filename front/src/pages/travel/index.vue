<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getLedgers, type Ledger } from '~/api'
import { Plus, Map } from 'lucide-vue-next'
import AppBottomNav from '~/components/AppBottomNav.vue'

const router = useRouter()
const ledgers = ref<Ledger[]>([])
const loading = ref(false)

async function fetchLedgers() {
  loading.value = true
  try {
    ledgers.value = await getLedgers()
  } catch (error) {
    console.error('Failed to fetch ledgers', error)
  } finally {
    loading.value = false
  }
}

function handleCreateLedger() {
  router.push('/ledger/create')
}

function handleOpenLedger(id: string) {
  if (!id) return
  router.push(`/ledger/${id}`)
}

onMounted(fetchLedgers)
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="p-4 animate-fade-in">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-bold text-gray-800 text-lg">我的旅程</h2>
        <button
          class="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-black/20 active:scale-95 transition-transform flex items-center"
          @click="handleCreateLedger"
        >
          <Plus class="w-4 h-4 mr-1" />
          新旅程
        </button>
      </div>

      <div v-if="loading" class="text-center py-10 text-gray-400">Loading...</div>

      <div v-else class="grid grid-cols-2 gap-4">
        <div
          v-for="ledger in ledgers"
          :key="ledger.id"
          class="bg-white rounded-xl overflow-hidden shadow-sm active:scale-95 transition-transform cursor-pointer group"
          @click="handleOpenLedger(ledger.id)"
        >
          <div class="aspect-[4/3] bg-gray-200 relative overflow-hidden">
            <img
              v-if="ledger.coverImage"
              :src="ledger.coverImage"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              alt="Cover"
            >
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
               <span class="text-4xl">🏔️</span>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div class="absolute bottom-2 left-2 text-white">
               <h3 class="font-bold text-sm truncate pr-2">{{ ledger.title }}</h3>
               <p class="text-[10px] opacity-80">{{ new Date(ledger.createdAt).toLocaleDateString() }}</p>
            </div>
          </div>

          <div class="p-3 flex items-center justify-between">
            <div class="flex -space-x-2 overflow-hidden">
               <!-- Avatars -->
               <img
                 v-for="u in ledger.users.slice(0, 3)"
                 :key="typeof u === 'object' ? u.id : u"
                 :src="typeof u === 'object' && u.avatar ? u.avatar : `https://ui-avatars.com/api/?name=${typeof u === 'object' ? u.username : 'U'}&background=random`"
                 class="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
               />
            </div>
            <span class="text-xs text-gray-400">{{ ledger.users.length }}人</span>
          </div>
        </div>
      </div>

      <div v-if="ledgers.length === 0 && !loading" class="flex flex-col items-center justify-center py-20 text-gray-400">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Map class="w-8 h-8 text-gray-300" />
        </div>
        <p>开启一段新的旅程吧</p>
      </div>
    </div>

    <AppBottomNav />
  </div>
</template>