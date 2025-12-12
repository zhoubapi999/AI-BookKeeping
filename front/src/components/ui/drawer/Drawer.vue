<script setup lang="ts">
import { DrawerRoot } from 'vaul-vue'

const props = withDefaults(defineProps<{
  shouldScaleBackground?: boolean
}>(), {
  shouldScaleBackground: true,
})

const emits = defineEmits<{
  (e: 'update:open', payload: boolean): void
}>()
</script>

<template>
  <DrawerRoot v-bind="props" @update:open="emits('update:open', $event)">
    <slot />
  </DrawerRoot>
</template>
