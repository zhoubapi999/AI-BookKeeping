<script setup lang="ts">
import type { Category, Transaction } from '~/api'
import dayjs from 'dayjs'
import { Plus, Trash2, Check } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useUserStore } from '~/stores/user'
import { storeToRefs } from 'pinia'
import Button from '~/components/ui/button/Button.vue'
import Drawer from '~/components/ui/drawer/Drawer.vue'
import DrawerContent from '~/components/ui/drawer/DrawerContent.vue'
import DrawerHeader from '~/components/ui/drawer/DrawerHeader.vue'
import DrawerTitle from '~/components/ui/drawer/DrawerTitle.vue'
import Input from '~/components/ui/input/Input.vue'
import Select from '~/components/ui/select/Select.vue'
import { getCategoryIcon } from '~/composables/useIcons'

const props = defineProps<{
  open: boolean
  transaction: Transaction | null
  categories: Category[]
  members?: any[]
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', transaction: Partial<Transaction>): void
  (e: 'delete', id: string): void
  (e: 'addCategory'): void
}>()

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

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
  payerId: '',
  beneficiaryIds: [],
  autoMember: false,
})

watch(() => props.open, (val) => {
  if (val) {
    if (props.transaction) {
      const t = props.transaction
      // Handle populated fields that might be objects instead of strings
      const payerId = typeof t.payerId === 'object' && t.payerId !== null
        ? (t.payerId as any)._id || (t.payerId as any).id
        : t.payerId

      const beneficiaryIds = Array.isArray(t.beneficiaryIds)
        ? t.beneficiaryIds.map((b: any) =>
          typeof b === 'object' && b !== null
            ? b._id || b.id
            : b,
        )
        : []

      const categoryId = typeof t.categoryId === 'object' && t.categoryId !== null
        ? (t.categoryId as any)._id || (t.categoryId as any).id
        : t.categoryId

      formData.value = {
        ...t,
        payerId: String(payerId || ''),
        beneficiaryIds: beneficiaryIds.map(String),
        categoryId: String(categoryId || ''),
        date: dayjs(t.date).format('YYYY-MM-DD'),
      }
    }
    else {
      // Default to current user if they are a member, otherwise first member
      const currentUserId = user.value?.id
      const defaultPayerId = props.members?.find(m => m.id === currentUserId)?.id || props.members?.[0]?.id || ''

      formData.value = {
        type: 'expense',
        date: dayjs().format('YYYY-MM-DD'),
        amount: undefined,
        categoryId: undefined,
        note: '',
        payerId: defaultPayerId,
        beneficiaryIds: props.members ? props.members.map(m => m.id) : [],
        autoMember: false,
      }
    }
  }
})

function toggleBeneficiary(id: string) {
  const current = formData.value.beneficiaryIds || []
  if (current.includes(id)) {
    formData.value.beneficiaryIds = current.filter(uid => uid !== id)
  }
  else {
    formData.value.beneficiaryIds = [...current, id]
  }
}

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

  // Construct a clean payload with only necessary fields to avoid sending populated objects (like ledgerId) back to server
  const payload: any = {
    type: formData.value.type,
    amount: Number(formData.value.amount),
    date: formData.value.date,
    categoryId: formData.value.categoryId,
    note: formData.value.note,
    payerId: formData.value.payerId,
    beneficiaryIds: formData.value.beneficiaryIds,
    autoMember: formData.value.autoMember,
  }

  // Include ID if editing
  if (formData.value.id || (formData.value as any)._id) {
    payload.id = formData.value.id || (formData.value as any)._id
  }

  emit('save', payload)
}

function handleDelete() {
  if (props.transaction?.id) {
    emit('delete', props.transaction.id)
  }
}

function getAvatar(user: any) {
  return user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`
}
</script>

<template>
  <Drawer v-model:open="isOpen">
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>{{ transaction ? '编辑记录' : '记一笔' }}</DrawerTitle>
      </DrawerHeader>
      <div class="p-4 max-h-[55vh] overflow-y-auto space-y-4">
        <div class="gap-2 grid">
          <label class="text-sm font-medium">金额</label>
          <div class="relative">
            <span class="text-lg text-gray-500 left-3 top-1/2 absolute -translate-y-1/2">¥</span>
            <Input v-model="formData.amount" type="number" class="text-lg pl-8 h-12" placeholder="0.00" />
          </div>
        </div>

        <div class="gap-4 grid grid-cols-2">
          <div class="space-y-2">
            <label class="text-sm font-medium">类型</label>
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
            <label class="text-sm font-medium">日期</label>
            <Input v-model="formData.date" type="date" />
          </div>
        </div>

        <div v-if="members && members.length > 0" class="space-y-4 border-t border-b border-gray-100 py-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">谁付的</label>
            <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                v-for="member in members"
                :key="member.id"
                type="button"
                class="flex flex-col items-center min-w-[3rem] transition-all"
                @click="formData.payerId = member.id"
              >
                <div
                  class="w-10 h-10 rounded-full overflow-hidden border-2 mb-1"
                  :class="formData.payerId === member.id ? 'border-black ring-2 ring-gray-100' : 'border-transparent opacity-70'"
                >
                  <img :src="getAvatar(member)" class="w-full h-full object-cover" />
                </div>
                <span
                  class="text-[10px] truncate w-12 text-center"
                  :class="formData.payerId === member.id ? 'font-bold text-black' : 'text-gray-500'"
                >
                  {{ member.username }}
                </span>
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">给谁付</label>
            <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                v-for="member in members"
                :key="member.id"
                type="button"
                class="flex flex-col items-center min-w-[3rem] transition-all"
                @click="toggleBeneficiary(member.id)"
              >
                <div
                  class="w-10 h-10 rounded-full overflow-hidden border-2 mb-1 relative"
                  :class="(formData.beneficiaryIds || []).includes(member.id) ? 'border-black' : 'border-transparent opacity-70 grayscale'"
                >
                  <img :src="getAvatar(member)" class="w-full h-full object-cover" />
                  <div v-if="(formData.beneficiaryIds || []).includes(member.id)" class="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Check class="w-5 h-5 text-white drop-shadow-md" />
                  </div>
                </div>
                <span
                  class="text-[10px] truncate w-12 text-center"
                  :class="(formData.beneficiaryIds || []).includes(member.id) ? 'font-bold text-black' : 'text-gray-500'"
                >
                  {{ member.username }}
                </span>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between p-3 border rounded-xl bg-gray-50/50">
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-700">新成员自动参与分账</span>
              <span class="text-[10px] text-gray-400">后续加入账本的成员将自动分摊此账单</span>
            </div>
            <div
               class="w-11 h-6 rounded-full relative cursor-pointer transition-colors"
               :class="formData.autoMember ? 'bg-black' : 'bg-gray-200'"
               @click="formData.autoMember = !formData.autoMember"
            >
               <div
                 class="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform shadow-sm"
                 :class="formData.autoMember ? 'translate-x-5' : 'translate-x-0'"
               />
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">分类</label>
          <div class="p-1 gap-2 grid grid-cols-5 max-h-40 overflow-y-auto">
            <div
              v-for="c in categories.filter(c => c.type === formData.type)"
              :key="c.id"
              class="p-2 border rounded-lg flex flex-col gap-1 cursor-pointer transition-all items-center"
              :class="formData.categoryId === c.id ? 'border-black bg-black/5' : 'border-transparent hover:bg-gray-50'"
              @click="formData.categoryId = c.id"
            >
              <div class="text-white rounded-full flex h-8 w-8 shadow-sm items-center justify-center" :style="{ backgroundColor: c.color }">
                <component :is="getCategoryIcon(c.icon)" class="h-4 w-4" />
              </div>
              <span class="text-xs text-gray-600 text-center w-full truncate">{{ c.name }}</span>
            </div>
            <div
              class="p-2 border border-gray-200 rounded-lg border-dashed flex flex-col gap-1 cursor-pointer items-center hover:bg-gray-50"
              @click="emit('addCategory')"
            >
              <div class="text-gray-500 rounded-full bg-gray-100 flex h-8 w-8 items-center justify-center">
                <Plus class="h-4 w-4" />
              </div>
              <span class="text-xs text-gray-500">添加</span>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">备注</label>
          <Input v-model="formData.note" placeholder="写点什么..." />
        </div>
      </div>

        <div class="mt-4 flex gap-3 p-4">
          <Button v-if="transaction" variant="outline" class="text-red-500 border-red-100 bg-red-50 flex-1 h-12 hover:bg-red-100 hover:text-red-600" @click="handleDelete">
            <Trash2 class="mr-2 h-4 w-4" /> 删除
          </Button>
          <Button class="text-lg h-12" :class="transaction ? 'flex-[2]' : 'w-full'" @click="handleSave">
            保存
          </Button>
        </div>
    </DrawerContent>
  </Drawer>
</template>
