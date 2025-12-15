<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getItineraries, createItinerary, deleteItinerary, type ItineraryItem } from '~/api'
import LedgerBottomNav from '~/components/LedgerBottomNav.vue'
import { Plus, MapPin, Calendar, Clock, Trash2, X } from 'lucide-vue-next'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const route = useRoute()
const ledgerId = computed(() => route.params.id as string)
const items = ref<ItineraryItem[]>([])
const loading = ref(false)
const showAddModal = ref(false)
const submitting = ref(false)

// Form Data
const formData = ref({
  title: '',
  description: '',
  date: dayjs().format('YYYY-MM-DDTHH:mm'),
  location: '',
  imageUrl: ''
})

async function fetchItems() {
  loading.value = true
  try {
    items.value = await getItineraries(ledgerId.value)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  if (!formData.value.title || !formData.value.date) return

  submitting.value = true
  try {
    await createItinerary({
      ledgerId: ledgerId.value,
      title: formData.value.title,
      description: formData.value.description,
      date: formData.value.date,
      location: formData.value.location,
      imageUrl: formData.value.imageUrl || `https://picsum.photos/seed/${Math.random()}/800/600`
    })
    showAddModal.value = false
    // Reset form
    formData.value = {
      title: '',
      description: '',
      date: dayjs().format('YYYY-MM-DDTHH:mm'),
      location: '',
      imageUrl: ''
    }
    await fetchItems()
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id: string) {
  if (!confirm('确定删除该行程吗？')) return
  try {
    await deleteItinerary(id)
    await fetchItems()
  } catch (e) {
    console.error(e)
  }
}

// Group by Date
const groupedItems = computed(() => {
  const groups: Record<string, ItineraryItem[]> = {}

  // Sort by date first
  const sorted = [...items.value].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  sorted.forEach(item => {
    const dateKey = dayjs(item.date).format('YYYY-MM-DD')
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(item)
  })

  return groups
})

onMounted(fetchItems)
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <div class="bg-white p-4 sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 shadow-sm">
      <h1 class="text-lg font-bold">行程规划</h1>
      <button
        class="bg-black text-white p-2 rounded-lg shadow-lg shadow-black/20 active:scale-95 transition-transform"
        @click="showAddModal = true"
      >
        <Plus class="w-5 h-5" />
      </button>
    </div>

    <div v-if="loading" class="p-8 text-center text-gray-500">
      Loading...
    </div>

    <div v-else-if="items.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400">
      <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
        <MapPin class="w-8 h-8 text-gray-400" />
      </div>
      <p>还没有行程，添加一个吧</p>
    </div>

    <div v-else class="p-4 space-y-8">
      <div v-for="(dayItems, date) in groupedItems" :key="date" class="relative pl-4 border-l-2 border-gray-200 ml-2">
        <!-- Date Header -->
        <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-black border-2 border-white shadow-sm"></div>
        <div class="mb-4 pl-4">
          <h2 class="text-xl font-bold text-gray-800">{{ dayjs(date).format('M月D日') }}</h2>
          <p class="text-sm text-gray-500">{{ dayjs(date).format('dddd') }}</p>
        </div>

        <!-- Items -->
        <div class="space-y-4 pl-4">
          <div
            v-for="item in dayItems"
            :key="item.id"
            class="bg-white rounded-xl shadow-sm overflow-hidden group"
          >
            <div class="relative h-32 bg-gray-200" v-if="item.imageUrl">
              <img :src="item.imageUrl" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute bottom-2 left-3 text-white">
                <div class="flex items-center text-xs opacity-90 mb-0.5">
                  <Clock class="w-3 h-3 mr-1" />
                  {{ dayjs(item.date).format('HH:mm') }}
                </div>
                <h3 class="font-bold text-lg leading-tight">{{ item.title }}</h3>
              </div>
              <button
                class="absolute top-2 right-2 p-1.5 bg-black/30 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-black"
                @click="handleDelete(item.id)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>

            <div class="p-3" :class="{ 'pt-2': !item.imageUrl }">
              <div v-if="!item.imageUrl" class="flex justify-between items-start mb-1">
                <div>
                   <div class="flex items-center text-xs text-black font-bold mb-0.5">
                    <Clock class="w-3 h-3 mr-1" />
                    {{ dayjs(item.date).format('HH:mm') }}
                  </div>
                  <h3 class="font-bold text-gray-800">{{ item.title }}</h3>
                </div>
                <button
                  class="text-gray-400 hover:text-black"
                  @click="handleDelete(item.id)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>

              <p v-if="item.description" class="text-sm text-gray-600 mt-1">{{ item.description }}</p>

              <div v-if="item.location" class="flex items-center text-xs text-gray-400 mt-2">
                <MapPin class="w-3 h-3 mr-1" />
                {{ item.location }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" @click="showAddModal = false"></div>

      <div class="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 pointer-events-auto shadow-2xl transform transition-transform duration-300">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold">添加行程</h3>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">标题</label>
            <input
              v-model="formData.title"
              type="text"
              class="w-full p-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-gray-100 transition-all outline-none"
              placeholder="例如：参观博物馆"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">时间</label>
              <input
                v-model="formData.date"
                type="datetime-local"
                class="w-full p-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-gray-100 transition-all outline-none"
              />
            </div>
             <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">地点</label>
              <input
                v-model="formData.location"
                type="text"
                class="w-full p-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-gray-100 transition-all outline-none"
                placeholder="地点名称"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              v-model="formData.description"
              rows="3"
              class="w-full p-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-gray-100 transition-all outline-none resize-none"
              placeholder="添加备注..."
            ></textarea>
          </div>

          <button
            class="w-full bg-black text-white font-bold py-3.5 rounded-xl shadow-lg shadow-black/20 active:scale-95 transition-transform disabled:opacity-50"
            :disabled="!formData.title || submitting"
            @click="handleCreate"
          >
            {{ submitting ? '保存中...' : '保存行程' }}
          </button>
        </div>
      </div>
    </div>

    <LedgerBottomNav />
  </div>
</template>
