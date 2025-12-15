<script setup lang="ts">
import { Map, WalletCards } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isActive = (path: string) => route.path === path
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
    <div class="flex justify-around items-center h-16">
      <button
        class="flex flex-col items-center justify-center flex-1 h-full transition-colors"
        :class="isActive('/') ? 'text-black font-medium' : 'text-gray-400 hover:text-gray-500'"
        @click="router.push('/')"
      >
        <WalletCards class="w-6 h-6 mb-1" />
        <span class="text-xs">日常账本</span>
      </button>

      <button
        class="flex flex-col items-center justify-center flex-1 h-full transition-colors"
        :class="isActive('/travel') ? 'text-black font-medium' : 'text-gray-400 hover:text-gray-500'"
        @click="router.push('/travel')"
      >
        <Map class="w-6 h-6 mb-1" />
        <span class="text-xs">旅行账本</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
