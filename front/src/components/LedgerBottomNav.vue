<script setup lang="ts">
import { FileText, Map, Users } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const ledgerId = computed(() => route.params.id)

const links = computed(() => [
  {
    name: '账单',
    path: `/ledger/${ledgerId.value}`,
    icon: FileText,
    exact: true,
  },
  {
    name: '分账',
    path: `/ledger/${ledgerId.value}/split`,
    icon: Users,
  },
])

const isActive = (path: string, exact = false) => {
  if (exact) {
    return route.path === path
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
    <div class="flex justify-around items-center h-16">
      <button
        v-for="link in links"
        :key="link.path"
        class="flex flex-col items-center justify-center flex-1 h-full transition-colors"
        :class="isActive(link.path, link.exact) ? 'text-black font-medium' : 'text-gray-500 hover:text-black'"
        @click="$router.push(link.path)"
      >
        <component :is="link.icon" class="w-6 h-6 mb-1" />
        <span class="text-xs">{{ link.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
