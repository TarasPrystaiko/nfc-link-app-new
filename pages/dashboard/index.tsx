import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';  // Імпорт UUID для генерації унікальних slug
import { useRouter } from 'next/router';  // Для маршрутизації

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
  original_url: string; // Додаємо поле для оригінального URL
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [newUser, setNewUser] = useState({ email: '', first_name: '', last_name: '', social: '' });
  const [newCard, setNewCard] = useState({ user_id: '', slug: '', url: '', original_url: '' });
  const [expandedUserIds, setExpandedUserIds] = useState<string[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchCards();
  }, []);

  // Генерація унікального slug для картки
  const generateUniqueSlug = async (userId: string) => {
    let slug = uuidv4();
    let isSlugUnique = false;

    while (!isSlugUnique) {
      const { data, error } = await supabase
        .from('cards')
        .select('slug')
        .eq('slug', slug)
        .limit(1);

      if (data && data.length > 0) {
        slug = uuidv4();
      } else {
        isSlugUnique = true;
      }
    }
    return slug;
  };

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

  const handleCreateUser = async () => {
    const { email, first_name, last_name } = newUser;
    if (!email || !first_name || !last_name) {
      alert('❌ Заповніть обовʼязкові поля (email, ім’я, прізвище)');
      return;
    }

    const { error } = await supabase.from('users').insert(newUser);
    if (error) alert(`❌ ${error.message}`);
    else {
      alert('✅ Користувача створено');
      setNewUser({ email: '', first_name: '', last_name: '', social: '' });
      fetchUsers();
    }
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    await supabase.from('users').update(updates).eq('id', id);
    fetchUsers();
  };

  const handleDeleteUser = async (id: string) => {
    await supabase.from('users').delete().eq('id', id);
    fetchUsers();
  };

  const handleCreateCard = async () => {
    const { user_id, original_url } = newCard;
    if (!user_id || !original_url) return alert('❌ Заповніть всі поля картки');

    const user = users.find(u => u.id === user_id);
    if (!user) return alert('❌ Користувача не знайдено');

    const cardSlug = await generateUniqueSlug(user.id);
    const generatedUrl = `https://nfc-link-app-new.vercel.app/dashboard/${cardSlug}`;

    // Додаємо картку разом з original_url і згенерованим URL
    const { error } = await supabase.from('cards').insert({
      user_id,
      slug: cardSlug,
      url: generatedUrl,  // Генерація URL з новим slug
      original_url: original_url // Збереження введеного користувачем оригінального URL
    });

    if (error) alert(`❌ ${error.message}`);
    else {
      setNewCard({ user_id: '', slug: '', url: '', original_url: '' }); // Оновлюємо state
      fetchCards();
    }
  };

  const handleUpdateCard = async (id: string, updates: Partial<Card>) => {
    await supabase.from('cards').update(updates).eq('id', id);
    fetchCards();
  };

  const handleDeleteCard = async (id: string) => {
    await supabase.from('cards').delete().eq('id', id);
    fetchCards();
  };

  const handleEditOriginalURL = (cardId: string, currentOriginalUrl: string) => {
    const newOriginalUrl = prompt('Введіть новий Original URL:', currentOriginalUrl); // Запитуємо новий URL у користувача
    if (newOriginalUrl) {
      handleUpdateCardOriginalURL(cardId, newOriginalUrl); // Якщо є новий URL, передаємо на оновлення
    }
  };

  const handleUpdateCardOriginalURL = async (id: string, newOriginalUrl: string) => {
    const { error } = await supabase.from('cards').update({ original_url: newOriginalUrl }) // Оновлюємо тільки поле original_url
      .eq('id', id); // За id картки

    if (error) {
      alert('❌ Помилка при оновленні Original URL');
    } else {
      alert('✅ Original URL успішно оновлено');
      fetchCards(); // Перезавантажуємо картки після оновлення
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>👑 Адмін Панель</h1>

      <h3>➕ Додати користувача</h3>
      <input
        placeholder="Email"
        value={newUser.email}
        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
      />
      <input
        placeholder="Ім’я"
        value={newUser.first_name}
        onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
      />
      <input
        placeholder="Прізвище"
        value={newUser.last_name}
        onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
      />
      <input
        placeholder="Social (необовʼязково)"
        value={newUser.social}
        onChange={(e) => setNewUser({ ...newUser, social: e.target.value })}
      />
      <button onClick={handleCreateUser}>Створити</button>

      <h3>📄 Користувачі</h3>
      <table border={1}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Ім’я</th>
            <th>Прізвище</th>
            <th>Social</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>
                <input
                  value={u.first_name}
                  onChange={(e) =>
                    setUsers((prev) =>
                      prev.map((x) => (x.id === u.id ? { ...x, first_name: e.target.value } : x))
                    )
                  }
                />
              </td>
              <td>
                <input
                  value={u.last_name}
                  onChange={(e) =>
                    setUsers((prev) =>
                      prev.map((x) => (x.id === u.id ? { ...x, last_name: e.target.value } : x))
                    )
                  }
                />
              </td>
              <td>
                <input
                  value={u.social || ''}
                  onChange={(e) =>
                    setUsers((prev) =>
                      prev.map((x) => (x.id === u.id ? { ...x, social: e.target.value } : x))
                    )
                  }
                />
              </td>
              <td>
                <button onClick={() => handleUpdateUser(u.id, u)}>💾</button>
                <button onClick={() => handleDeleteUser(u.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: '2rem' }}>➕ Додати картку</h3>
      <select
        value={newCard.user_id}
        onChange={(e) => setNewCard({ ...newCard, user_id: e.target.value })}
      >
        <option value="">Оберіть користувача</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.first_name} {u.last_name}
          </option>
        ))}
      </select>
      <input placeholder="Slug (генерується автоматично)" value={newCard.slug} disabled />
      <input
        placeholder="Original URL"
        value={newCard.original_url}
        onChange={(e) => setNewCard({ ...newCard, original_url: e.target.value })}
      />
      <button onClick={handleCreateCard}>Створити картку</button>

      <h3 style={{ marginTop: '2rem' }}>💳 Картки</h3>
      {users.map((user) => (
        <div key={user.id} style={{ marginBottom: '1rem' }}>
          <div
            onClick={() => toggleExpand(user.id)}
            style={{ cursor: 'pointer', fontWeight: 'bold' }}
          >
            📂 {user.first_name} {user.last_name}
          </div>
          {expandedUserIds.includes(user.id) && (
            <table border={1} style={{ marginTop: '0.5rem' }}>
              <thead>
                <tr>
                  <th>Slug</th>
                  <th>URL</th>
                  <th>Original URL</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {cards
                  .filter((c) => c.user_id === user.id)
                  .map((card) => (
                    <tr key={card.id}>
                      <td>{card.slug}</td>
                      <td>
            <a href={card.url} target="_blank" rel="noopener noreferrer">
              {card.url}
            </a>
          </td>                      <td>{card.original_url}</td>
                      <td>
                        <button onClick={() => handleEditOriginalURL(card.id, card.original_url)}>
                          Редагувати Original URL
                        </button>
                        <button onClick={() => handleDeleteCard(card.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
