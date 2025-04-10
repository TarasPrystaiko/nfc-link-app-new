import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const UserDashboard = () => {
  const router = useRouter();
  const { slug } = router.query;  // Отримуємо slug з URL

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('slug', slug)
        .single();  // Отримуємо користувача за slug

      if (error) {
        console.error('❌ Помилка з отриманням користувача:', error);
        return;
      }

      setUser(data);  // Зберігаємо дані користувача
    };

    if (slug) {
      fetchUser();
    }
  }, [slug]);

  if (!user) return <div>Завантаження...</div>;

  return (
    <div>
      <h1>{user.first_name} {user.last_name} - Dashboard</h1>
      {/* Тут можна додати іншу інформацію, пов'язану з користувачем */}
    </div>
  );
};

export default UserDashboard;
