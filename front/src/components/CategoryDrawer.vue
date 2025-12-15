<script setup lang="ts">
import type { Category } from '~/api'
import { Edit, Trash2 } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import Button from '~/components/ui/button/Button.vue'
import Drawer from '~/components/ui/drawer/Drawer.vue'
import DrawerContent from '~/components/ui/drawer/DrawerContent.vue'
import DrawerHeader from '~/components/ui/drawer/DrawerHeader.vue'
import DrawerTitle from '~/components/ui/drawer/DrawerTitle.vue'
import Input from '~/components/ui/input/Input.vue'
import Label from '~/components/ui/label/Label.vue'
import Select from '~/components/ui/select/Select.vue'
import { availableIcons, getCategoryIcon } from '~/composables/useIcons'

const props = defineProps<{
  open: boolean
  categories: Category[]
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', category: Partial<Category>, id?: string): void
  (e: 'delete', id: string): void
}>()

const isOpen = computed({
  get: () => props.open,
  set: val => emit('update:open', val),
})

const formData = ref<Partial<Category>>({
  type: 'expense',
  color: '#000000',
  icon: 'other',
  name: '',
})

const editingId = ref<string | null>(null)

watch(() => props.open, (val) => {
  if (val) {
    resetForm()
  }
})

function resetForm() {
  formData.value = {
    type: 'expense',
    color: '#000000',
    icon: 'other',
    name: '',
  }
  editingId.value = null
}

const filteredCategories = computed(() => {
  return props.categories.filter(c => c.type === formData.value.type)
})

function handleEdit(category: Category) {
  formData.value = { ...category }
  editingId.value = category.id
}

function handleSave() {
  if (!formData.value.name) {
    // eslint-disable-next-line no-alert
    alert('请输入分类名称')
    return
  }
  emit('save', formData.value, editingId.value || undefined)
  resetForm()
}

function handleDelete(id: string) {
  emit('delete', id)
}
</script>

<template>
  <Drawer v-model:open="isOpen">
    <DrawerContent class="bg-zinc-900 border-zinc-800 text-white">
      <DrawerHeader>
        <DrawerTitle class="text-white">{{ editingId ? '编辑分类' : '新建分类' }}</DrawerTitle>
      </DrawerHeader>
      <div class="p-4 max-h-[55vh] overflow-y-auto space-y-4">
        <div class="space-y-2">
          <Label class="text-zinc-400">名称</Label>
          <Input v-model="formData.name" placeholder="分类名称" class="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600" />
        </div>

        <div class="gap-4 grid grid-cols-2">
          <div class="space-y-2">
            <Label class="text-zinc-400">类型</Label>
            <Select
              :model-value="formData.type"
              class="bg-zinc-800 border-zinc-700 text-white"
              :options="[
                { label: '支出', value: 'expense' },
                { label: '收入', value: 'income' },
              ]"
              @update:model-value="formData.type = $event as any"
            />
          </div>
          <div class="space-y-2">
            <Label class="text-zinc-400">颜色</Label>
            <div class="flex gap-2 h-10 items-center">
              <Input v-model="formData.color" type="color" class="p-1 h-full w-full bg-zinc-800 border-zinc-700" />
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <Label class="text-zinc-400">图标</Label>
          <div class="gap-2 grid grid-cols-6">
            <div
              v-for="icon in availableIcons"
              :key="icon.value"
              class="p-2 border rounded-lg flex flex-col cursor-pointer transition-colors items-center justify-center"
              :class="formData.icon === icon.value ? 'bg-white/10 border-white text-white' : 'border-transparent hover:bg-zinc-800 text-zinc-500'"
              @click="formData.icon = icon.value"
            >
              <component :is="icon.icon" class="h-6 w-6" />
              <span class="text-[10px] mt-1">{{ icon.label }}</span>
            </div>
          </div>
        </div>

        <Button class="text-lg mt-4 h-12 w-full bg-white text-black hover:bg-gray-200" @click="handleSave">
          {{ editingId ? '更新分类' : '创建分类' }}
        </Button>

        <div class="mt-6">
          <h3 class="text-sm text-zinc-400 font-medium mb-3">
            管理分类
          </h3>
          <div class="gap-2 grid grid-cols-1">
            <div
              v-for="c in filteredCategories"
              :key="c.id"
              class="p-3 border rounded bg-zinc-900 border-zinc-800 flex items-center justify-between"
            >
              <div class="flex gap-3 items-center">
                <div class="text-white rounded-full flex h-8 w-8 shadow-sm items-center justify-center" :style="{ backgroundColor: c.color }">
                  <component :is="getCategoryIcon(c.icon)" class="h-4 w-4" />
                </div>
                <span class="text-white">{{ c.name }}</span>
              </div>
              <div class="flex gap-2">
                <Button variant="ghost" size="icon" class="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800" @click="handleEdit(c)">
                  <Edit class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" class="text-zinc-400 h-8 w-8 hover:text-white hover:bg-zinc-800" @click="handleDelete(c.id)">
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>
