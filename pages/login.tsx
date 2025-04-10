// pages/login.tsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import React from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      setMessage('Помилка при відправці посилання: ' + error.message)
    } else {
      setMessage('Перевір свою пошту для входу')
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🔐 Вхід</h1>
      <input
        type="email"
        placeholder="Введи email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleLogin}>Увійти</button>
      <p>{message}</p>
    </div>
  )
}
