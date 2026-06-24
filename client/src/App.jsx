import { useEffect, useState } from "react";
import axios from "axios";
import {
  BookOpen, Users, Library, TrendingUp, Search, Plus, Trash2, Edit3,
  X, Check, AlertCircle, Star, Calendar, User, Mail, Phone, MapPin,
  ChevronDown, Filter, LayoutDashboard, Book, RefreshCw, MoreVertical,
  Clock, Award, BarChart3, Activity, Layers, ArrowUpRight, ArrowDownRight,
  LogOut, Settings, Menu, Moon, Sun, History, AlertTriangle, TrendingUpIcon,
  FileText, BookX, BookCheck, UserCheck, DollarSign
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import "./App.css";

const API = "https://library-management-backend-1-286w.onrender.com/api";

// ─── localStorage Helpers ───
const STORAGE_KEYS = {
  books: 'lib_books',
  members: 'lib_members',
  transactions: 'lib_transactions',
  overdue: 'lib_overdue',
  stats: 'lib_stats',
};

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

function loadFromStorage(key, maxAge = 24 * 60 * 60 * 1000) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.data) return null;
    // Optional: check if data is too old
    if (Date.now() - parsed.timestamp > maxAge) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
    return null;
  }
}

function clearStorage() {
  Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
}

// ─── Toast Component ───
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = { success: <Check size={18} />, error: <AlertCircle size={18} />, info: <Activity size={18} /> };
  return (
    <div className={`toast toast-${type} animate-fade-in`}>
      {icons[type] || icons.info}
      <span>{message}</span>
    </div>
  );
}

// ─── Confirm Dialog ───
function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <AlertCircle size={20} className="text-danger" />
          <h3>{title}</h3>
        </div>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ───
function StatCard({ title, value, icon, trend, color, delay }) {
  return (
    <div className="stat-card animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div className={`stat-icon stat-icon-${color}`}>{icon}</div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
        {trend && (
          <span className={`stat-trend ${trend > 0 ? "up" : "down"}`}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard ───
function Dashboard({ stats }) {
  const genreData = stats?.genreStats?.map(g => ({ name: g._id, value: g.count })) || [];
  const COLORS = ["#e94560", "#0f3460", "#533483", "#f4d03f", "#4ecca3", "#3498db", "#e74c3c", "#9b59b6"];

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <StatCard title="Total Books" value={stats.totalBooks || 0} icon={<BookOpen size={24} />} color="primary" delay={0} />
        <StatCard title="Available" value={stats.availableBooks || 0} icon={<Check size={24} />} color="success" delay={100} />
        <StatCard title="Issued" value={stats.issuedBooks || 0} icon={<LogOut size={24} />} color="warning" delay={200} />
        <StatCard title="Members" value={stats.totalMembers || 0} icon={<Users size={24} />} color="info" delay={300} />
      </div>

      <div className="charts-grid">
        <div className="chart-card animate-fade-in" style={{ animationDelay: "400ms" }}>
          <h3 className="chart-title"><BarChart3 size={18} /> Genre Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={genreData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                {genreData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#16213e", border: "1px solid #2a2a4a", borderRadius: 8, color: "#a0a0b8" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            {genreData.slice(0, 5).map((g, i) => (
              <span key={i} className="legend-item"><span className="legend-dot" style={{ background: COLORS[i % COLORS.length] }} />{g.name}</span>
            ))}
          </div>
        </div>

        <div className="chart-card animate-fade-in" style={{ animationDelay: "500ms" }}>
          <h3 className="chart-title"><Activity size={18} /> Recent Activity</h3>
          <div className="recent-list">
            {stats?.recentBooks?.length > 0 ? stats.recentBooks.map((book, i) => (
              <div key={book._id || i} className="recent-item animate-slide-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="recent-icon"><Book size={16} /></div>
                <div className="recent-info">
                  <p className="recent-title">{book.title}</p>
                  <p className="recent-meta">by {book.author} · {book.genre || "General"}</p>
                </div>
                <span className={`status-badge status-${book.status}`}>{book.status}</span>
              </div>
            )) : <p className="empty-text">No recent books added</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Book Form Modal ───
function BookForm({ book, onSave, onClose }) {
  const [form, setForm] = useState(book || {
    title: "", author: "", isbn: "", genre: "General", publishYear: "",
    description: "", coverImage: "", rating: 0, totalCopies: 1, availableCopies: 1
  });
  const genres = ["General", "Fiction", "Non-Fiction", "Science", "Technology", "History", "Philosophy", "Art", "Biography", "Mystery", "Romance", "Fantasy"];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal book-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{book ? "Edit Book" : "Add New Book"}</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Enter book title" required />
            </div>
            <div className="form-group">
              <label>Author *</label>
              <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} placeholder="Enter author name" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>ISBN</label>
              <input value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} placeholder="ISBN number" />
            </div>
            <div className="form-group">
              <label>Genre</label>
              <select value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })}>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Publish Year</label>
              <input type="number" value={form.publishYear} onChange={e => setForm({ ...form, publishYear: e.target.value })} placeholder="e.g. 2023" />
            </div>
            <div className="form-group">
              <label>Rating (0-5)</label>
              <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Total Copies</label>
              <input type="number" min="1" value={form.totalCopies} onChange={e => setForm({ ...form, totalCopies: parseInt(e.target.value) || 1 })} />
            </div>
            <div className="form-group">
              <label>Cover Image URL</label>
              <input value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Brief description..." />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">{book ? "Update Book" : "Add Book"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Issue Book Modal ───
function IssueModal({ book, onIssue, onClose }) {
  const [memberName, setMemberName] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onIssue(book._id, memberName, dueDate);
  };

  // Default due date: 14 days from now
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setDueDate(d.toISOString().split("T")[0]);
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Issue Book</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="issue-book-info">
          <p className="issue-book-title">{book.title}</p>
          <p className="issue-book-author">by {book.author}</p>
        </div>
        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-group">
            <label>Member Name *</label>
            <input value={memberName} onChange={e => setMemberName(e.target.value)} placeholder="Enter member name" required />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Issue Book</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Books Section ───
function BooksSection({ onToast }) {
  const [books, setBooks] = useState(() => loadFromStorage(STORAGE_KEYS.books) || []);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("addedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [issuingBook, setIssuingBook] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const genres = ["All", "General", "Fiction", "Non-Fiction", "Science", "Technology", "History", "Philosophy", "Art", "Biography", "Mystery", "Romance", "Fantasy"];
  const statuses = ["All", "available", "issued", "reserved", "damaged", "lost"];

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (genreFilter !== "All") params.append("genre", genreFilter);
      if (statusFilter !== "All") params.append("status", statusFilter);
      params.append("sortBy", sortBy);
      params.append("order", sortOrder);
      const res = await axios.get(`${API}/books?${params}`);
      setBooks(res.data);
      saveToStorage(STORAGE_KEYS.books, res.data);
    } catch (err) {
      onToast("Failed to load books", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, [search, genreFilter, statusFilter, sortBy, sortOrder]);

  const handleSave = async (form) => {
    try {
      if (editingBook) {
        await axios.put(`${API}/books/${editingBook._id}`, form);
        onToast("Book updated successfully!", "success");
      } else {
        await axios.post(`${API}/books`, form);
        onToast("Book added successfully!", "success");
      }
      setShowForm(false);
      setEditingBook(null);
      fetchBooks();
    } catch (err) {
      onToast(err.response?.data?.message || "Operation failed", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/books/${id}`);
      onToast("Book deleted successfully!", "success");
      setDeleteConfirm(null);
      fetchBooks();
    } catch (err) {
      onToast("Failed to delete book", "error");
    }
  };

  const handleIssue = async (id, memberName, dueDate) => {
    try {
      const res = await axios.put(`${API}/books/issue/${id}`, { issuedTo: memberName, dueDate });
      onToast(`Book issued to ${memberName}!`, "success");
      setIssuingBook(null);
      fetchBooks();
    } catch (err) {
      console.error("Issue book error:", err);
      onToast(err.response?.data?.message || "Failed to issue book", "error");
    }
  };

  const handleReturn = async (id) => {
    try {
      await axios.put(`${API}/books/return/${id}`);
      onToast("Book returned successfully!", "success");
      fetchBooks();
    } catch (err) {
      onToast("Failed to return book", "error");
    }
  };

  const getCoverImage = (book) => {
    if (book.coverImage) return book.coverImage;
    // Generate a gradient-based placeholder
    const colors = ["#e94560", "#0f3460", "#533483", "#f4d03f", "#4ecca3", "#3498db"];
    const color = colors[book.title.length % colors.length];
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='180'%3E%3Crect fill='${encodeURIComponent(color)}' width='120' height='180'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='40' font-family='sans-serif'%3E📚%3C/text%3E%3C/svg%3E`;
  };

  return (
    <div className="section books-section">
      <div className="section-header">
        <div className="section-title-group">
          <h2><BookOpen size={24} /> Books</h2>
          <p className="section-subtitle">Manage your library collection</p>
        </div>
        <button className="btn-primary btn-glow" onClick={() => { setEditingBook(null); setShowForm(true); }}>
          <Plus size={18} /> Add Book
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, author, or ISBN..." />
        </div>
        <div className="filter-group">
          <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)}>
            {genres.map(g => <option key={g} value={g}>{g === "All" ? "All Genres" : g}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {statuses.map(s => <option key={s} value={s}>{s === "All" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="addedAt">Date Added</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="rating">Rating</option>
            <option value="publishYear">Year</option>
          </select>
          <button className="btn-icon sort-toggle" onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")}>
            {sortOrder === "asc" ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="book-card-skeleton" />)}
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <Library size={64} className="empty-icon" />
          <h3>No books found</h3>
          <p>Try adjusting your filters or add a new book</p>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book, i) => (
            <div key={book._id} className="book-card animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="book-cover-wrapper">
                <img src={getCoverImage(book)} alt={book.title} className="book-cover" />
                <div className="book-cover-overlay">
                  <button className="overlay-btn" onClick={() => { setEditingBook(book); setShowForm(true); }} title="Edit">
                    <Edit3 size={16} />
                  </button>
                  <button className="overlay-btn overlay-btn-danger" onClick={() => setDeleteConfirm(book)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
                <span className={`book-status status-${book.status}`}>{book.status}</span>
              </div>
              <div className="book-info">
                <h4 className="book-title" title={book.title}>{book.title}</h4>
                <p className="book-author">{book.author}</p>
                <div className="book-meta">
                  <span className="book-genre">{book.genre || "General"}</span>
                  {book.publishYear && <span className="book-year">{book.publishYear}</span>}
                </div>
                <div className="book-rating">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} className={s <= Math.round(book.rating) ? "star-filled" : "star-empty"} />
                  ))}
                  <span>{book.rating || 0}</span>
                </div>
                {book.status === "available" ? (
                  <button className="btn-action btn-issue" onClick={() => setIssuingBook(book)}>
                    <LogOut size={14} /> Issue
                  </button>
                ) : (
                  <div className="issued-info">
                    <p><User size={12} /> {book.issuedTo}</p>
                    {book.dueDate && (
                      <p><Clock size={12} /> Due: {new Date(book.dueDate).toLocaleDateString()}</p>
                    )}
                    <button className="btn-action btn-return" onClick={() => handleReturn(book._id)}>
                      <Check size={14} /> Return
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <BookForm book={editingBook} onSave={handleSave} onClose={() => { setShowForm(false); setEditingBook(null); }} />}
      {issuingBook && <IssueModal book={issuingBook} onIssue={handleIssue} onClose={() => setIssuingBook(null)} />}
      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Book"
          message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
          onConfirm={() => handleDelete(deleteConfirm._id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

// ─── Member Form Modal ───
function MemberForm({ member, onSave, onClose }) {
  const [form, setForm] = useState(member || { name: "", email: "", phone: "", address: "", membershipStatus: "active" });
  const statuses = ["active", "inactive", "suspended", "expired"];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{member ? "Edit Member" : "Add New Member"}</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.membershipStatus} onChange={e => setForm({ ...form, membershipStatus: e.target.value })}>
                {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} placeholder="Address..." />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">{member ? "Update Member" : "Add Member"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Members Section ───
function MembersSection({ onToast }) {
  const [members, setMembers] = useState(() => loadFromStorage(STORAGE_KEYS.members) || []);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [stats, setStats] = useState({});

  const statuses = ["All", "active", "inactive", "suspended", "expired"];

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "All") params.append("status", statusFilter);
      const res = await axios.get(`${API}/members?${params}`);
      setMembers(res.data);
      saveToStorage(STORAGE_KEYS.members, res.data);
      const statsRes = await axios.get(`${API}/members/stats/overview`);
      setStats(statsRes.data);
    } catch (err) {
      onToast("Failed to load members", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, [search, statusFilter]);

  const handleSave = async (form) => {
    try {
      if (editingMember) {
        await axios.put(`${API}/members/${editingMember._id}`, form);
        onToast("Member updated successfully!", "success");
      } else {
        await axios.post(`${API}/members`, form);
        onToast("Member added successfully!", "success");
      }
      setShowForm(false);
      setEditingMember(null);
      fetchMembers();
    } catch (err) {
      onToast(err.response?.data?.message || "Operation failed", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/members/${id}`);
      onToast("Member deleted successfully!", "success");
      setDeleteConfirm(null);
      fetchMembers();
    } catch (err) {
      onToast("Failed to delete member", "error");
    }
  };

  const statusColors = { active: "#4ecca3", inactive: "#6b6b8f", suspended: "#e74c3c", expired: "#f4d03f" };

  return (
    <div className="section members-section">
      <div className="section-header">
        <div className="section-title-group">
          <h2><Users size={24} /> Members</h2>
          <p className="section-subtitle">Manage library members</p>
        </div>
        <button className="btn-primary btn-glow" onClick={() => { setEditingMember(null); setShowForm(true); }}>
          <Plus size={18} /> Add Member
        </button>
      </div>

      <div className="stats-grid small">
        <StatCard title="Total" value={stats.total || 0} icon={<Users size={20} />} color="primary" delay={0} />
        <StatCard title="Active" value={stats.active || 0} icon={<Check size={20} />} color="success" delay={100} />
        <StatCard title="Inactive" value={stats.inactive || 0} icon={<X size={20} />} color="muted" delay={200} />
        <StatCard title="Suspended" value={stats.suspended || 0} icon={<AlertCircle size={20} />} color="danger" delay={300} />
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {statuses.map(s => <option key={s} value={s}>{s === "All" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-list">
          {[1,2,3,4,5].map(i => <div key={i} className="member-row-skeleton" />)}
        </div>
      ) : members.length === 0 ? (
        <div className="empty-state">
          <Users size={64} className="empty-icon" />
          <h3>No members found</h3>
          <p>Add members to your library</p>
        </div>
      ) : (
        <div className="members-list">
          {members.map((member, i) => (
            <div key={member._id} className="member-row animate-slide-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="member-avatar">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="member-info">
                <h4>{member.name}</h4>
                <p><Mail size={12} /> {member.email}</p>
                {member.phone && <p><Phone size={12} /> {member.phone}</p>}
              </div>
              <div className="member-meta">
                <span className={`member-status status-${member.membershipStatus}`}>{member.membershipStatus}</span>
                <span className="member-date"><Calendar size={12} /> {new Date(member.joinDate).toLocaleDateString()}</span>
              </div>
              <div className="member-actions">
                <button className="btn-icon-action" onClick={() => { setEditingMember(member); setShowForm(true); }} title="Edit">
                  <Edit3 size={16} />
                </button>
                <button className="btn-icon-action btn-icon-danger" onClick={() => setDeleteConfirm(member)} title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <MemberForm member={editingMember} onSave={handleSave} onClose={() => { setShowForm(false); setEditingMember(null); }} />}
      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Member"
          message={`Are you sure you want to delete "${deleteConfirm.name}"?`}
          onConfirm={() => handleDelete(deleteConfirm._id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

// ─── Transaction Detail Modal ───
function TransactionDetailModal({ transaction, onClose, onReturn }) {
  if (!transaction) return null;
  
  const isOverdue = transaction.status === "active" && transaction.dueDate && new Date(transaction.dueDate) < new Date();
  const daysOverdue = isOverdue ? Math.floor((new Date() - new Date(transaction.dueDate)) / (1000 * 60 * 60 * 24)) : 0;
  const fine = daysOverdue > 0 ? daysOverdue * 2 : 0;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal transaction-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><FileText size={20} /> Transaction Details</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="transaction-detail-content">
          <div className="detail-section">
            <h4><BookOpen size={16} /> Book Information</h4>
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-label">Title</span><span className="detail-value">{transaction.bookTitle}</span></div>
              <div className="detail-item"><span className="detail-label">ISBN</span><span className="detail-value">{transaction.bookIsbn || "N/A"}</span></div>
            </div>
          </div>
          <div className="detail-section">
            <h4><User size={16} /> Member Information</h4>
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-label">Name</span><span className="detail-value">{transaction.memberName}</span></div>
              <div className="detail-item"><span className="detail-label">Email</span><span className="detail-value">{transaction.memberEmail || "N/A"}</span></div>
            </div>
          </div>
          <div className="detail-section">
            <h4><Clock size={16} /> Timeline</h4>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot timeline-issue" />
                <div className="timeline-content">
                  <p className="timeline-title">Book Issued</p>
                  <p className="timeline-date">{transaction.issueDate ? new Date(transaction.issueDate).toLocaleString() : new Date(transaction.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {transaction.dueDate && (
                <div className="timeline-item">
                  <div className={`timeline-dot ${isOverdue ? "timeline-overdue" : "timeline-due"}`} />
                  <div className="timeline-content">
                    <p className="timeline-title">Due Date</p>
                    <p className="timeline-date">{new Date(transaction.dueDate).toLocaleDateString()}</p>
                    {isOverdue && <p className="timeline-overdue-text">{daysOverdue} days overdue</p>}
                  </div>
                </div>
              )}
              {transaction.returnDate && (
                <div className="timeline-item">
                  <div className="timeline-dot timeline-return" />
                  <div className="timeline-content">
                    <p className="timeline-title">Book Returned</p>
                    <p className="timeline-date">{new Date(transaction.returnDate).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="detail-section">
            <h4><Activity size={16} /> Status</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Current Status</span>
                <span className={`detail-value status-badge status-${transaction.status}`}>{transaction.status}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Action</span>
                <span className="detail-value">{transaction.action}</span>
              </div>
              {fine > 0 && (
                <div className="detail-item">
                  <span className="detail-label">Fine Amount</span>
                  <span className="detail-value fine-amount">${fine.toFixed(2)}</span>
                </div>
              )}
              {transaction.notes && (
                <div className="detail-item full-width">
                  <span className="detail-label">Notes</span>
                  <span className="detail-value">{transaction.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          {transaction.status === "active" && (
            <button className="btn-primary" onClick={() => { onReturn(transaction._id); onClose(); }}>
              <BookCheck size={16} /> Mark as Returned
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Transactions Section ───
function TransactionsSection({ onToast }) {
  const [transactions, setTransactions] = useState(() => loadFromStorage(STORAGE_KEYS.transactions) || []);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [stats, setStats] = useState({});
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [dateRange, setDateRange] = useState("all"); // all, today, week, month

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (actionFilter !== "All") params.append("action", actionFilter);
      const res = await axios.get(`${API}/transactions?${params}`);
      
      // Filter by date range on client side
      let data = res.data;
      const now = new Date();
      if (dateRange === "today") {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        data = data.filter(t => new Date(t.createdAt) >= startOfDay);
      } else if (dateRange === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        data = data.filter(t => new Date(t.createdAt) >= weekAgo);
      } else if (dateRange === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        data = data.filter(t => new Date(t.createdAt) >= monthAgo);
      }
      
      setTransactions(data);
      saveToStorage(STORAGE_KEYS.transactions, data);
      
      // Fetch stats
      const statsRes = await axios.get(`${API}/transactions/stats/overview`);
      setStats(statsRes.data);
    } catch (err) {
      onToast("Failed to load transactions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, [search, statusFilter, actionFilter, dateRange]);

  const handleReturn = async (id) => {
    try {
      await axios.put(`${API}/transactions/return/${id}`);
      onToast("Book returned successfully!", "success");
      fetchTransactions();
    } catch (err) {
      onToast("Failed to return book", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/transactions/${id}`);
      onToast("Transaction deleted", "success");
      setDeleteConfirm(null);
      fetchTransactions();
    } catch (err) {
      onToast("Failed to delete transaction", "error");
    }
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="section transactions-section">
      <div className="section-header">
        <div className="section-title-group">
          <h2><History size={24} /> Transactions</h2>
          <p className="section-subtitle">Track book issues and returns</p>
        </div>
      </div>

      <div className="stats-grid small">
        <StatCard title="Total" value={stats.total || 0} icon={<History size={20} />} color="primary" delay={0} />
        <StatCard title="Active" value={stats.active || 0} icon={<BookOpen size={20} />} color="warning" delay={100} />
        <StatCard title="Returned" value={stats.returned || 0} icon={<BookCheck size={20} />} color="success" delay={200} />
        <StatCard title="Overdue" value={stats.overdue || 0} icon={<AlertTriangle size={20} />} color="danger" delay={300} />
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by book or member..." />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="returned">Returned</option>
          <option value="overdue">Overdue</option>
        </select>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          <option value="All">All Actions</option>
          <option value="issue">Issue</option>
          <option value="return">Return</option>
        </select>
        <select value={dateRange} onChange={e => setDateRange(e.target.value)}>
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-list">
          {[1,2,3,4,5].map(i => <div key={i} className="transaction-row-skeleton" />)}
        </div>
      ) : transactions.length === 0 ? (
        <div className="empty-state">
          <History size={64} className="empty-icon" />
          <h3>No transactions found</h3>
          <p>Transactions will appear when books are issued or returned</p>
        </div>
      ) : (
        <div className="transactions-list">
          {transactions.map((t, i) => {
            const daysRemaining = getDaysRemaining(t.dueDate);
            const isOverdue = t.status === "active" && daysRemaining !== null && daysRemaining < 0;
            
            return (
              <div key={t._id} className={`transaction-row animate-slide-in status-${t.status}`} style={{ animationDelay: `${i * 50}ms` }}>
                <div className="transaction-icon">
                  {t.action === "issue" ? <BookOpen size={20} /> : <BookCheck size={20} />}
                </div>
                <div className="transaction-info">
                  <h4>{t.bookTitle}</h4>
                  <p><User size={12} /> {t.memberName}</p>
                  <p><Mail size={12} /> {t.memberEmail}</p>
                </div>
                <div className="transaction-meta">
                  <span className={`transaction-status status-${t.status}`}>{t.status}</span>
                  <span className="transaction-action">{t.action}</span>
                  <span className="transaction-date"><Calendar size={12} /> {new Date(t.createdAt).toLocaleDateString()}</span>
                  {t.dueDate && (
                    <span className={`transaction-due ${isOverdue ? "overdue" : ""}`}>
                      <Clock size={12} /> 
                      {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : daysRemaining === 0 ? "Due today" : `${daysRemaining} days left`}
                    </span>
                  )}
                </div>
                <div className="transaction-actions">
                  <button className="btn-icon-action" onClick={() => setSelectedTransaction(t)} title="View Details">
                    <FileText size={16} />
                  </button>
                  {t.status === "active" && (
                    <button className="btn-icon-action btn-icon-success" onClick={() => handleReturn(t._id)} title="Return Book">
                      <BookCheck size={16} />
                    </button>
                  )}
                  <button className="btn-icon-action btn-icon-danger" onClick={() => setDeleteConfirm(t)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTransaction && (
        <TransactionDetailModal 
          transaction={selectedTransaction} 
          onClose={() => setSelectedTransaction(null)} 
          onReturn={handleReturn}
        />
      )}
      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Transaction"
          message={`Are you sure you want to delete this transaction for "${deleteConfirm.bookTitle}"?`}
          onConfirm={() => handleDelete(deleteConfirm._id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

// ─── Overdue Section ───
function OverdueSection({ onToast }) {
  const [overdue, setOverdue] = useState(() => loadFromStorage(STORAGE_KEYS.overdue) || []);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedOverdue, setSelectedOverdue] = useState(null);
  const [sortBy, setSortBy] = useState("daysOverdue"); // daysOverdue, fineAmount, issueDate

  const fetchOverdue = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/transactions/overdue`);
      const statsRes = await axios.get(`${API}/transactions/stats/overview`);
      
      // Enrich with calculated fields
      const now = new Date();
      const enriched = res.data.map(book => {
        const due = new Date(book.dueDate);
        const daysOverdue = Math.floor((now - due) / (1000 * 60 * 60 * 24));
        const fine = daysOverdue > 0 ? daysOverdue * 2 : 0;
        // Priority: critical (>14 days), high (7-14 days), medium (3-7 days), low (<3 days)
        let priority = "low";
        if (daysOverdue > 14) priority = "critical";
        else if (daysOverdue > 7) priority = "high";
        else if (daysOverdue > 3) priority = "medium";
        
        return { ...book, daysOverdue, fine, priority };
      });
      
      // Sort
      enriched.sort((a, b) => {
        if (sortBy === "daysOverdue") return b.daysOverdue - a.daysOverdue;
        if (sortBy === "fineAmount") return b.fine - a.fine;
        if (sortBy === "issueDate") return new Date(b.issueDate) - new Date(a.issueDate);
        return 0;
      });
      
      setOverdue(enriched);
      saveToStorage(STORAGE_KEYS.overdue, enriched);
      setStats(statsRes.data);
    } catch (err) {
      onToast("Failed to load overdue books", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOverdue(); }, [sortBy]);

  const handleReturn = async (id) => {
    try {
      await axios.put(`${API}/transactions/return/${id}`);
      onToast("Book returned successfully!", "success");
      fetchOverdue();
    } catch (err) {
      onToast("Failed to return book", "error");
    }
  };

  const totalFine = overdue.reduce((sum, b) => sum + b.fine, 0);
  const criticalCount = overdue.filter(b => b.priority === "critical").length;
  const highCount = overdue.filter(b => b.priority === "high").length;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical": return "#e74c3c";
      case "high": return "#e67e22";
      case "medium": return "#f4d03f";
      case "low": return "#3498db";
      default: return "#6b6b8f";
    }
  };

  return (
    <div className="section overdue-section">
      <div className="section-header">
        <div className="section-title-group">
          <h2><AlertTriangle size={24} /> Overdue Books</h2>
          <p className="section-subtitle">Books past their due date</p>
        </div>
      </div>

      <div className="stats-grid small">
        <StatCard title="Total Overdue" value={overdue.length} icon={<AlertTriangle size={20} />} color="danger" delay={0} />
        <StatCard title="Critical (>14d)" value={criticalCount} icon={<AlertCircle size={20} />} color="danger" delay={100} />
        <StatCard title="High (7-14d)" value={highCount} icon={<Clock size={20} />} color="warning" delay={200} />
        <StatCard title="Total Fines" value={`$${totalFine.toFixed(2)}`} icon={<DollarSign size={20} />} color="primary" delay={300} />
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <span className="overdue-summary-text">{overdue.length} overdue books with ${totalFine.toFixed(2)} in total fines</span>
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="daysOverdue">Sort by Days Overdue</option>
          <option value="fineAmount">Sort by Fine Amount</option>
          <option value="issueDate">Sort by Issue Date</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-list">
          {[1,2,3].map(i => <div key={i} className="overdue-row-skeleton" />)}
        </div>
      ) : overdue.length === 0 ? (
        <div className="empty-state">
          <BookCheck size={64} className="empty-icon" />
          <h3>No overdue books</h3>
          <p>All books are returned on time!</p>
        </div>
      ) : (
        <div className="overdue-list">
          {overdue.map((book, i) => (
            <div key={book._id} className="overdue-row animate-slide-in" style={{ animationDelay: `${i * 50}ms`, borderLeft: `4px solid ${getPriorityColor(book.priority)}` }}>
              <div className="overdue-icon">
                <BookX size={24} />
              </div>
              <div className="overdue-info">
                <h4>{book.bookTitle}</h4>
                <p><User size={12} /> {book.memberName}</p>
                <p><Mail size={12} /> {book.memberEmail}</p>
              </div>
              <div className="overdue-meta">
                <span className="overdue-status" style={{ background: getPriorityColor(book.priority) + "20", color: getPriorityColor(book.priority), border: `1px solid ${getPriorityColor(book.priority)}40` }}>
                  {book.priority.toUpperCase()}
                </span>
                <span className="overdue-days"><Clock size={12} /> {book.daysOverdue} days overdue</span>
                <span className="overdue-date"><Calendar size={12} /> Issued: {new Date(book.issueDate).toLocaleDateString()}</span>
                <span className="overdue-due"><Calendar size={12} /> Due: {new Date(book.dueDate).toLocaleDateString()}</span>
                <span className="overdue-fine"><DollarSign size={12} /> Fine: ${book.fine.toFixed(2)}</span>
              </div>
              <div className="overdue-actions">
                <button className="btn-icon-action" onClick={() => setSelectedOverdue(book)} title="View Details">
                  <FileText size={16} />
                </button>
                <button className="btn-icon-action btn-icon-success" onClick={() => handleReturn(book._id)} title="Return Book">
                  <BookCheck size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOverdue && (
        <TransactionDetailModal 
          transaction={selectedOverdue} 
          onClose={() => setSelectedOverdue(null)} 
          onReturn={handleReturn}
        />
      )}
    </div>
  );
}

// ─── Reports Section ───
function ReportsSection({ stats, onToast }) {
  const [reportType, setReportType] = useState("books");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      let res;
      switch (reportType) {
        case "books":
          res = await axios.get(`${API}/books`);
          setReportData(res.data);
          break;
        case "members":
          res = await axios.get(`${API}/members`);
          setReportData(res.data);
          break;
        case "transactions":
          res = await axios.get(`${API}/transactions`);
          setReportData(res.data);
          break;
        case "overdue":
          res = await axios.get(`${API}/transactions/overdue`);
          setReportData(res.data);
          break;
        default:
          break;
      }
    } catch (err) {
      onToast("Failed to generate report", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { generateReport(); }, [reportType]);

  const exportToCSV = () => {
    if (reportData.length === 0) return;
    
    let csv = "";
    if (reportType === "books") {
      csv = "Title,Author,ISBN,Genre,Status,Rating,Total Copies,Available Copies\n";
      reportData.forEach(b => {
        csv += `"${b.title}","${b.author}","${b.isbn || ''}","${b.genre}","${b.status}",${b.rating},${b.totalCopies},${b.availableCopies}\n`;
      });
    } else if (reportType === "members") {
      csv = "Name,Email,Phone,Status,Join Date\n";
      reportData.forEach(m => {
        csv += `"${m.name}","${m.email}","${m.phone || ''}","${m.membershipStatus}","${new Date(m.joinDate).toLocaleDateString()}"\n`;
      });
    } else if (reportType === "transactions" || reportType === "overdue") {
      csv = "Book Title,Member Name,Member Email,Action,Status,Issue Date,Due Date,Return Date\n";
      reportData.forEach(t => {
        csv += `"${t.bookTitle}","${t.memberName}","${t.memberEmail || ''}","${t.action}","${t.status}","${t.issueDate ? new Date(t.issueDate).toLocaleDateString() : ''}","${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ''}","${t.returnDate ? new Date(t.returnDate).toLocaleDateString() : ''}"\n`;
      });
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    onToast("Report exported successfully!", "success");
  };

  return (
    <div className="section reports-section">
      <div className="section-header">
        <div className="section-title-group">
          <h2><FileText size={24} /> Reports</h2>
          <p className="section-subtitle">Generate and export library reports</p>
        </div>
      </div>

      <div className="report-controls">
        <div className="report-type-selector">
          <button className={`report-type-btn ${reportType === "books" ? "active" : ""}`} onClick={() => setReportType("books")}>
            <BookOpen size={16} /> Books
          </button>
          <button className={`report-type-btn ${reportType === "members" ? "active" : ""}`} onClick={() => setReportType("members")}>
            <Users size={16} /> Members
          </button>
          <button className={`report-type-btn ${reportType === "transactions" ? "active" : ""}`} onClick={() => setReportType("transactions")}>
            <History size={16} /> Transactions
          </button>
          <button className={`report-type-btn ${reportType === "overdue" ? "active" : ""}`} onClick={() => setReportType("overdue")}>
            <AlertTriangle size={16} /> Overdue
          </button>
        </div>
        <button className="btn-primary" onClick={exportToCSV}>
          <FileText size={16} /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="loading-list">
          {[1,2,3].map(i => <div key={i} className="report-row-skeleton" />)}
        </div>
      ) : reportData.length === 0 ? (
        <div className="empty-state">
          <FileText size={64} className="empty-icon" />
          <h3>No data available</h3>
          <p>Select a report type to generate data</p>
        </div>
      ) : (
        <div className="report-summary">
          <div className="report-stats">
            <div className="report-stat">
              <span className="report-stat-value">{reportData.length}</span>
              <span className="report-stat-label">Total Records</span>
            </div>
            {reportType === "books" && (
              <>
                <div className="report-stat">
                  <span className="report-stat-value">{reportData.filter(b => b.status === "available").length}</span>
                  <span className="report-stat-label">Available</span>
                </div>
                <div className="report-stat">
                  <span className="report-stat-value">{reportData.filter(b => b.status === "issued").length}</span>
                  <span className="report-stat-label">Issued</span>
                </div>
              </>
            )}
            {reportType === "members" && (
              <>
                <div className="report-stat">
                  <span className="report-stat-value">{reportData.filter(m => m.membershipStatus === "active").length}</span>
                  <span className="report-stat-label">Active</span>
                </div>
                <div className="report-stat">
                  <span className="report-stat-value">{reportData.filter(m => m.membershipStatus === "inactive").length}</span>
                  <span className="report-stat-label">Inactive</span>
                </div>
              </>
            )}
          </div>
          <div className="report-preview">
            <h3>Report Preview</h3>
            <div className="report-table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    {reportType === "books" && (
                      <><th>Title</th><th>Author</th><th>Genre</th><th>Status</th><th>Rating</th></>
                    )}
                    {reportType === "members" && (
                      <><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Join Date</th></>
                    )}
                    {(reportType === "transactions" || reportType === "overdue") && (
                      <><th>Book</th><th>Member</th><th>Action</th><th>Status</th><th>Date</th></>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportData.slice(0, 10).map((item, i) => (
                    <tr key={item._id || i}>
                      {reportType === "books" && (
                        <><td>{item.title}</td><td>{item.author}</td><td>{item.genre}</td><td>{item.status}</td><td>{item.rating}</td></>
                      )}
                      {reportType === "members" && (
                        <><td>{item.name}</td><td>{item.email}</td><td>{item.phone || "-"}</td><td>{item.membershipStatus}</td><td>{new Date(item.joinDate).toLocaleDateString()}</td></>
                      )}
                      {(reportType === "transactions" || reportType === "overdue") && (
                        <><td>{item.bookTitle}</td><td>{item.memberName}</td><td>{item.action}</td><td>{item.status}</td><td>{new Date(item.createdAt).toLocaleDateString()}</td></>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ───
function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(() => loadFromStorage(STORAGE_KEYS.stats) || {});
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/books/stats/overview`);
      setStats(res.data);
      saveToStorage(STORAGE_KEYS.stats, res.data);
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "books", label: "Books", icon: <BookOpen size={20} /> },
    { id: "members", label: "Members", icon: <Users size={20} /> },
    { id: "transactions", label: "Transactions", icon: <History size={20} /> },
    { id: "overdue", label: "Overdue", icon: <AlertTriangle size={20} /> },
    { id: "reports", label: "Reports", icon: <FileText size={20} /> },
  ];

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Library size={28} className="logo-icon" />
            <span className="logo-text">LibraTech</span>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {activeTab === tab.id && <div className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="footer-card">
            <Award size={20} className="footer-icon" />
            <div>
              <p className="footer-title">Pro Library</p>
              <p className="footer-sub">v2.0</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="breadcrumb">
            <h1>{tabs.find(t => t.id === activeTab)?.label}</h1>
          </div>
          <div className="top-actions">
            <button className="btn-icon top-btn" onClick={fetchStats} title="Refresh">
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        <div className="content-area">
          {activeTab === "dashboard" && <Dashboard stats={stats} />}
          {activeTab === "books" && <BooksSection onToast={addToast} />}
          {activeTab === "members" && <MembersSection onToast={addToast} />}
          {activeTab === "transactions" && <TransactionsSection onToast={addToast} />}
          {activeTab === "overdue" && <OverdueSection onToast={addToast} />}
          {activeTab === "reports" && <ReportsSection stats={stats} onToast={addToast} />}
        </div>
      </main>

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </div>
  );
}

export default App;
