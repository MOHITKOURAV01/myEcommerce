import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/index_hooks';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Edit State
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
     if (!loading && !user) {
         navigate('/login');
     } else if (user) {
         setName(user.name);
     }
  }, [user, loading, navigate]);

  useEffect(() => {
     if (activeTab === 'orders' && user && orders.length === 0) {
         fetchOrders();
     }
  }, [activeTab]);

  const fetchOrders = async () => {
      try {
          setLoadingOrders(true);
          const { data } = await api.get('/api/orders');
          setOrders(data.data);
      } catch (err) {
          toast.error('Failed to load orders');
      } finally {
          setLoadingOrders(false);
      }
  };

  const handleUpdateProfile = async (e) => {
      e.preventDefault();
      try {
          await api.put('/api/auth/updatedetails', { name });
          toast.success('Profile updated successfully');
      } catch (err) {
          toast.error(err.response?.data?.message || 'Error updating profile');
      }
  };

  const handleUpdatePassword = async (e) => {
      e.preventDefault();
      try {
          await api.put('/api/auth/updatepassword', { currentPassword, newPassword });
          toast.success('Password updated successfully');
          setCurrentPassword('');
          setNewPassword('');
      } catch (err) {
          toast.error(err.response?.data?.message || 'Error updating password');
      }
  };

  const handleCancelOrder = async (orderId) => {
      if(!window.confirm('Are you sure you want to cancel this order?')) return;
      try {
          const { data } = await api.put(`/api/orders/${orderId}/cancel`);
          setOrders(orders.map(o => o._id === orderId ? data.data : o));
          toast.success('Order cancelled');
      } catch (err) {
          toast.error('Failed to cancel order');
      }
  }

  if (loading) return <LoadingSpinner text="Loading your cozy corner..." />;
  if (!user) return null;

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
       
       {/* Sidebar */}
       <div style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '100px' }}>
           <div className="wood-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
               <div style={{ 
                   width: '96px', height: '96px', borderRadius: '50%', background: 'var(--clay-cream)', 
                   border: '4px solid var(--terra)', marginBottom: '16px', display: 'flex', 
                   alignItems: 'center', justifyContent: 'center', fontSize: '36px', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' 
               }}>
                  {user.avatar ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '👤'}
               </div>
               <h2 className="sec-title" style={{ fontSize: '20px', marginBottom: '4px', textAlign: 'center' }}>{user.name}</h2>
               <p style={{ fontSize: '13px', color: 'var(--text-med)', marginBottom: '16px' }}>{user.email}</p>
               <button onClick={logout} style={{ color: 'var(--terra)', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}>Log Out</button>
           </div>

           <div className="flex-col" style={{ gap: '8px' }}>
               {[
                   { id: 'profile', icon: '⚙️', label: 'Settings' },
                   { id: 'orders', icon: '📦', label: 'Orders' },
                   { id: 'addresses', icon: '🏠', label: 'Addresses' },
                   { id: 'preferences', icon: '🎭', label: 'Interests' },
               ].map(tab => (
                   <button 
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id)}
                       className={`flex-center`}
                       style={{ 
                           justifyContent: 'flex-start', padding: '16px 20px', borderRadius: 'var(--radius-md)', 
                           width: '100%', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                           background: activeTab === tab.id ? 'var(--forest)' : 'var(--interior)',
                           color: activeTab === tab.id ? 'white' : 'var(--text-med)',
                           fontWeight: 800, boxShadow: activeTab === tab.id ? '0 4px 0 var(--forest-dk)' : 'none'
                       }}
                   >
                       <span style={{ fontSize: '20px', marginRight: '12px' }}>{tab.icon}</span> {tab.label}
                   </button>
               ))}
           </div>
       </div>

       {/* Main Content Area */}
       <div style={{ flex: 1 }} className="clay-card">
           
           {/* ACCOUNT SETTINGS */}
           {activeTab === 'profile' && (
               <div>
                   <h2 className="sec-title" style={{ fontSize: '32px', marginBottom: '40px' }}>Account <em>Settings</em></h2>
                   
                   <form onSubmit={handleUpdateProfile} style={{ maxWidth: '450px', marginBottom: '48px' }}>
                       <h3 className="eyebrow" style={{ marginBottom: '20px' }}>Personal Details</h3>
                       <div className="flex-col" style={{ gap: '16px', marginBottom: '24px' }}>
                           <input type="text" value={name} onChange={e=>setName(e.target.value)} className="clay-input" placeholder="Full Name" />
                           <input type="email" value={user.email} disabled className="clay-input" style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                       </div>
                       <button type="submit" className="clay-btn btn-primary">Save Details</button>
                   </form>

                   <form onSubmit={handleUpdatePassword} style={{ maxWidth: '450px', paddingTop: '32px', borderTop: '2px solid var(--border-warm)' }}>
                       <h3 className="eyebrow" style={{ marginBottom: '20px' }}>Security</h3>
                       <div className="flex-col" style={{ gap: '16px', marginBottom: '24px' }}>
                           <input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} className="clay-input" placeholder="Current Password" required />
                           <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="clay-input" placeholder="New Password" required />
                       </div>
                       <button type="submit" className="clay-btn btn-secondary">Update Password</button>
                   </form>
               </div>
           )}

           {/* ORDERS */}
           {activeTab === 'orders' && (
               <div>
                   <h2 className="sec-title" style={{ fontSize: '32px', marginBottom: '40px' }}>Order <em>History</em></h2>
                   {loadingOrders ? (
                       <LoadingSpinner text="Fetching your bookshelf logs..." />
                   ) : orders.length === 0 ? (
                       <div style={{ textAlign: 'center', padding: '60px 0' }}>
                           <span style={{ fontSize: '60px', marginBottom: '24px', display: 'block' }}>📦</span>
                           <p style={{ color: 'var(--text-med)', fontWeight: 800, fontSize: '18px', marginBottom: '24px' }}>No orders found yet.</p>
                           <button onClick={()=>navigate('/discover')} className="clay-btn btn-primary">Discover Books</button>
                       </div>
                   ) : (
                       <div className="flex-col" style={{ gap: '24px' }}>
                           {orders.map(order => (
                               <div key={order._id} className="wood-panel" style={{ padding: '24px' }}>
                                   <div className="flex-between" style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-warm)' }}>
                                       <div>
                                           <p className="eyebrow" style={{ fontSize: '11px', marginBottom: '4px' }}>{order.orderNumber}</p>
                                           <p style={{ fontSize: '13px', opacity: 0.6 }}>Placed {new Date(order.createdAt).toLocaleDateString()}</p>
                                       </div>
                                       <div style={{ textAlign: 'right' }}>
                                           <p className="price-current" style={{ fontSize: '24px' }}>₹{order.pricing.total}</p>
                                           <span className="badge" style={{ 
                                               marginTop: '8px',
                                               background: order.status === 'delivered' ? 'var(--forest-glow)22' : 'var(--amber)22',
                                               color: order.status === 'delivered' ? 'var(--forest-glow)' : 'var(--amber)',
                                               border: `1px solid ${order.status === 'delivered' ? 'var(--forest-glow)44' : 'var(--amber)44'}`
                                           }}>
                                               {order.status}
                                           </span>
                                       </div>
                                   </div>
                                   
                                   <div className="flex-col" style={{ gap: '16px' }}>
                                       {order.items.map(item => (
                                           <div key={item._id || item.book} className="flex-center" style={{ justifyContent: 'flex-start', gap: '16px' }}>
                                               <img src={item.coverUrl} alt={item.title} style={{ width: '48px', height: '64px', objectFit: 'cover', borderRadius: '4px', boxShadow: 'var(--clay-shadow-sm)' }} />
                                               <div style={{ flex: 1 }}>
                                                   <p style={{ fontWeight: 800, fontSize: '14px' }}>{item.title}</p>
                                                   <p style={{ fontSize: '12px', opacity: 0.6 }}>Quantity: {item.quantity}</p>
                                               </div>
                                           </div>
                                       ))}
                                   </div>

                                   <div className="flex" style={{ marginTop: '24px', gap: '16px' }}>
                                       <button onClick={()=>navigate(`/order/${order._id}`)} className="btn-ghost" style={{ fontSize: '12px', border: 'none', fontWeight: 800 }}>View Timeline</button>
                                       {['placed', 'confirmed'].includes(order.status) && (
                                            <button onClick={()=>handleCancelOrder(order._id)} style={{ fontSize: '12px', color: 'var(--terra)', fontWeight: 800, border: 'none', background: 'none', cursor: 'pointer' }}>Cancel Order</button>
                                       )}
                                   </div>
                               </div>
                           ))}
                       </div>
                   )}
               </div>
           )}

           {/* ADDRESSES */}
           {activeTab === 'addresses' && (
               <div>
                   <h2 className="sec-title" style={{ fontSize: '32px', marginBottom: '40px' }}>Saved <em>Addresses</em></h2>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                       <div className="wood-panel" style={{ padding: '24px', position: 'relative' }}>
                           <span className="badge badge-forest" style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '10px' }}>Default</span>
                           <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>{user.name}</h3>
                           <p style={{ color: 'var(--text-med)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>123 Library Lane, Shelf 4<br/>Booktown, BK - 400001</p>
                           <div className="flex" style={{ gap: '16px' }}>
                               <button style={{ color: 'var(--forest-glow)', fontWeight: 800, border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                               <button style={{ color: 'var(--terra)', fontWeight: 800, border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                           </div>
                       </div>
                       
                       <button className="flex-col" style={{ 
                           alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border-warm)', 
                           background: 'var(--interior)', padding: '24px', borderRadius: 'var(--radius-lg)', 
                           color: 'var(--text-med)', cursor: 'pointer', transition: 'all 0.2s' 
                       }} onMouseOver={e=>e.currentTarget.style.borderColor='var(--forest-glow)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border-warm)'}>
                           <span style={{ fontSize: '32px', marginBottom: '8px' }}>+</span>
                           <span style={{ fontWeight: 800 }}>Add New Address</span>
                       </button>
                   </div>
               </div>
           )}

           {/* PREFERENCES */}
           {activeTab === 'preferences' && (
               <div>
                   <h2 className="sec-title" style={{ fontSize: '32px', marginBottom: '40px' }}>Library <em>Interests</em></h2>
                   <p style={{ color: 'var(--text-med)', marginBottom: '32px' }}>Tell us what genres ignite your curiosity, and we'll arrange the shelves for you.</p>
                   
                   <div style={{ marginBottom: '40px' }}>
                       <h3 className="eyebrow" style={{ marginBottom: '20px' }}>Favorite Genres</h3>
                       <div className="flex" style={{ flexWrap: 'wrap', gap: '12px' }}>
                           {['Philosophy', 'Science Fiction', 'Biographies', 'Ancient History', 'Psychology', 'Success'].map(m => (
                               <button key={m} className="clay-btn btn-ghost" style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '30px' }}>{m}</button>
                           ))}
                       </div>
                   </div>

                   <button className="clay-btn btn-primary">Update Interests</button>
               </div>
           )}

       </div>
    </div>
  );
}
