<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <main class="bg-gray-100 h-full">
    <RouterView />
    <Toaster position="top-center" />
  </main>
</template>
