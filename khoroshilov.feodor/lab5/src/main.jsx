import React, {useEffect, useMemo, useState} from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

function FilterPanel({
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
  dateFilter,
  setDateFilter,
  allTags,
}) {
  return (
    <div className="filter-panel">
      <h3>Поиск и фильтры</h3>

      <input
        type="text"
        placeholder="Поиск по тексту..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <label>Группа (Тег):</label>
      <select
        value={selectedTag}
        onChange={(e) => setSelectedTag(e.target.value)}
      >
        <option value="all">Все группы</option>
        {allTags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>

      <label>Дата:</label>
      <select
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
      >
        <option value="all">Все время</option>
        <option value="today">Сегодня</option>
        <option value="week">За последнюю неделю</option>
      </select>
    </div>
  );
}

function NoteForm({onSave, editingNote, onCancelEdit}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setTagsInput(editingNote.tags.join(', '));
    } else {
      setTitle('');
      setContent('');
      setTagsInput('');
    }
  }, [editingNote]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t);
    onSave({title, content, tags});
    if (!editingNote) {
      setTitle('');
      setContent('');
      setTagsInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="note-form">
      <h3>{editingNote ? 'Редактировать' : 'Новая заметка'}</h3>

      <input
        type="text"
        placeholder="Заголовок"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        data-testid="note-title"
        required
      />

      <textarea
        placeholder="Текст заметки..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        data-testid="note-content"
      />

      <input
        type="text"
        placeholder="Теги (через запятую)"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
        data-testid="note-tags"
      />

      <div className="form-buttons">
        <button
          type="submit"
          data-testid={editingNote ? 'note-save' : 'note-add'}
        >
          {editingNote ? 'Сохранить' : 'Добавить'}
        </button>
        {editingNote && (
          <button type="button" onClick={onCancelEdit} className="btn-cancel">
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}

function NoteCard({note, onDelete, onEdit}) {
  const formattedDate = new Date(note.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="note-card">
      <h4 data-testid="note-title">{note.title}</h4>
      <p>{note.content}</p>

      <div className="tags">
        {note.tags.map((tag) => (
          <span key={tag} className="tag">
            #{tag}
          </span>
        ))}
      </div>

      <div className="date">{formattedDate}</div>

      <div className="card-buttons">
        <button onClick={() => onEdit(note)} className="btn-edit">
          Изм.
        </button>
        <button onClick={() => onDelete(note.id)} className="btn-delete">
          Удал.
        </button>
      </div>
    </div>
  );
}

function NoteList({notes, onDelete, onEdit}) {
  if (notes.length === 0) {
    return <p className="empty">Заметки не найдены. Создайте первую!</p>;
  }

  return (
    <div className="notes-grid">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

function App() {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Изучить React',
      content: 'Прочитать про хуки и компоненты.',
      tags: ['учеба', 'код'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Купить продукты',
      content: 'Молоко, хлеб, яблоки.',
      tags: ['дом', 'покупки'],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [editingNote, setEditingNote] = useState(null);

  const allTags = useMemo(() => {
    const tagsSet = new Set();
    notes.forEach((note) => note.tags.forEach((tag) => tagsSet.add(tag)));
    return Array.from(tagsSet);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag =
        selectedTag === 'all' || note.tags.includes(selectedTag);

      let matchesDate = true;
      const noteDate = new Date(note.createdAt);
      const now = new Date();

      if (dateFilter === 'today') {
        matchesDate = noteDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = noteDate >= weekAgo;
      }

      return matchesSearch && matchesTag && matchesDate;
    });
  }, [notes, searchQuery, selectedTag, dateFilter]);

  const handleSaveNote = (noteData) => {
    if (editingNote) {
      setNotes(
        notes.map((n) =>
          n.id === editingNote.id
            ? {
                ...noteData,
                id: editingNote.id,
                createdAt: editingNote.createdAt,
              }
            : n,
        ),
      );
      setEditingNote(null);
    } else {
      const newNote = {
        ...noteData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      };
      setNotes([newNote, ...notes]);
    }
  };

  const handleDeleteNote = (id) => {
    if (window.confirm('Удалить заметку?')) {
      setNotes(notes.filter((n) => n.id !== id));
      if (editingNote?.id === id) {
        setEditingNote(null);
      }
    }
  };

  return (
    <div className="app" data-testid="app">
      <div className="sidebar">
        <FilterPanel
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          allTags={allTags}
        />
        <NoteForm
          onSave={handleSaveNote}
          editingNote={editingNote}
          onCancelEdit={() => setEditingNote(null)}
        />
      </div>

      <div className="main-content">
        <h2>Заметки ({filteredNotes.length})</h2>
        <NoteList
          notes={filteredNotes}
          onDelete={handleDeleteNote}
          onEdit={setEditingNote}
        />
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
