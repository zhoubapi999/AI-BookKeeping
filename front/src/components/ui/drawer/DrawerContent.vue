<script setup lang="ts">
import { DrawerContent, DrawerOverlay, DrawerPortal } from 'vaul-vue'
import { cn } from '~/lib/utils'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <DrawerPortal>
    <DrawerOverlay class="bg-black/80 inset-0 fixed z-50" />
    <DrawerContent
      :class="cn(
        'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-3xl border bg-background',
        props.class,
      )"
    >
      <div class="mx-auto mt-4 rounded-full bg-muted h-2 w-[100px]" />
      <slot />
    </DrawerContent>
  </DrawerPortal>
</template>
