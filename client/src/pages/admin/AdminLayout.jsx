import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/index_hooks';
import LoadingSpinner from '../../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!loading) {
       if (!user || user.role !== 'admin') {
           navigate('/');
           toast.error('Not authorized as an admin');
       }
    }
  }, [user, loading, navigate]);

  if (loading || !user) return <LoadingSpinner text="Checking credentials..." />;

  const renderTab = () => {
      switch(activeTab) {
          case 'dashboard': return <AdminDashboard />;
          case 'books': return <AdminBooks />;
          case 'orders': return <AdminOrders />;
          case 'users': return <AdminUsers />;
          case 'analytics': return <AdminAnalytics />;
          default: return <AdminDashboard />;
      }
  };

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div style={{ width: '250px', flexShrink: 0, position: 'sticky', top: '100px' }}>
            <div className="wood-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <h1 className="sec-title" style={{ fontSize: '24px', marginBottom: '24px' }}>Shop <em>Admin</em></h1>
                <div className="flex-col" style={{ gap: '8px' }}>
                   {[
                       { id: 'dashboard', icon: '📊', label: 'Dashboard' },
                       { id: 'books', icon: '📚', label: 'Inventory' },
                       { id: 'orders', icon: '📦', label: 'Orders' },
                       { id: 'users', icon: '👥', label: 'Users' },
                       { id: 'analytics', icon: '📈', label: 'Analytics' },
                   ].map(tab => (
                       <button 
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id)}
                           className={`flex-center`}
                           style={{ 
                               justifyContent: 'flex-start', padding: '14px 18px', borderRadius: 'var(--radius-md)', 
                               width: '100%', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                               background: activeTab === tab.id ? 'var(--forest)' : 'var(--interior)',
                               color: activeTab === tab.id ? 'white' : 'var(--text-med)',
                               fontWeight: 800, fontSize: '14px'
                           }}
                       >
                           <span style={{ fontSize: '18px', marginRight: '12px' }}>{tab.icon}</span> {tab.label}
                       </button>
                   ))}
                </div>
            </div>
        </div>

        {/* Dynamic Content Pane */}
        <div style={{ flex: 1 }} className="clay-card">
            {renderTab()}
        </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

function AdminDashboard() {
    return (
        <div>
            <h2 className="sec-title" style={{ fontSize: '32px', marginBottom: '40px' }}>Dashboard <em>Overview</em></h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '48px' }}>
                {[
                    { label: "Today's Revenue", value: "₹24.5k", color: 'var(--mint)' },
                    { label: "Orders Today", value: "32", color: 'var(--forest-glow)' },
                    { label: "Active Users", value: "1.2k", color: 'var(--gold)' },
                    { label: "Low Stock", value: "18", color: 'var(--terra)' },
                ].map((stat, i) => (
                    <div key={i} className="wood-panel" style={{ padding: '24px', textAlign: 'center', borderColor: 'var(--border-warm)' }}>
                        <p className="eyebrow" style={{ fontSize: '9px', marginBottom: '8px' }}>{stat.label}</p>
                        <h3 className="font-fredoka" style={{ fontSize: '28px', color: stat.color }}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="wood-panel" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--night2)' }}>
                [ Revenue & Order Analytics Processing... ]
            </div>
        </div>
    );
}

function AdminBooks() {
    const [books, setBooks] = useState([]);
    const [editingBook, setEditingBook] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(()=>{
        fetchBooks();
    },[]);

    const fetchBooks = () => {
        api.get('/api/books').then(res => setBooks(res.data.data)).catch(console.error);
    }

    const handleDelete = async (id) => {
        if(!window.confirm('Strike this book from the records?')) return;
        try {
            await api.delete(`/api/books/${id}`);
            toast.success('Book removed');
            fetchBooks();
        } catch(err) { toast.error('Failed to remove'); }
    }

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: '32px', paddingBottom: '16px', borderBottom: '2px solid var(--border-warm)' }}>
               <h2 className="sec-title" style={{ fontSize: '32px', marginBottom: 0 }}>Inventory <em>Manage</em></h2>
               <div className="flex" style={{ gap: '12px' }}>
                   <button className="clay-btn btn-ghost btn-sm" onClick={fetchBooks}>Refresh List</button>
                   <button className="clay-btn btn-primary btn-sm" onClick={() => { setEditingBook(null); setShowModal(true); }}>+ Add New Book</button>
               </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--interior)', color: 'var(--forest-glow)', fontWeight: 800 }}>
                            <th style={{ padding: '16px', borderBottom: '1px solid var(--border-warm)', textAlign: 'left', borderRadius: '8px 0 0 0' }}>Book Details</th>
                            <th style={{ padding: '16px', borderBottom: '1px solid var(--border-warm)', textAlign: 'left' }}>Price</th>
                            <th style={{ padding: '16px', borderBottom: '1px solid var(--border-warm)', textAlign: 'center' }}>Stock</th>
                            <th style={{ padding: '16px', borderBottom: '1px solid var(--border-warm)', textAlign: 'right', borderRadius: '0 8px 0 0' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map(b => (
                            <tr key={b._id} style={{ borderBottom: '1px solid var(--border-warm)' }}>
                                <td style={{ padding: '16px' }}>
                                    <div className="flex-center" style={{ justifyContent: 'flex-start' }}>
                                        <img src={b.coverUrl} style={{ width: '32px', borderRadius: '2px' }} alt="" />
                                        <div>
                                            <p style={{ fontWeight: 800, color: 'var(--clay-cream)' }}>{b.title}</p>
                                            <p style={{ fontSize: '11px', color: 'var(--text-med)' }}>{b.author}</p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px', fontWeight: 800 }}>₹{b.price}</td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <span className="badge" style={{ 
                                        background: b.stock < 10 ? 'var(--terra)22' : 'var(--mint)22',
                                        color: b.stock < 10 ? 'var(--terra)' : 'var(--mint)'
                                    }}>{b.stock} left</span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <button onClick={() => { setEditingBook(b); setShowModal(true); }} style={{ color: 'var(--forest-glow)', background: 'none', border: 'none', fontWeight: 800, marginRight: '16px', cursor: 'pointer' }}>Edit</button>
                                    <button onClick={() => handleDelete(b._id)} style={{ color: 'var(--terra)', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Del</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="wood-panel" style={{ width: '600px', padding: '40px' }}>
                        <h2 className="sec-title">{editingBook ? 'Edit <em>Book</em>' : 'Add <em>New Book</em>'}</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const bookData = Object.fromEntries(formData);
                            const method = editingBook ? 'put' : 'post';
                            const url = editingBook ? `/api/books/${editingBook._id}` : '/api/books';
                            api[method](url, bookData)
                                .then(() => { toast.success('Library updated'); setShowModal(false); fetchBooks(); })
                                .catch(err => toast.error(err.response?.data?.message || 'Error updating record'));
                        }} className="flex-col" style={{ gap: '16px', marginTop: '24px' }}>
                            <div className="flex" style={{ gap: '16px' }}>
                                <input name="title" placeholder="Title" defaultValue={editingBook?.title} className="clay-input" required />
                                <input name="author" placeholder="Author" defaultValue={editingBook?.author} className="clay-input" required />
                            </div>
                            <textarea name="description" placeholder="Description" defaultValue={editingBook?.description} className="clay-input" style={{ minHeight: '100px' }} />
                            <div className="flex" style={{ gap: '16px' }}>
                                <input name="price" type="number" placeholder="Price" defaultValue={editingBook?.price} className="clay-input" required />
                                <input name="stock" type="number" placeholder="Stock" defaultValue={editingBook?.stock} className="clay-input" required />
                            </div>
                            <input name="coverUrl" placeholder="Cover Image URL" defaultValue={editingBook?.coverUrl} className="clay-input" />
                            <input name="category" placeholder="Category" defaultValue={editingBook?.category} className="clay-input" />
                            <div className="flex-between" style={{ marginTop: '24px' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost" style={{ border: 'none' }}>Cancel</button>
                                <button type="submit" className="clay-btn btn-primary">Save to Library</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    useEffect(()=>{
        api.get('/api/orders/admin').then(res => setOrders(res.data.data)).catch(console.error);
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/api/orders/admin/${id}/status`, { status });
            toast.success('Order status updated');
            setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
        } catch(err) { toast.error('Failed to update status'); }
    }

    return (
        <div>
            <h2 className="sec-title" style={{ fontSize: '32px', marginBottom: '32px' }}>Order <em>Fullfillment</em></h2>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--interior)', color: 'var(--forest-glow)', fontWeight: 800 }}>
                            <th style={{ padding: '16px', textAlign: 'left', borderRadius: '8px 0 0 0' }}>Order No.</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>User</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Total</th>
                            <th style={{ padding: '16px', textAlign: 'right', borderRadius: '0 8px 0 0' }}>Status Update</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o._id} style={{ borderBottom: '1px solid var(--border-warm)' }}>
                                <td style={{ padding: '16px' }}>
                                    <p style={{ fontWeight: 800, color: 'var(--clay-cream)' }}>{o.orderNumber}</p>
                                    <p style={{ fontSize: '11px', opacity: 0.6 }}>{new Date(o.createdAt).toLocaleDateString()}</p>
                                </td>
                                <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-med)' }}>{o.user?.email || 'Guest'}</td>
                                <td style={{ padding: '16px', fontWeight: 800 }}>₹{o.pricing.total}</td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <select 
                                        value={o.status} 
                                        onChange={(e) => updateStatus(o._id, e.target.value)}
                                        className="clay-select"
                                        style={{ padding: '8px 32px 8px 12px', fontSize: '12px', width: 'auto', backgroundPosition: 'right 8px center' }}
                                    >
                                        {['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                                            <option key={s} value={s}>{s.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AdminUsers() {
    return (
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
            <h2 className="sec-title" style={{ fontSize: '28px' }}>User <em>Administration</em></h2>
            <p style={{ fontStyle: 'italic', marginTop: '16px' }}>Archiving user records for deeper management...</p>
        </div>
    );
}

function AdminAnalytics() {
    return (
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
            <h2 className="sec-title" style={{ fontSize: '28px' }}>Deep <em>Analytics</em></h2>
            <p style={{ fontStyle: 'italic', marginTop: '16px' }}>Synthesizing library growth reports...</p>
        </div>
    );
}
