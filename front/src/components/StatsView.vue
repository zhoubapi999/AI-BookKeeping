<script setup lang="ts">
import type { Category, Transaction } from '~/api'
import dayjs from 'dayjs'
import { BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { ArrowRight } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import VChart from 'vue-echarts'
import Card from '~/components/ui/card/Card.vue'
import CardContent from '~/components/ui/card/CardContent.vue'
import CardHeader from '~/components/ui/card/CardHeader.vue'
import CardTitle from '~/components/ui/card/CardTitle.vue'
import Input from '~/components/ui/input/Input.vue'

const props = defineProps<{
  transactions: Transaction[]
  categories: Category[]
}>()

const emit = defineEmits<{
  (e: 'dateSelect', date: string): void
}>()

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

// Stats state
const statsTab = ref<'day' | 'month' | 'year'>('day')
const startDate = ref(dayjs().startOf('month').format('YYYY-MM-DD'))
const endDate = ref(dayjs().endOf('month').format('YYYY-MM-DD'))

// Hover state for custom tooltip
const hoveredData = ref<{ label: string, value: number, date?: string } | null>(null)

watch(statsTab, (val) => {
  hoveredData.value = null // Reset hover data on tab change
  const now = dayjs()
  switch (val) {
    case 'day':
      startDate.value = now.startOf('month').format('YYYY-MM-DD')
      endDate.value = now.endOf('month').format('YYYY-MM-DD')
      break
    case 'month':
      startDate.value = now.startOf('year').format('YYYY-MM-DD')
      endDate.value = now.endOf('year').format('YYYY-MM-DD')
      break
    case 'year':
      startDate.value = now.subtract(4, 'year').startOf('year').format('YYYY-MM-DD')
      endDate.value = now.endOf('year').format('YYYY-MM-DD')
      break
  }
})

function handleChartMouseOver(params: any) {
  if (params.componentType === 'series') {
    const dataItem = params.data
    hoveredData.value = {
      label: params.name,
      value: typeof dataItem === 'object' ? dataItem.value : dataItem,
      date: typeof dataItem === 'object' ? dataItem.date : undefined,
    }
  }
}

function handleHeaderClick() {
  if (hoveredData.value?.date) {
    emit('dateSelect', hoveredData.value.date)
  }
}

const chartOption = computed(() => {
  const start = dayjs(startDate.value)
  const end = dayjs(endDate.value)
  const rangeTransactions = props.transactions.filter((t) => {
    const d = dayjs(t.date)
    return (d.isSame(start) || d.isAfter(start)) && (d.isSame(end) || d.isBefore(end))
  })

  const xData: string[] = []
  const dateMap = new Map<string, number>()

  // Initialize map and xData based on granularity
  let current = start
  // Avoid infinite loop if start > end
  if (current.isAfter(end))
    return {}

  while (current.isBefore(end) || current.isSame(end, 'day')) {
    let key = ''
    let label = ''

    if (statsTab.value === 'day') {
      key = current.format('YYYY-MM-DD')
      label = current.format('MM-DD')
      current = current.add(1, 'day')
    }
    else if (statsTab.value === 'month') {
      key = current.format('YYYY-MM')
      label = current.format('YYYY-MM')
      current = current.add(1, 'month')
    }
    else {
      key = current.format('YYYY')
      label = current.format('YYYY')
      current = current.add(1, 'year')
    }

    xData.push(label)
    dateMap.set(key, 0)
  }

  // Aggregate Data
  rangeTransactions.forEach((t) => {
    if (t.type === 'expense') {
      let key = ''
      if (statsTab.value === 'day') {
        key = dayjs(t.date).format('YYYY-MM-DD')
      }
      else if (statsTab.value === 'month') {
        key = dayjs(t.date).format('YYYY-MM')
      }
      else {
        key = dayjs(t.date).format('YYYY')
      }

      if (dateMap.has(key)) {
        dateMap.set(key, (dateMap.get(key) || 0) + t.amount)
      }
    }
  })

  const finalSeriesData: any[] = []
  const finalXData: string[] = []

  // Reset current for reading from map
  current = start
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    let key = ''
    let label = ''
    let fullDate = ''

    if (statsTab.value === 'day') {
      fullDate = current.format('YYYY-MM-DD')
      key = fullDate
      label = current.format('MM-DD')
      current = current.add(1, 'day')
    }
    else if (statsTab.value === 'month') {
      key = current.format('YYYY-MM')
      label = current.format('MM月')
      current = current.add(1, 'month')
    }
    else {
      key = current.format('YYYY')
      label = current.format('YYYY')
      current = current.add(1, 'year')
    }
    finalXData.push(label)

    // Push object with value and extra data (date)
    finalSeriesData.push({
      value: dateMap.get(key) || 0,
      date: statsTab.value === 'day' ? key : undefined,
    })
  }

  return {
    tooltip: {
      show: false, // Hide default tooltip as we use custom div
      trigger: 'axis',
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '5%',
      top: '15%', // Increase top padding for the custom header
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: finalXData,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: '#6b7280',
        fontSize: 10,
        interval: 'auto',
        hideOverlap: true,
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#f3f4f6',
        },
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 10,
      },
    },
    series: [
      {
        name: '金额',
        type: 'bar',
        barWidth: '60%',
        data: finalSeriesData,
        itemStyle: {
          color: '#3b82f6',
          borderRadius: [4, 4, 0, 0],
        },
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.1)',
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  }
})

// Pie Chart
const pieChartType = ref<'expense' | 'income'>('expense')
const pieChartOption = computed(() => {
  const start = dayjs(startDate.value)
  const end = dayjs(endDate.value)
  const rangeTransactions = props.transactions.filter((t) => {
    const d = dayjs(t.date)
    return (d.isSame(start) || d.isAfter(start)) && (d.isSame(end) || d.isBefore(end)) && t.type === pieChartType.value
  })

  const dataMap = new Map<string, number>()
  rangeTransactions.forEach((t) => {
    const categoryName = getCategoryName(t.categoryId)
    dataMap.set(categoryName, (dataMap.get(categoryName) || 0) + t.amount)
  })

  const data = Array.from(dataMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value) // Sort by value

  const colors = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#6366f1',
    '#14b8a6',
    '#f97316',
    '#06b6d4',
  ]

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#e5e7eb',
      textStyle: {
        color: '#374151',
      },
    },
    legend: {
      bottom: '0%',
      left: 'center',
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        color: '#6b7280',
        fontSize: 12,
      },
    },
    series: [
      {
        name: pieChartType.value === 'expense' ? '支出构成' : '收入构成',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#374151',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
        labelLine: {
          show: false,
        },
        color: colors,
        data,
      },
    ],
  }
})

function getCategoryName(id: number) {
  return props.categories.find(c => c.id === id)?.name || '未知'
}
</script>

<template>
  <div class="pb-20 space-y-6">
    <!-- Stats Tabs -->
    <div class="flex justify-center">
      <div class="p-1 rounded-xl bg-secondary/50 flex gap-1">
        <button
          v-for="tab in ['day', 'month', 'year'] as const"
          :key="tab"
          class="text-sm font-medium px-6 py-1.5 rounded-lg transition-all"
          :class="statsTab === tab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'"
          @click="statsTab = tab"
        >
          {{ tab === 'day' ? '日' : tab === 'month' ? '月' : '年' }}
        </button>
      </div>
    </div>

    <!-- Date Range Search -->
    <div class="px-1 flex gap-3 items-center justify-center">
      <div class="flex-1 relative">
        <Input
          v-model="startDate"
          type="date"
          class="text-sm text-center border-border/50 bg-background h-10 w-full transition-colors focus:border-primary"
        />
      </div>
      <span class="text-sm text-muted-foreground font-medium">至</span>
      <div class="flex-1 relative">
        <Input
          v-model="endDate"
          type="date"
          class="text-sm text-center border-border/50 bg-background h-10 w-full transition-colors focus:border-primary"
        />
      </div>
    </div>

    <Card class="border-border/50 shadow-sm">
      <CardHeader class="pb-2">
        <div class="flex items-center justify-between">
          <CardTitle class="text-base font-semibold flex gap-2 items-center">
            <div class="i-carbon-chart-bar text-primary h-4 w-4" />
            支出/收入趋势
          </CardTitle>
        </div>
        <div
          v-if="hoveredData"
          class="text-xs text-primary font-bold mt-2 flex gap-1 cursor-pointer items-center justify-center animate-fade-in hover:underline"
          @click="handleHeaderClick"
        >
          {{ hoveredData.label }}: ¥{{ hoveredData.value }}
          <div v-if="hoveredData.date" class="text-[10px] text-gray-400 font-normal ml-1 flex items-center">
            点击查看 <ArrowRight class="ml-0.5 h-3 w-3" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="h-[250px] w-full">
          <VChart
            :option="chartOption"
            autoresize
            @click="handleChartMouseOver"
          />
        </div>
      </CardContent>
    </Card>

    <Card class="border-border/50 shadow-sm">
      <CardHeader class="pb-2">
        <div class="flex items-center justify-between">
          <CardTitle class="text-base font-semibold flex gap-2 items-center">
            <div class="i-carbon-pie-chart text-primary h-4 w-4" />
            分类构成
          </CardTitle>
          <div class="p-1 rounded-lg bg-secondary/50 flex gap-1">
            <button
              class="text-xs font-medium px-3 py-1 rounded-md transition-all"
              :class="pieChartType === 'expense' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'"
              @click="pieChartType = 'expense'"
            >
              支出
            </button>
            <button
              class="text-xs font-medium px-3 py-1 rounded-md transition-all"
              :class="pieChartType === 'income' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'"
              @click="pieChartType = 'income'"
            >
              收入
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="h-[250px] w-full">
          <VChart :option="pieChartOption" autoresize />
        </div>
      </CardContent>
    </Card>
  </div>
</template>
