// pages/index.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import React from 'react'

export default function Home() {
  const router = useRouter()


  useEffect(() => {
    router.push('/login')  // Редірект на /login
  }, [])
  
  useEffect(() => {
    const handleAuth = async () => {
      const hash = window.location.hash
      if (hash.includes('access_token')) {
        const queryString = hash.substring(1)
        const params = new URLSearchParams(queryString)
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')

        if (access_token && refresh_token) {
          await supabase.auth
            .setSession({ access_token, refresh_token })
            .then(async () => {
              const {
                data: { user },
                error,
              } = await supabase.auth.getUser()
              if (error || !user) {
                console.error('Не вдалося отримати користувача:', error)
                return
              }
              router.push('/dashboard')
            })
        }
      }
    }
    handleAuth()
  }, [])

  return <div>Обробка логіну...</div>
}
