import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/index_hooks';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const { user, loading, logout, refresh } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
  });

  // Security Form State
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editAddressIndex, setEditAddressIndex] = useState(-1);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  // Preferences State
  const [prefs, setPrefs] = useState({
    moods: [],
    problems: [],
    languages: []
  });

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', phone: user.phone || '' });
      setPrefs({
        moods: user.preferences?.moods || [],
        problems: user.preferences?.problems || [],
        languages: user.preferences?.languages || []
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.put('/auth/me', profileData);
      await refresh();
      toast.success('Profile updated! ✨');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    try {
      setIsSaving(true);
      await api.put('/auth/change-password', {
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword
      });
      toast.success('Password changed successfully! 🛡️');
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      let updatedAddresses = [...(user.addresses || [])];
      
      if (editAddressIndex > -1) {
        updatedAddresses[editAddressIndex] = addressForm;
      } else {
        updatedAddresses.push(addressForm);
      }

      // If this is set as default, unset others
      if (addressForm.isDefault) {
        updatedAddresses = updatedAddresses.map((addr, idx) => ({
          ...addr,
          isDefault: idx === (editAddressIndex > -1 ? editAddressIndex : updatedAddresses.length - 1)
        }));
      }

      await api.put('/auth/me', { addresses: updatedAddresses });
      await refresh();
      toast.success('Address saved! 🏠');
      setShowAddressForm(false);
      setEditAddressIndex(-1);
    } catch (err) {
      toast.error('Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (index) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const updatedAddresses = user.addresses.filter((_, i) => i !== index);
      await api.put('/auth/me', { addresses: updatedAddresses });
      await refresh();
      toast.success('Address removed');
    } catch (err) {
      toast.error('Failed to remove address');
    }
  };

  const handleTogglePref = async (category, value) => {
    const current = [...prefs[category]];
    const index = current.indexOf(value);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }
    
    const newPrefs = { ...prefs, [category]: current };
    setPrefs(newPrefs);
    
    try {
      await api.put('/auth/me', { preferences: newPrefs });
      await refresh();
    } catch (err) {
      toast.error('Failed to update preference');
    }
  };

  if (loading) return <LoadingSpinner text="Consulting the archives..." />;
  if (!user) return null;

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px', display: 'flex', gap: '40px' }}>
      
      {/* LEFT SIDEBAR */}
      <div style={{ width: '300px', flexShrink: 0 }}>
        <div className="wood-panel" style={{ padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '50%', background: 'var(--clay-cream)', 
            border: '4px solid var(--terra)', margin: '0 auto 16px auto', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 800,
            color: 'var(--terra)', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.1)'
          }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
          <h2 className="font-fredoka text-2xl text-cream mb-1">{user.name}</h2>
          <p className="text-cream/60 text-sm mb-6">{user.email}</p>
          <button onClick={logout} className="clay-btn btn-primary" style={{ width: '100%', background: 'var(--terra)' }}>Logout 👋</button>
        </div>

        <div className="flex-col gap-2">
          {[
            { id: 'profile', icon: '👤', label: 'My Profile' },
            { id: 'addresses', icon: '📍', label: 'Addresses' },
            { id: 'preferences', icon: '✨', label: 'Preferences' },
            { id: 'security', icon: '🔒', label: 'Security' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 px-6 py-4 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-forest text-white shadow-lg' : 'bg-interior text-textMed hover:bg-cream'}`}
            >
              <span style={{ fontSize: '20px' }}>{tab.icon}</span> {tab.label}
            </button>
          ))}
          <button 
            onClick={() => navigate('/orders')}
            className={`flex items-center gap-4 px-6 py-4 rounded-xl font-bold bg-interior text-textMed hover:bg-cream`}
          >
            <span style={{ fontSize: '20px' }}>📦</span> My Orders
          </button>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div style={{ flex: 1 }} className="clay-card">
        <AnimatePresence mode="wait">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="sec-title mb-8">Personal <em>Information</em></h2>
              <form onSubmit={handleUpdateProfile} className="max-w-md">
                <div className="flex-col gap-6 mb-8">
                  <div>
                    <label className="eyebrow block mb-2">Display Name</label>
                    <input 
                      type="text" 
                      value={profileData.name} 
                      onChange={e => setProfileData({ ...profileData, name: e.target.value })} 
                      className="clay-input w-full"
                    />
                  </div>
                  <div>
                    <label className="eyebrow block mb-2">Email Address (Readonly)</label>
                    <input type="email" value={user.email} disabled className="clay-input w-full opacity-50 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="eyebrow block mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      value={profileData.phone} 
                      onChange={e => setProfileData({ ...profileData, phone: e.target.value })} 
                      className="clay-input w-full"
                      placeholder="e.g. +91 9876543210"
                    />
                  </div>
                </div>
                <button type="submit" disabled={isSaving} className="clay-btn btn-primary btn-lg">
                  {isSaving ? 'Saving...' : 'Update Profile'}
                </button>
              </form>
            </motion.div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <motion.div key="addresses" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex-between mb-8">
                <h2 className="sec-title">Delivery <em>Addresses</em></h2>
                {!showAddressForm && (
                  <button onClick={() => { setEditAddressIndex(-1); setAddressForm({ label: 'Home', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false }); setShowAddressForm(true); }} className="clay-btn btn-primary">
                    Add New Address
                  </button>
                )}
              </div>

              {showAddressForm ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="wood-panel p-8 rounded-[1.5rem] border-2 border-terra/30 relative">
                    <div className="flex-between mb-8">
                       <div>
                         <h3 className="font-fredoka text-2xl text-cream">Add New Address</h3>
                         <p className="text-cream/40 text-[10px] uppercase tracking-[0.2em] font-black">Archive your delivery coordinates</p>
                       </div>
                       <button 
                         type="button" 
                         className="clay-btn btn-sm flex items-center gap-2 !bg-forest/20 !border-forest !text-mint hover:!bg-forest hover:!text-white"
                         onClick={() => {
                           if (!navigator.geolocation) return toast.error('Geolocation not supported');
                           toast.loading('Locating...', { id: 'loc' });
                           navigator.geolocation.getCurrentPosition(async (pos) => {
                             try {
                               const { latitude, longitude } = pos.coords;
                               const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                               const data = await res.json();
                               const addr = data.address;
                               setAddressForm(prev => ({
                                 ...prev,
                                 line1: addr.suburb || addr.neighbourhood || addr.road || '',
                                 city: addr.city || addr.town || addr.village || addr.state_district || '',
                                 state: addr.state || '',
                                 pincode: addr.postcode || ''
                               }));
                               toast.success('Location Anchored! 📍', { id: 'loc' });
                             } catch (e) { toast.error('Failed', { id: 'loc' }); }
                           }, () => toast.error('Denied', { id: 'loc' }));
                         }}
                       >
                         📍 Detect Live Location
                       </button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      // Phone Validation
                      const cleanPhone = addressForm.phone.replace(/\D/g, '');
                      if (cleanPhone.length !== 10) {
                        return toast.error('Mobile number must be exactly 10 digits');
                      }
                      handleAddressSubmit(e);
                    }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="col-span-full">
                         <label className="eyebrow block mb-3 text-mint/60">Address Category</label>
                         <div className="flex flex-wrap gap-2">
                           {['Home', 'Work', 'Vault', 'Other'].map(l => (
                             <button 
                                key={l} type="button" 
                                onClick={() => setAddressForm({...addressForm, label: l})} 
                                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${addressForm.label === l ? 'bg-mint border-mint text-forest shadow-[0_0_15px_rgba(45,106,79,0.3)]' : 'bg-white/5 border-white/10 text-cream/40 hover:border-white/20'}`}
                             >
                               {l}
                             </button>
                           ))}
                         </div>
                      </div>

                      <div className="col-span-1">
                        <label className="eyebrow block mb-2">Recipient</label>
                        <input type="text" value={addressForm.fullName} onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })} className="clay-input w-full text-sm focus:border-mint/50 transition-colors" placeholder="Full Name" required />
                      </div>

                      <div className="col-span-1">
                        <label className="eyebrow block mb-2">Mobile (10 Digits)</label>
                        <input type="tel" maxLength={10} value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g,'') })} className="clay-input w-full text-sm focus:border-mint/50" placeholder="9876543210" required />
                      </div>

                      <div className="col-span-full">
                        <label className="eyebrow block mb-2">Street / Landmark</label>
                        <input type="text" value={addressForm.line1} onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })} className="clay-input w-full text-sm focus:border-mint/50" placeholder="Building name, landmark, etc." required />
                      </div>

                      <div className="grid grid-cols-3 col-span-full gap-4">
                        <div className="col-span-1">
                          <label className="eyebrow block mb-2">City</label>
                          <input type="text" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="clay-input w-full text-sm focus:border-mint/50" required />
                        </div>
                        <div className="col-span-1">
                          <label className="eyebrow block mb-2">State</label>
                          <input type="text" value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} className="clay-input w-full text-sm focus:border-mint/50" required />
                        </div>
                        <div className="col-span-1">
                          <label className="eyebrow block mb-2">Pincode</label>
                          <input type="text" maxLength={6} value={addressForm.pincode} onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g,'') })} className="clay-input w-full text-sm focus:border-mint/50" required />
                        </div>
                      </div>

                      <div className="col-span-full flex items-center justify-between py-5 border-t border-white/5 mt-2 bg-white/2 rounded-xl px-4">
                         <label className="font-bold text-cream/60 text-[11px] uppercase tracking-[0.2em]">Set as Default Address</label>
                         <div 
                           onClick={() => setAddressForm({...addressForm, isDefault: !addressForm.isDefault})}
                           className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${addressForm.isDefault ? 'bg-mint' : 'bg-white/10'}`}
                         >
                           <motion.div 
                             animate={{ x: addressForm.isDefault ? 22 : 4 }}
                             className="absolute top-1 w-4 h-4 rounded-full bg-forest shadow-lg" 
                           />
                         </div>
                      </div>

                      <div className="col-span-full flex gap-4 mt-4">
                        <button type="submit" disabled={isSaving} className="clay-btn btn-primary flex-1 !py-4 shadow-xl">
                          {isSaving ? 'Processing...' : 'Capture Address'}
                        </button>
                        <button type="button" onClick={() => setShowAddressForm(false)} className="clay-btn btn-ghost flex-1 opacity-50 hover:bg-white/5">Cancel</button>
                      </div>
                    </form>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.addresses?.map((addr, i) => (
                    <motion.div 
                      layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      key={i} 
                      className={`wood-panel p-6 relative group border-2 transition-all ${addr.isDefault ? 'border-mint shadow-[0_0_20px_rgba(45,106,79,0.2)]' : 'border-white/5 hover:border-mint/30'}`}
                    >
                      {addr.isDefault && <span className="absolute top-0 right-0 bg-mint text-forest text-[9px] font-black px-3 py-1 rounded-bl-xl tracking-[0.2em] uppercase">Default Anchor</span>}
                      
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">🗺️</span>
                        <h3 className="font-fredoka text-2xl text-cream">{addr.label}</h3>
                      </div>

                      <div className="space-y-1 mb-6">
                        <p className="font-black text-cream text-sm uppercase tracking-wider">{addr.fullName}</p>
                        <p className="text-cream/50 text-xs leading-relaxed">
                          {addr.line1}, {addr.line2 && addr.line2 + ','}<br/>
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-mint font-bold text-xs pt-2">📞 {addr.phone}</p>
                      </div>

                      <div className="flex gap-5 border-t border-white/5 pt-4">
                        <button 
                          onClick={() => { setEditAddressIndex(i); setAddressForm(addr); setShowAddressForm(true); }} 
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-mint/60 hover:text-mint transition-colors"
                        >
                          ✎ Modify
                        </button>
                        <button 
                          onClick={() => handleDeleteAddress(i)} 
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-terra/60 hover:text-terra transition-colors"
                        >
                          ✕ Erase
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {(!user.addresses || user.addresses.length === 0) && (
                    <div className="col-span-2 text-center py-10 opacity-30">
                      <p className="text-2xl mb-2">📍</p>
                      <p className="font-bold">No addresses saved yet</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <motion.div key="preferences" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="sec-title mb-4">Library <em>Arrangement</em></h2>
              <p className="text-textMed mb-8">Personalize your shop floor by telling us more about your reading vibe.</p>

              <div className="flex-col gap-10">
                <section>
                  <h3 className="eyebrow text-terra mb-4">Reading Moods</h3>
                  <div className="flex flex-wrap gap-3">
                    {['Motivated', 'Confused', 'Feeling Low', 'Burned Out', 'Curious', 'Stressed'].map(m => (
                      <button 
                        key={m} 
                        onClick={() => handleTogglePref('moods', m)}
                        className={`px-4 py-2 rounded-xl font-bold transition-all border-2 ${prefs.moods.includes(m) ? 'bg-mint border-mint text-white scale-110 shadow-md' : 'bg-interior border-borderWarm text-textMed hover:border-mint'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="eyebrow text-amber mb-4">Core Struggles</h3>
                  <div className="flex flex-wrap gap-3">
                    {['Career', 'Finance', 'Focus', 'Confidence', 'Communication', 'Stress', 'Relationships'].map(p => (
                      <button 
                        key={p} 
                        onClick={() => handleTogglePref('problems', p)}
                        className={`px-4 py-2 rounded-xl font-bold transition-all border-2 ${prefs.problems.includes(p) ? 'bg-amber border-amber text-white scale-110 shadow-md' : 'bg-interior border-borderWarm text-textMed hover:border-amber'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="eyebrow text-primary mb-4">Preferred Languages</h3>
                  <div className="flex flex-wrap gap-3">
                    {['English', 'Hindi', 'Hinglish', 'Tamil', 'Malayalam'].map(l => (
                      <button 
                        key={l} 
                        onClick={() => handleTogglePref('languages', l)}
                        className={`px-4 py-2 rounded-xl font-bold transition-all border-2 ${prefs.languages.includes(l) ? 'bg-primary border-primary text-white scale-110 shadow-md' : 'bg-interior border-borderWarm text-textMed hover:border-primary'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="sec-title mb-8">Vault <em>Security</em></h2>
              <form onSubmit={handleChangePassword} className="max-w-md">
                <div className="flex-col gap-6 mb-8">
                  <div>
                    <label className="eyebrow block mb-2">Current Password</label>
                    <input 
                      type="password" 
                      value={securityData.currentPassword} 
                      onChange={e => setSecurityData({ ...securityData, currentPassword: e.target.value })} 
                      className="clay-input w-full"
                      required 
                    />
                  </div>
                  <div className="h-px bg-borderWarm my-2" />
                  <div>
                    <label className="eyebrow block mb-2">New Password (Min 8 chars)</label>
                    <input 
                      type="password" 
                      value={securityData.newPassword} 
                      onChange={e => setSecurityData({ ...securityData, newPassword: e.target.value })} 
                      className="clay-input w-full"
                      required 
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label className="eyebrow block mb-2">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={securityData.confirmPassword} 
                      onChange={e => setSecurityData({ ...securityData, confirmPassword: e.target.value })} 
                      className="clay-input w-full"
                      required 
                    />
                  </div>
                </div>
                <button type="submit" disabled={isSaving} className="clay-btn btn-primary btn-lg !bg-terra">
                  {isSaving ? 'Updating...' : 'Update Security Settings'}
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
