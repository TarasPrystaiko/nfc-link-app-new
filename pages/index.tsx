import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import React from 'react';


export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [slug, setSlug] = useState('');
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    const syncUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error('❌ Не авторизовано або помилка:', error);
        router.push('/login');
        return;
      }

      setUser(user);

      // Вставити юзера в таблицю (якщо ще немає)
      await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
      });

      fetchUserSlug(user.id);
      fetchLinks(user.id);
    };

    syncUser();
  }, []);

  const fetchUserSlug = async (userId: string) => {
    const { data } = await supabase.from('users').select('slug').eq('id', userId).single();
    if (data?.slug) setSlug(data.slug);
  };

  const fetchLinks = async (userId: string) => {
    const { data } = await supabase.from('links').select('*').eq('user_id', userId);
    setLinks(data || []);
  };

  const handleSaveSlug = async () => {
    if (!user) return;
    const { error } = await supabase.from('users').update({ slug }).eq('id', user.id);
    if (error) alert('❌ Не вдалося зберегти slug');
    else alert('✅ Slug збережено!');
  };

  const handleAddLink = async () => {
    if (!user || !label || !url) return;

    const { error } = await supabase.from('links').insert({
      user_id: user.id,
      label,
      url,
    });

    if (error) alert('❌ Не вдалося додати посилання');
    else {
      alert('✅ Посилання додано!');
      setLabel('');
      setUrl('');
      fetchLinks(user.id);
    }
  };

  const handleUpdateLink = async (id: number, newLabel: string, newUrl: string) => {
    await supabase.from('links').update({ label: newLabel, url: newUrl }).eq('id', id);
    fetchLinks(user.id);
  };

  const handleDeleteLink = async (id: number) => {
    await supabase.from('links').delete().eq('id', id);
    fetchLinks(user.id);
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🎛️ Панель користувача</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Slug (унікальна урла)"
          className="border px-3 py-2 rounded mr-2"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <button onClick={handleSaveSlug} className="bg-blue-600 text-white px-4 py-2 rounded">
          Зберегти slug
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Назва"
          className="border px-2 py-1 mr-2 rounded"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <input
          type="url"
          placeholder="URL"
          className="border px-2 py-1 mr-2 rounded"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={handleAddLink} className="bg-green-600 text-white px-4 py-1 rounded">
          Додати
        </button>
      </div>

      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.id} className="bg-white p-4 rounded shadow">
            <input
              className="border px-2 py-1 w-1/3 mr-2"
              defaultValue={link.label}
              onBlur={(e) => handleUpdateLink(link.id, e.target.value, link.url)}
            />
            <input
              className="border px-2 py-1 w-1/2 mr-2"
              defaultValue={link.url}
              onBlur={(e) => handleUpdateLink(link.id, link.label, e.target.value)}
            />
            <button onClick={() => handleDeleteLink(link.id)} className="text-red-600">
              ✖
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
