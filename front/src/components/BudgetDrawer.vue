<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Button from '~/components/ui/button/Button.vue'
import Drawer from '~/components/ui/drawer/Drawer.vue'
import DrawerContent from '~/components/ui/drawer/DrawerContent.vue'
import DrawerHeader from '~/components/ui/drawer/DrawerHeader.vue'
import DrawerTitle from '~/components/ui/drawer/DrawerTitle.vue'
import Input from '~/components/ui/input/Input.vue'
import Label from '~/components/ui/label/Label.vue'

const props = defineProps<{
  open: boolean
  initialBudget: number
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', amount: number): void
}>()

const isOpen = computed({
  get: () => props.open,
  set: val => emit('update:open', val),
})

const amount = ref(0)

watch(() => props.open, (val) => {
  if (val) {
    amount.value = props.initialBudget
  }
})

function handleSave() {
  emit('save', Number(amount.value))
}
</script>

<template>
  <Drawer v-model:open="isOpen">
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>设置月预算</DrawerTitle>
      </DrawerHeader>
      <div class="p-4 space-y-4">
        <div class="space-y-2">
          <Label>月预算金额</Label>
          <Input v-model="amount" type="number" placeholder="输入预算金额" />
        </div>
        <Button class="text-lg mt-4 h-12 w-full" @click="handleSave">
          保存
        </Button>
      </div>
    </DrawerContent>
  </Drawer>
</template>
