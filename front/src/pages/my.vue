<script setup lang="ts">
import { ChevronRight, Home, Lock, LogOut } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { changePassword, getProfile } from '~/api/auth'
import Button from '~/components/ui/button/Button.vue'
import Drawer from '~/components/ui/drawer/Drawer.vue'
import DrawerContent from '~/components/ui/drawer/DrawerContent.vue'
import DrawerHeader from '~/components/ui/drawer/DrawerHeader.vue'
import DrawerTitle from '~/components/ui/drawer/DrawerTitle.vue'
import Input from '~/components/ui/input/Input.vue'
import Label from '~/components/ui/label/Label.vue'
import { useUserStore } from '~/stores/user'

const router = useRouter()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const oldPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const message = ref('')
const error = ref('')
const loading = ref(false)
const showPasswordDrawer = ref(false)

onMounted(async () => {
  try {
    // Refresh user profile in background
    const profile = await getProfile()
    userStore.setUser(profile)
  }
  catch {
    if (!user.value) {
      router.push('/login')
    }
  }
})

async function handleChangePassword() {
  if (newPassword.value !== confirmNewPassword.value) {
    error.value = '两次输入的新密码不一致'
    return
  }

  if (newPassword.value.length < 6) {
    error.value = '新密码长度不能少于6位'
    return
  }

  loading.value = true
  error.value = ''
  message.value = ''

  try {
    await changePassword({
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
    })
    message.value = '密码修改成功'
    oldPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
    setTimeout(() => {
      showPasswordDrawer.value = false
      message.value = ''
    }, 1500)
  }
  catch (e: any) {
    error.value = e.response?.data?.message || '修改失败'
  }
  finally {
    loading.value = false
  }
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="pb-20 bg-gray-50 min-h-screen animate-fade-in">
    <!-- Header -->
    <div class="text-white p-6 rounded-b-[2.5rem] bg-zinc-900 shadow-xl relative overflow-hidden">
      <!-- Decorative Background Elements -->
      <div class="rounded-full bg-white/5 h-64 w-64 pointer-events-none right-0 top-0 absolute blur-3xl -mr-16 -mt-16" />
      <div class="rounded-full bg-white/5 h-48 w-48 pointer-events-none bottom-0 left-0 absolute blur-3xl -mb-10 -ml-10" />

      <div class="mb-8 flex items-center justify-between relative z-10">
        <h1 class="text-xl tracking-tight font-bold">
          个人中心
        </h1>
        <Button variant="ghost" size="icon" class="text-white rounded-full bg-white/10 transition-all backdrop-blur-sm hover:text-white/80 hover:bg-white/20" @click="goBack">
          <Home class="h-5 w-5" />
        </Button>
      </div>

      <div class="flex gap-4 items-center relative z-10">
        <img
          :src="`https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.phone || 'user'}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`"
          class="h-16 w-16 rounded-full ring-2 ring-zinc-700 object-cover"
          alt="User Avatar"
        />
        <div>
          <h2 class="text-xl text-white font-bold">
            用户 {{ user?.phone?.slice(-4) }}
          </h2>
          <p class="text-sm text-zinc-400 mt-1">
            已登录
          </p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="mx-auto mt-8 px-4 max-w-md space-y-4">
      <div
        class="p-4 rounded-2xl bg-white flex cursor-pointer shadow-sm transition-all items-center justify-between hover:shadow-md active:scale-[0.98]"
        @click="showPasswordDrawer = true"
      >
        <div class="flex items-center space-x-4">
          <div class="text-blue-600 p-3 rounded-xl bg-blue-50">
            <Lock class="h-6 w-6" />
          </div>
          <span class="text-gray-700 font-medium">修改密码</span>
        </div>
        <ChevronRight class="text-gray-400 h-5 w-5" />
      </div>

      <div
        class="p-4 rounded-2xl bg-white flex cursor-pointer shadow-sm transition-all items-center justify-between hover:shadow-md active:scale-[0.98]"
        @click="handleLogout"
      >
        <div class="flex items-center space-x-4">
          <div class="text-red-600 p-3 rounded-xl bg-red-50">
            <LogOut class="h-6 w-6" />
          </div>
          <span class="text-gray-700 font-medium">退出登录</span>
        </div>
        <ChevronRight class="text-gray-400 h-5 w-5" />
      </div>
    </div>

    <!-- Password Drawer -->
    <Drawer v-model:open="showPasswordDrawer">
      <DrawerContent>
        <div class="mx-auto max-w-sm w-full">
          <DrawerHeader>
            <DrawerTitle>修改密码</DrawerTitle>
          </DrawerHeader>

          <div class="p-4 pb-8">
            <div v-if="message" class="text-sm text-green-600 mb-4 p-3 rounded-lg bg-green-50 flex items-center animate-pulse">
              {{ message }}
            </div>

            <div v-if="error" class="animate-shake text-sm text-red-600 mb-4 p-3 rounded-lg bg-red-50 flex items-center">
              {{ error }}
            </div>

            <form class="space-y-4" @submit.prevent="handleChangePassword">
              <div class="space-y-2">
                <Label>当前密码</Label>
                <Input
                  v-model="oldPassword"
                  type="password"
                  required
                  placeholder="请输入当前密码"
                />
              </div>

              <div class="space-y-2">
                <Label>新密码</Label>
                <Input
                  v-model="newPassword"
                  type="password"
                  required
                  placeholder="请输入新密码"
                />
              </div>

              <div class="space-y-2">
                <Label>确认新密码</Label>
                <Input
                  v-model="confirmNewPassword"
                  type="password"
                  required
                  placeholder="请再次输入新密码"
                />
              </div>

              <Button
                type="submit"
                class="mt-6 w-full"
                :disabled="loading"
              >
                {{ loading ? '修改中...' : '确认修改' }}
              </Button>
            </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>
