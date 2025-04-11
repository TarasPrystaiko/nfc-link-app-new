import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';  // Для маршрутизації

const SlugRedirect = () => {
  const router = useRouter();
  const { slug } = router.query;  // Отримуємо slug з URL
  const [loading, setLoading] = useState(true);  // Стан для завантаження

  useEffect(() => {
    if (!slug) return; // Перевірка, чи є slug
  
    const fetchCard = async () => {
      const { data, error } = await supabase
        .from('cards')
        .select('original_url') // Отримуємо оригінальну URL-лінку
        .eq('slug', slug)
        .single(); // Пошук по slug
  
      if (error) {
        console.error('Помилка з отриманням URL для цього slug:', error);
        return;
      }
  
      if (data && data.original_url) {
        // Редірект на оригінальну URL-лінку
        router.push(data.original_url);
      } else {
        alert('❌ Посилання не знайдено!');
      }
    };
  
    fetchCard(); // Викликаємо один раз при зміні slug
  
  }, [slug, router]); // Залежності тільки slug і router
  

  if (loading) return <div>Завантаження...</div>;

  return null;  // Повертаємо null, бо редірект відбудеться через router.push
};

export default SlugRedirect;
