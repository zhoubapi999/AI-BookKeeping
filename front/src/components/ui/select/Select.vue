<script setup lang="ts">
import { Check, ChevronDown, ChevronUp } from 'lucide-vue-next'
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectRoot,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'radix-vue'
import { cn } from '~/lib/utils'

defineProps<{
  modelValue?: string
  options?: { label: string, value: string }[]
  placeholder?: string
  class?: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string): void
}>()
</script>

<template>
  <SelectRoot :model-value="modelValue" @update:model-value="emits('update:modelValue', $event)">
    <SelectTrigger
      :class="cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        $props.class,
      )"
    >
      <SelectValue :placeholder="placeholder" />
      <ChevronDown class="opacity-50 h-4 w-4" />
    </SelectTrigger>
    <SelectPortal>
      <SelectContent
        class="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 border rounded-md max-h-96 min-w-[8rem] shadow-md relative z-50 overflow-hidden"
        position="popper"
        :side-offset="4"
      >
        <SelectScrollUpButton class="py-1 flex cursor-default items-center justify-center">
          <ChevronUp class="h-4 w-4" />
        </SelectScrollUpButton>
        <SelectViewport class="p-1">
          <template v-if="options">
            <SelectItem
              v-for="option in options"
              :key="option.value"
              :value="option.value"
              class="focus:bg-accent focus:text-accent-foreground text-sm py-1.5 pl-8 pr-2 outline-none rounded-sm flex w-full cursor-default select-none items-center relative data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
            >
              <span class="flex h-3.5 w-3.5 items-center left-2 justify-center absolute">
                <SelectItemIndicator>
                  <Check class="h-4 w-4" />
                </SelectItemIndicator>
              </span>
              <SelectItemText>
                {{ option.label }}
              </SelectItemText>
            </SelectItem>
          </template>
          <slot v-else />
        </SelectViewport>
        <SelectScrollDownButton class="py-1 flex cursor-default items-center justify-center">
          <ChevronDown class="h-4 w-4" />
        </SelectScrollDownButton>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
