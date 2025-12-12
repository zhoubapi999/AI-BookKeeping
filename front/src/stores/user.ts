import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const user = ref<any>(null)

  function setToken(newToken: string) {
    token.value = newToken
  }

  function setUser(newUser: any) {
    user.value = newUser
  }

  function logout() {
    token.value = ''
    user.value = null
  }

  return {
    token,
    user,
    setToken,
    setUser,
    logout,
  }
}, {
  persist: true,
})
