import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  slug: string;
  social?: string;
}

interface Card {
  id: string;
  user_id: string;
  slug: string;
  url: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [newUser, setNewUser] = useState({ email: '', first_name: '', last_name: '', social: '' });
  const [newCard, setNewCard] = useState({ user_id: '', slug: '', url: '' });

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setUsers(data || []);
  };

  const fetchCards = async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setCards(data || []);
  };

  useEffect(() => {
    fetchUsers();
    fetchCards();
  }, []);

  // Генерація slug на основі імені та прізвища
  const generateSlugFromName = (firstName: string, lastName: string, cardIndex: number) => {
    return `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${cardIndex}`;
  };

  const handleCreateUser = async () => {
    const { email, first_name, last_name } = newUser;
    if (!email || !first_name || !last_name) {
      alert('❌ Заповніть обовʼязкові поля (email, ім’я, прізвище)');
      return;
    }

    // Генерація унікального slug на основі імені та прізвища
    const slug = `${first_name.toLowerCase()}-${last_name.toLowerCase()}`;

    const { error } = await supabase.from('users').insert({ ...newUser, slug });
    if (error) alert(`❌ ${error.message}`);
    else {
      alert('✅ Користувача створено');
      setNewUser({ email: '', first_name: '', last_name: '', social: '' });
      fetchUsers();
    }
  };

  const handleCreateCard = async () => {
    const { user_id, url } = newCard;
    if (!user_id || !url) return alert('❌ Заповніть всі поля картки');

    const user = users.find(u => u.id === user_id);
    if (!user) return alert('❌ Користувача не знайдено');

    // Генерація унікального slug для картки
    const cardIndex = cards.filter(card => card.user_id === user.id).length + 1; // Підраховуємо кількість карток для цього користувача
    const cardSlug = `${user.first_name.toLowerCase()}-${user.last_name.toLowerCase()}-${cardIndex}`;

    const { error } = await supabase.from('cards').insert({
      user_id,
      slug: cardSlug,  // Генерація унікального slug для картки
      url
    });

    if (error) alert(`❌ ${error.message}`);
    else {
      setNewCard({ user_id: '', slug: '', url: '' });
      fetchCards();
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>👑 Адмін Панель</h1>

      <h3>➕ Додати користувача</h3>
      <input placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
      <input placeholder="Ім’я" value={newUser.first_name} onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })} />
      <input placeholder="Прізвище" value={newUser.last_name} onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })} />
      <button onClick={handleCreateUser}>Створити</button>

      <h3>📄 Користувачі</h3>
      <table border={1}>
        <thead>
          <tr><th>Email</th><th>Ім’я</th><th>Прізвище</th><th>Slug</th><th>Дії</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.first_name}</td>
              <td>{u.last_name}</td>
              <td>{u.slug}</td>
              <td>
                <button onClick={() => handleCreateCard()}>Додати картку</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: '2rem' }}>➕ Додати картку</h3>
      <select value={newCard.user_id} onChange={(e) => setNewCard({ ...newCard, user_id: e.target.value })}>
        <option value="">Оберіть користувача</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
        ))}
      </select>
      <input placeholder="URL" value={newCard.url} onChange={(e) => setNewCard({ ...newCard, url: e.target.value })} />
      <button onClick={handleCreateCard}>Створити картку</button>
    </div>
  );
}
