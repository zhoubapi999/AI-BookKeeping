<script setup lang="ts">
import { Loader2, Lock, Smartphone, User } from 'lucide-vue-next'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getProfile, login } from '~/api/auth'
import Button from '~/components/ui/button/Button.vue'
import Input from '~/components/ui/input/Input.vue'
import Label from '~/components/ui/label/Label.vue'
import { useUserStore } from '~/stores/user'

const router = useRouter()
const userStore = useUserStore()
const phone = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!phone.value || !password.value) {
    error.value = '请输入手机号和密码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const { token } = await login({ phone: phone.value, password: password.value })
    userStore.setToken(token)

    // Fetch and store user profile immediately
    const profile = await getProfile()
    userStore.setUser(profile)

    router.push('/')
  }
  catch (e: any) {
    error.value = e.response?.data?.message || '登录失败，请检查账号密码'
  }
  finally {
    loading.value = false
  }
}

function goToRegister() {
  router.push('/register')
}
</script>

<template>
  <div class="bg-gradient-to-br p-4 flex min-h-screen items-center justify-center relative overflow-hidden from-gray-100 to-gray-200">
    <!-- Background decorations -->
    <div class="h-full w-full pointer-events-none left-0 top-0 absolute overflow-hidden">
      <div class="animate-float-slow rounded-full bg-black/5 h-[40%] w-[40%] left-[-10%] top-[-10%] absolute blur-3xl" />
      <div class="animate-float-slower rounded-full bg-gray-600/5 h-[40%] w-[40%] bottom-[-10%] right-[-10%] absolute blur-3xl" />
    </div>

    <div class="border border-white/50 rounded-2xl bg-white/90 max-w-md w-full shadow-2xl transform transition-all overflow-hidden animate-fade-in-up backdrop-blur-xl">
      <div class="p-8">
        <div class="mb-8 text-center">
          <div class="text-black mb-4 rounded-full bg-gray-100 inline-flex h-16 w-16 shadow-inner items-center justify-center">
            <User class="h-8 w-8" />
          </div>
          <h2 class="text-2xl text-gray-800 tracking-tight font-bold">
            欢迎回来~
          </h2>
          <p class="text-sm text-gray-500 mt-2">
            请登录您的账号以继续
          </p>
        </div>

        <div v-if="error" class="animate-shake text-sm text-red-600 mb-6 p-3 border border-red-100 rounded-lg bg-red-50 flex items-center">
          <div class="i-carbon-warning-filled mr-2 h-4 w-4" />
          {{ error }}
        </div>

        <form class="space-y-6" @submit.prevent="handleLogin">
          <div class="space-y-2">
            <Label>手机号</Label>
            <div class="group relative">
              <div class="text-gray-400 pl-3 flex pointer-events-none transition-colors items-center inset-y-0 left-0 absolute group-focus-within:text-black">
                <Smartphone class="h-5 w-5" />
              </div>
              <Input
                v-model="phone"
                type="tel"
                required
                class="pl-10 transition-all focus:border-black hover:border-gray-600 focus:ring-2 focus:ring-gray-100"
                placeholder="请输入手机号"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label>密码</Label>
            <div class="group relative">
              <div class="text-gray-400 pl-3 flex pointer-events-none transition-colors items-center inset-y-0 left-0 absolute group-focus-within:text-black">
                <Lock class="h-5 w-5" />
              </div>
              <Input
                v-model="password"
                type="password"
                required
                class="pl-10 transition-all focus:border-black hover:border-gray-600 focus:ring-2 focus:ring-gray-100"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <Button
            type="submit"
            :disabled="loading"
            class="text-base font-medium py-6 w-full shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 bg-black text-white hover:bg-gray-800"
          >
            <Loader2 v-if="loading" class="mr-2 h-5 w-5 animate-spin" />
            {{ loading ? '登录中...' : '登录' }}
          </Button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-sm text-gray-600">
            还没有账号？
            <button class="text-black font-medium transition-all hover:text-gray-700 hover:underline" @click="goToRegister">
              立即注册
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-float-slow {
  animation: float 8s ease-in-out infinite;
}

.animate-float-slower {
  animation: float 12s ease-in-out infinite reverse;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
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
