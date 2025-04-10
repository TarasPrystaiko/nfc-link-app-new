// pages/index.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import React from 'react';


export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('access_token')) {
      const queryString = hash.substring(1)
      const params = new URLSearchParams(queryString)
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      if (access_token && refresh_token) {
        supabase.auth
          .setSession({ access_token, refresh_token })
          .then(async () => {
            const {
              data: { user },
              error,
            } = await supabase.auth.getUser()

            if (error) {
              console.error('❌ Помилка отримання користувача:', error)
              return
            }

            if (user) {
              const { error: insertError } = await supabase
                .from('users')
                .upsert({ id: user.id, email: user.email })

              if (insertError) {
                console.error('❌ Не вдалося вставити юзера:', insertError)
              }
            }

            router.push('/admin') // змінити при потребі
          })
          .catch((err) => {
            console.error('❌ setSession error:', err)
          })
      }
    }
  }, [])

  return (
    <div style={{ textAlign: 'center', marginTop: 100 }}>
      <h1>✨ NFC Link App ✨</h1>
      <p>Очікуємо підтвердження входу...</p>
    </div>
  )
}
