import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const CardPage = () => {
  const router = useRouter();
  const { slug } = router.query;  // Отримуємо slug з URL

  const [card, setCard] = useState(null);

  useEffect(() => {
    const fetchCard = async () => {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('slug', slug)
        .single();  // Отримуємо картку за slug

      if (error) {
        console.error('❌ Помилка з отриманням картки:', error);
        return;
      }

      setCard(data);  // Зберігаємо дані картки
    };

    if (slug) {
      fetchCard();
    }
  }, [slug]);

  if (!card) return <div>Завантаження...</div>;

  return (
    <div>
      <h1>Картка: {card.slug}</h1>
      <p>URL: <a href={card.url} target="_blank">{card.url}</a></p>
    </div>
  );
};

export default CardPage;
