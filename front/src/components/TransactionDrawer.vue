<script setup lang="ts">
import type { Category, Transaction } from '~/api'
import dayjs from 'dayjs'
import { Plus, Trash2 } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import Button from '~/components/ui/button/Button.vue'
import Drawer from '~/components/ui/drawer/Drawer.vue'
import DrawerContent from '~/components/ui/drawer/DrawerContent.vue'
import DrawerHeader from '~/components/ui/drawer/DrawerHeader.vue'
import DrawerTitle from '~/components/ui/drawer/DrawerTitle.vue'
import Input from '~/components/ui/input/Input.vue'
import Label from '~/components/ui/label/Label.vue'
import Select from '~/components/ui/select/Select.vue'
import { getCategoryIcon } from '~/composables/useIcons'

const props = defineProps<{
  open: boolean
  transaction: Transaction | null
  categories: Category[]
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', transaction: Partial<Transaction>): void
  (e: 'delete', id: string): void
  (e: 'addCategory'): void
}>()

const isOpen = computed({
  get: () => props.open,
  set: val => emit('update:open', val),
})

const formData = ref<Partial<Transaction>>({
  type: 'expense',
  date: dayjs().format('YYYY-MM-DD'),
  amount: undefined,
  categoryId: undefined,
  note: '',
})

watch(() => props.open, (val) => {
  if (val) {
    if (props.transaction) {
      formData.value = { ...props.transaction }
    }
    else {
      formData.value = {
        type: 'expense',
        date: dayjs().format('YYYY-MM-DD'),
        amount: undefined,
        categoryId: undefined,
        note: '',
      }
    }
  }
})

function handleSave() {
  if (!formData.value.amount) {
    // eslint-disable-next-line no-alert
    alert('请输入金额')
    return
  }
  if (!formData.value.categoryId) {
    // eslint-disable-next-line no-alert
    alert('请选择分类')
    return
  }
  emit('save', {
    ...formData.value,
    amount: Number(formData.value.amount),
  })
}

function handleDelete() {
  if (props.transaction?.id) {
    emit('delete', props.transaction.id)
  }
}
</script>

<template>
  <Drawer v-model:open="isOpen">
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>{{ transaction ? '编辑记录' : '记一笔' }}</DrawerTitle>
      </DrawerHeader>
      <div class="p-4 max-h-[75vh] overflow-y-auto space-y-4">
        <div class="gap-2 grid">
          <Label>金额</Label>
          <div class="relative">
            <span class="text-lg text-gray-600 left-3 top-1/2 absolute -translate-y-1/2">¥</span>
            <Input v-model="formData.amount" type="number" class="text-lg pl-8 h-12" placeholder="0.00" />
          </div>
        </div>

        <div class="gap-4 grid grid-cols-2">
          <div class="space-y-2">
            <Label>类型</Label>
            <Select
              :model-value="formData.type"
              :options="[
                { label: '支出', value: 'expense' },
                { label: '收入', value: 'income' },
              ]"
              @update:model-value="formData.type = $event as any"
            />
          </div>
          <div class="space-y-2">
            <Label>日期</Label>
            <Input v-model="formData.date" type="date" />
          </div>
        </div>

        <div class="space-y-2">
          <Label>分类</Label>
          <div class="p-1 gap-2 grid grid-cols-5 max-h-40 overflow-y-auto">
            <div
              v-for="c in categories.filter(c => c.type === formData.type)"
              :key="c.id"
              class="p-2 border rounded-lg flex flex-col gap-1 cursor-pointer transition-all items-center"
              :class="formData.categoryId === c.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-gray-50'"
              @click="formData.categoryId = c.id"
            >
              <div class="text-white rounded-full flex h-8 w-8 shadow-sm items-center justify-center" :style="{ backgroundColor: c.color }">
                <component :is="getCategoryIcon(c.icon)" class="h-4 w-4" />
              </div>
              <span class="text-xs text-gray-600 text-center w-full truncate">{{ c.name }}</span>
            </div>
            <div
              class="p-2 border border-gray-300 rounded-lg border-dashed flex flex-col gap-1 cursor-pointer items-center hover:bg-gray-50"
              @click="emit('addCategory')"
            >
              <div class="text-gray-400 rounded-full bg-gray-100 flex h-8 w-8 items-center justify-center">
                <Plus class="h-4 w-4" />
              </div>
              <span class="text-xs text-gray-500">添加</span>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <Label>备注</Label>
          <Input v-model="formData.note" placeholder="备注信息（可选）" />
        </div>

        <div class="mt-4 flex gap-3">
          <Button v-if="transaction" variant="outline" class="text-red-500 border-red-200 flex-1 h-12 hover:text-red-600 hover:bg-red-50" @click="handleDelete">
            <Trash2 class="mr-2 h-4 w-4" /> 删除
          </Button>
          <Button class="text-lg h-12" :class="transaction ? 'flex-[2]' : 'w-full'" @click="handleSave">
            保存
          </Button>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>
