<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createLedger } from '~/api'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const title = ref('')
const loading = ref(false)

const coverOptions = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80', // Switzerland
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', // Paris
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', // Japan
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80', // Beach
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80', // City
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80', // Cinque Terre
]

const selectedCover = ref(coverOptions[0])

async function handleCreate() {
  if (!title.value) return

  loading.value = true
  try {
    const ledger = await createLedger({
      title: title.value,
      coverImage: selectedCover.value,
    })
    router.push(`/ledger/${ledger.id}`)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-safe">
    <div class="bg-white p-4 sticky top-0 z-10 flex items-center border-b border-gray-100">
      <button @click="router.back()" class="mr-3">
        <ArrowLeft class="w-6 h-6 text-gray-600" />
      </button>
      <h1 class="text-lg font-bold">新建账本</h1>
    </div>

    <div class="p-4 space-y-6">
      <!-- Title Input -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">账本名称</label>
        <input
          v-model="title"
          type="text"
          placeholder="例如：2024 日本之旅"
          class="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black bg-white"
        />
      </div>

      <!-- Cover Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">选择封面</label>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="cover in coverOptions"
            :key="cover"
            class="relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all"
            :class="selectedCover === cover ? 'border-black ring-2 ring-gray-200' : 'border-transparent'"
            @click="selectedCover = cover"
          >
            <img :src="cover" class="w-full h-full object-cover" />
            <div v-if="selectedCover === cover" class="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div class="bg-white rounded-full p-1">
                <div class="w-2 h-2 bg-black rounded-full"></div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        class="w-full bg-black text-white font-medium py-3.5 rounded-xl shadow-lg shadow-black/20 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!title || loading"
        @click="handleCreate"
      >
        {{ loading ? '创建中...' : '创建账本' }}
      </button>
    </div>
  </div>
</template>
