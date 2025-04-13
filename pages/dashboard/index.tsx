import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid'; 
import { useRouter } from 'next/router';  
import styles from '../../styles/AdminPage.module.css'; // Імпортуємо стилі

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
  original_url: string;
  card_name: string; // Додано поле для назви карти
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [newUser, setNewUser] = useState({ email: '', first_name: '', last_name: '', social: '' });
  const [newCard, setNewCard] = useState({ user_id: '', slug: '', url: '', original_url: '', card_name: '' });
  const [expandedUserIds, setExpandedUserIds] = useState<string[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchCards();
  }, []);

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
    const { user_id, original_url, card_name } = newCard;
    if (!user_id || !original_url || !card_name) return alert('❌ Заповніть всі поля картки');

    const user = users.find(u => u.id === user_id);
    if (!user) return alert('❌ Користувача не знайдено');

    const cardSlug = await generateUniqueSlug(user.id);
    const generatedUrl = `https://nfc-link-app-new.vercel.app/dashboard/${cardSlug}`;

    const { error } = await supabase.from('cards').insert({
      user_id,
      slug: cardSlug,
      url: generatedUrl,
      original_url: original_url,
      card_name // Додаємо назву картки
    });

    if (error) alert(`❌ ${error.message}`);
    else {
      setNewCard({ user_id: '', slug: '', url: '', original_url: '', card_name: '' });
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
    const newOriginalUrl = prompt('Введіть новий Original URL:', currentOriginalUrl);
    if (newOriginalUrl) {
      handleUpdateCardOriginalURL(cardId, newOriginalUrl);
    }
  };

  const handleUpdateCardOriginalURL = async (id: string, newOriginalUrl: string) => {
    const { error } = await supabase.from('cards').update({ original_url: newOriginalUrl })
      .eq('id', id);

    if (error) {
      alert('❌ Помилка при оновленні Original URL');
    } else {
      alert('✅ Original URL успішно оновлено');
      fetchCards();
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const generateOrderNumber = (index: number) => {
    return index + 1;
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>👑 Адмін Панель</h1>

      <h3>➕ Додати користувача</h3>
      <input placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
      <input placeholder="Ім’я" value={newUser.first_name} onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })} />
      <input placeholder="Прізвище" value={newUser.last_name} onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })} />
      <input placeholder="Social (необовʼязково)" value={newUser.social} onChange={(e) => setNewUser({ ...newUser, social: e.target.value })} />
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
              <td><input value={u.first_name} onChange={(e) => setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, first_name: e.target.value } : x)))} /></td>
              <td><input value={u.last_name} onChange={(e) => setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, last_name: e.target.value } : x)))} /></td>
              <td><input value={u.social || ''} onChange={(e) => setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, social: e.target.value } : x)))} /></td>
              <td>
                <button className={styles.button} onClick={() => handleUpdateUser(u.id, u)}>Edit</button>
                <button className={`${styles.button} ${styles.delete}`} onClick={() => handleDeleteUser(u.id)}>Del</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>➕ Додати картку</h3>
      <select value={newCard.user_id} onChange={(e) => setNewCard({ ...newCard, user_id: e.target.value })}>
        <option value="">Оберіть користувача</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
        ))}
      </select>
      <input placeholder="Назва карти" value={newCard.card_name} onChange={(e) => setNewCard({ ...newCard, card_name: e.target.value })} />
      <input placeholder="Slug (генерується автоматично)" value={newCard.slug} disabled />
      <input placeholder="Original URL" value={newCard.original_url} onChange={(e) => setNewCard({ ...newCard, original_url: e.target.value })} />
      <button onClick={handleCreateCard}>Створити картку</button>

      <h3>💳 Картки</h3>
      {users.map((user) => (
        <div key={user.id}>
          <div onClick={() => toggleExpand(user.id)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            📂 {user.first_name} {user.last_name}
          </div>
          {expandedUserIds.includes(user.id) && (
            <table border={1}>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Назва карти</th>
                  <th>URL</th>
                  <th>Original URL</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {cards.filter((c) => c.user_id === user.id).map((card, index) => (
                  <tr key={card.id}>
                    <td>{generateOrderNumber(index)}</td>
                    <td>{card.card_name}</td>
                    <td><a href={card.url} target="_blank" rel="noopener noreferrer">{card.url}</a></td>
                    <td><a href={card.original_url} target="_blank" rel="noopener noreferrer">{card.original_url}</a></td>
                    <td>
                      <button className={styles.button} onClick={() => handleEditOriginalURL(card.id, card.original_url)}>Edit</button>
                      <button className={`${styles.button} ${styles.delete}`} onClick={() => handleDeleteCard(card.id)}>Delete</button>
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
