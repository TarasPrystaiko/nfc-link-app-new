// pages/admin.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import React from 'react';


interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
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
  const [expanded, setExpanded] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    email: '',
    first_name: '',
    last_name: '',
    social: '',
  });

  const [newCard, setNewCard] = useState({
    user_id: '',
    slug: '',
    url: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchCards();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, social')
      .order('created_at', { ascending: false });

    if (data) setUsers(data);
    else console.error(error);
  };

  const fetchCards = async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('id, user_id, slug, url')
      .order('created_at', { ascending: false });

    if (data) setCards(data);
    else console.error(error);
  };

  const handleCreateUser = async () => {
    const { email, first_name, last_name, social } = newUser;
    if (!email || !first_name || !last_name) return alert('❌ Заповніть обовʼязкові поля');

    const { error } = await supabase.from('users').insert({ email, first_name, last_name, social });
    if (error) alert('❌ Помилка створення: ' + error.message);
    else {
      alert('✅ Користувача створено');
      setNewUser({ email: '', first_name: '', last_name: '', social: '' });
      fetchUsers();
    }
  };

  const handleCreateCard = async () => {
    const { user_id, slug, url } = newCard;
    if (!user_id || !slug || !url) return alert('❌ Заповніть всі поля');

    const { error } = await supabase.from('cards').insert({ user_id, slug, url });
    if (error) alert('❌ Помилка додавання картки: ' + error.message);
    else {
      alert('✅ Картку додано');
      setNewCard({ user_id: '', slug: '', url: '' });
      fetchCards();
    }
  };

  const handleUpdateCard = async (id: string, updates: Partial<Card>) => {
    const { error } = await supabase.from('cards').update(updates).eq('id', id);
    if (error) alert('❌ Не вдалося оновити картку');
    else {
      alert('✅ Оновлено');
      fetchCards();
    }
  };

  const handleDeleteCard = async (id: string) => {
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (error) alert('❌ Не вдалося видалити картку');
    else {
      alert('✅ Видалено');
      fetchCards();
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>👑 Адмін Панель</h1>

      <h3>➕ Додати користувача</h3>
      <input placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
      <input placeholder="Імʼя" value={newUser.first_name} onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })} />
      <input placeholder="Прізвище" value={newUser.last_name} onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })} />
      <input placeholder="Social (необовʼязково)" value={newUser.social} onChange={(e) => setNewUser({ ...newUser, social: e.target.value })} />
      <button onClick={handleCreateUser}>Створити</button>

      <h3>📄 Користувачі</h3>
      <table border={1} cellPadding={6} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Імʼя</th>
            <th>Прізвище</th>
            <th>Social</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.first_name}</td>
              <td>{user.last_name}</td>
              <td>{user.social}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>➕ Додати картку</h3>
      <select value={newCard.user_id} onChange={(e) => setNewCard({ ...newCard, user_id: e.target.value })}>
        <option value="">Оберіть користувача</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.first_name} {u.last_name}
          </option>
        ))}
      </select>
      <input placeholder="Slug" value={newCard.slug} onChange={(e) => setNewCard({ ...newCard, slug: e.target.value })} />
      <input placeholder="URL" value={newCard.url} onChange={(e) => setNewCard({ ...newCard, url: e.target.value })} />
      <button onClick={handleCreateCard}>Створити</button>

      <h3>💳 Картки</h3>
      {users.map((user) => {
        const userCards = cards.filter((c) => c.user_id === user.id);
        return (
          <div key={user.id} style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setExpanded(expanded === user.id ? null : user.id)}>
              📂 {user.first_name} {user.last_name}
            </div>
            {expanded === user.id && (
              <table border={1} cellPadding={5} style={{ marginTop: '0.5rem' }}>
                <thead>
                  <tr>
                    <th>Slug</th>
                    <th>URL</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {userCards.map((card) => (
                    <tr key={card.id}>
                      <td>
                        <input
                          value={card.slug}
                          onChange={(e) =>
                            setCards((prev) =>
                              prev.map((x) => (x.id === card.id ? { ...x, slug: e.target.value } : x))
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={card.url}
                          onChange={(e) =>
                            setCards((prev) =>
                              prev.map((x) => (x.id === card.id ? { ...x, url: e.target.value } : x))
                            )
                          }
                        />
                      </td>
                      <td>
                        <button onClick={() => handleUpdateCard(card.id, card)}>💾</button>{' '}
                        <button onClick={() => handleDeleteCard(card.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
}
