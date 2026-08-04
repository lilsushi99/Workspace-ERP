import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { useToast } from '../../context/ToastContext';
import { ChangePasswordModal } from './ChangePasswordModal';
import { OperationsApiService } from '../../services/operationsService';

interface SettingsPageProps {
  user: User;
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onLogout }) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'business' | 'profile' | 'roles'>('business');

  // Business Settings State
  const [businessName, setBusinessName] = useState('Hive Hub Enterprise ERP');
  const [businessLogo, setBusinessLogo] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80');
  const [currency, setCurrency] = useState('USD ($)');
  const [timeZone, setTimeZone] = useState('UTC-05:00 (Eastern Time)');
  const [address, setAddress] = useState('102 Executive Plaza, Suite 400, Innovation District');
  const [phone, setPhone] = useState('+1 (555) 902-1823');
  const [email, setEmail] = useState('admin@hivehuberp.com');
  const [systemTheme] = useState('Light Mode (Default)');
  const [language, setLanguage] = useState('English (Default)');

  // ID Prefix Settings State
  const [bookingPrefix, setBookingPrefix] = useState('BK');
  const [clientPrefix, setClientPrefix] = useState('CL');
  const [expensePrefix, setExpensePrefix] = useState('EXP');
  const [categoryPrefix, setCategoryPrefix] = useState('EC');
  const [branchCode, setBranchCode] = useState('IPHIN');

  useEffect(() => {
    OperationsApiService.fetchSystemSettings()
      .then((s) => {
        if (s.businessName) setBusinessName(s.businessName);
        if (s.businessLogo) setBusinessLogo(s.businessLogo);
        if (s.currency) setCurrency(s.currency);
        if (s.timeZone) setTimeZone(s.timeZone);
        if (s.address) setAddress(s.address);
        if (s.phone) setPhone(s.phone);
        if (s.email) setEmail(s.email);
        if (s.language) setLanguage(s.language);
        if (s.bookingPrefix) setBookingPrefix(s.bookingPrefix);
        if (s.clientPrefix) setClientPrefix(s.clientPrefix);
        if (s.expensePrefix) setExpensePrefix(s.expensePrefix);
        if (s.categoryPrefix) setCategoryPrefix(s.categoryPrefix);
        if (s.branchCode) setBranchCode(s.branchCode);
      })
      .catch((err) => console.error('Failed to load system settings', err));
  }, []);

  // Profile Settings State
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState('+1 (555) 234-5678');
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(() => {
    return localStorage.getItem('user_profile_avatar') || user.avatar || null;
  });

  const handleAvatarChange = (newAvatar: string) => {
    setProfileAvatar(newAvatar);
    localStorage.setItem('user_profile_avatar', newAvatar);
  };

  // Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Role Permissions Matrix State (Toggles)
  const [rolePermissions, setRolePermissions] = useState<{
    [role: string]: {
      dashboard: boolean;
      crm: boolean;
      bookings: boolean;
      dailyLogger: boolean;
      finance: boolean;
      expenses: boolean;
      reports: boolean;
      administration: boolean;
    };
  }>({
    Director: {
      dashboard: true,
      crm: true,
      bookings: true,
      dailyLogger: true,
      finance: true,
      expenses: true,
      reports: true,
      administration: true,
    },
    Manager: {
      dashboard: true,
      crm: true,
      bookings: true,
      dailyLogger: true,
      finance: true,
      expenses: true,
      reports: true,
      administration: false,
    },
    Receptionist: {
      dashboard: false,
      crm: true,
      bookings: true,
      dailyLogger: true,
      finance: false,
      expenses: false,
      reports: false,
      administration: false,
    },
    Accountant: {
      dashboard: true,
      crm: false,
      bookings: false,
      dailyLogger: false,
      finance: true,
      expenses: true,
      reports: true,
      administration: false,
    },
  });

  const handleSaveBusinessSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await OperationsApiService.updateSystemSettings({
        businessName: businessName.trim(),
        businessLogo,
        currency,
        timeZone,
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        language,
        bookingPrefix: bookingPrefix.trim() || 'BK',
        clientPrefix: clientPrefix.trim() || 'CL',
        expensePrefix: expensePrefix.trim() || 'EXP',
        categoryPrefix: categoryPrefix.trim() || 'EC',
        branchCode: branchCode.trim() || 'IPHIN',
      });
      showToast('Settings Saved', 'Business configuration, logo, and ID prefix settings updated successfully.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to save settings.', 'error');
    }
  };

  const handleCancelBusinessSettings = () => {
    setBusinessName('Hive Hub Enterprise ERP');
    setCurrency('USD ($)');
    setTimeZone('UTC-05:00 (Eastern Time)');
    setAddress('102 Executive Plaza, Suite 400, Innovation District');
    setPhone('+1 (555) 902-1823');
    setEmail('admin@hivehuberp.com');
    setLanguage('English (Default)');
    showToast('Changes Cancelled', 'Reverted back to saved configuration values.', 'info');
  };

  const handleSaveProfileSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Profile Updated', 'Your personal account profile info has been saved.', 'success');
  };

  const togglePermission = (role: string, module: keyof typeof rolePermissions['Director']) => {
    setRolePermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: !prev[role][module],
      },
    }));
  };

  const handleSaveRoleMatrix = () => {
    showToast('Permissions Saved', 'Role matrix security rules updated across all user groups.', 'success');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-gray-200/80 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-heading flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <i className="fa-solid fa-gear text-sm"></i>
            </span>
            System Settings & Security Controls
          </h1>
          <p className="text-xs text-gray-500 font-sans mt-1">
            Configure business identity, localization, administrator profile, and role permission matrices
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 bg-white px-6 rounded-2xl shadow-2xs">
        {[
          { id: 'business', label: 'Business Settings', icon: 'fa-solid fa-building' },
          { id: 'profile', label: 'Profile Settings', icon: 'fa-solid fa-user-circle' },
          { id: 'roles', label: 'Role Management', icon: 'fa-solid fa-shield-halved' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-4 px-5 border-b-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <i className={`${tab.icon} text-xs ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BUSINESS SETTINGS */}
      {activeTab === 'business' && (
        <form onSubmit={handleSaveBusinessSettings} className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-bold text-gray-900 font-heading">Business Configuration</h2>
            <p className="text-xs text-gray-500 mt-0.5">Define corporate entity info, currency, time zone, and default language</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Business Logo</label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center relative group">
                  <img src={businessLogo} alt="Logo" className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-xs">
                    <i className="fa-solid fa-camera"></i>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (reader.result) setBusinessLogo(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <div>
                  <label className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer inline-flex items-center gap-2 transition-colors shadow-2xs">
                    <i className="fa-solid fa-upload text-blue-600"></i>
                    Upload New Logo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (reader.result) setBusinessLogo(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <p className="text-[10px] text-gray-400 mt-1">PNG, JPG or WEBP up to 5MB (Local upload supported)</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans cursor-pointer"
              >
                <option value="USD ($)">USD ($) - US Dollar</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="NGN (₦)">NGN (₦) - Nigerian Naira</option>
                <option value="GBP (£)">GBP (£) - British Pound</option>
                <option value="CAD ($)">CAD ($) - Canadian Dollar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Time Zone</label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans cursor-pointer"
              >
                <option value="UTC-05:00 (Eastern Time)">UTC-05:00 (Eastern Time - US & Canada)</option>
                <option value="UTC+00:00 (GMT)">UTC+00:00 (Greenwich Mean Time / UTC)</option>
                <option value="UTC+01:00 (West Africa Time)">UTC+01:00 (West Africa Time)</option>
                <option value="UTC+02:00 (Central European Time)">UTC+02:00 (Central European Time)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Business Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">System Theme</label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700">
                <i className="fa-solid fa-sun text-amber-500"></i>
                <span className="font-medium">{systemTheme}</span>
                <span className="ml-auto px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">Active</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans cursor-pointer"
              >
                <option value="English (Default)">English (Default)</option>
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
                <option value="German">German</option>
              </select>
            </div>
          </div>

          {/* Dedicated ID Prefix Configuration */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 font-heading">Sequential ID Prefix Configuration</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Configure prefixes and branch identifiers used for auto-generating Booking and Client IDs. Changes apply ONLY to newly created records.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Booking Prefix</label>
                <input
                  type="text"
                  value={bookingPrefix}
                  onChange={(e) => setBookingPrefix(e.target.value.toUpperCase())}
                  placeholder="BK"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Preview: {bookingPrefix || 'BK'}-{branchCode || 'IPHIN'}-2026-1</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Client Prefix</label>
                <input
                  type="text"
                  value={clientPrefix}
                  onChange={(e) => setClientPrefix(e.target.value.toUpperCase())}
                  placeholder="CL"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Preview: {clientPrefix || 'CL'}-{branchCode || 'IPHIN'}-1</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Expense Prefix</label>
                <input
                  type="text"
                  value={expensePrefix}
                  onChange={(e) => setExpensePrefix(e.target.value.toUpperCase())}
                  placeholder="EXP"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Preview: {expensePrefix || 'EXP'}-{branchCode || 'IPHIN'}-2026-1</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category Prefix</label>
                <input
                  type="text"
                  value={categoryPrefix}
                  onChange={(e) => setCategoryPrefix(e.target.value.toUpperCase())}
                  placeholder="EC"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Preview: {categoryPrefix || 'EC'}-001</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Branch Code</label>
                <input
                  type="text"
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value.toUpperCase())}
                  placeholder="IPHIN"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Main location code tag</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelBusinessSettings}
              className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel Changes
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <i className="fa-solid fa-floppy-disk text-xs"></i>
              Save Settings
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfileSettings} className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-bold text-gray-900 font-heading">User Profile Information</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage your personal credentials, contact details, and account security</p>
          </div>

          <div className="flex items-center gap-5 p-4 bg-gray-50/80 border border-gray-200/80 rounded-2xl">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xl flex items-center justify-center font-heading shadow-md overflow-hidden">
                {profileAvatar ? (
                  <img src={profileAvatar} alt="Profile Photo" className="w-full h-full object-cover" />
                ) : (
                  profileName.split(' ').map((n) => n[0]).join('')
                )}
              </div>
              <label className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity flex items-center justify-center cursor-pointer text-xs">
                <i className="fa-solid fa-camera"></i>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (reader.result) handleAvatarChange(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 font-heading">{profileName}</h3>
              <p className="text-xs text-gray-500">{user.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <label className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 cursor-pointer inline-flex items-center gap-1.5 transition-colors shadow-2xs">
                  <i className="fa-solid fa-upload text-blue-600"></i>
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (reader.result) handleAvatarChange(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {user.role} Access
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Session
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">System Role</label>
              <input
                type="text"
                disabled
                value={user.role}
                className="w-full px-3.5 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-500 font-semibold font-sans cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
              >
                <i className="fa-solid fa-key text-amber-600"></i>
                Change Password
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2.5 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
              >
                <i className="fa-solid fa-right-from-bracket text-red-600"></i>
                Logout Account
              </button>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <i className="fa-solid fa-floppy-disk text-xs"></i>
              Save Profile Info
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: ROLE MANAGEMENT */}
      {activeTab === 'roles' && (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 font-heading">Role Management & Permissions</h2>
              <p className="text-xs text-gray-500 mt-0.5">Toggle granular module permissions per organizational role using interactive switches</p>
            </div>
            <button
              onClick={handleSaveRoleMatrix}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <i className="fa-solid fa-check text-xs"></i>
              Save Role Matrix
            </button>
          </div>

          <div className="space-y-6">
            {[
              { role: 'Director', desc: 'Full Access across all system modules, finances, branches, and security settings.', badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200' },
              { role: 'Manager', desc: 'Access to Dashboard, CRM, Operations, Reports, and Finance modules.', badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200' },
              { role: 'Receptionist', desc: 'Front-desk access restricted to Bookings, CRM, and Daily Logger operations.', badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200' },
              { role: 'Accountant', desc: 'Finance access restricted to General Ledger, Expenses, and Financial Reports.', badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            ].map(({ role, desc, badgeStyle }) => (
              <div key={role} className="border border-gray-200/80 rounded-2xl p-5 space-y-4 bg-gray-50/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg border uppercase tracking-wider ${badgeStyle}`}>
                      {role}
                    </span>
                    <p className="text-xs text-gray-500 font-sans">{desc}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-200/60">
                  {[
                    { key: 'dashboard', label: 'Executive Dashboard' },
                    { key: 'crm', label: 'CRM & Accounts' },
                    { key: 'bookings', label: 'Facility Bookings' },
                    { key: 'dailyLogger', label: 'Daily Logger' },
                    { key: 'finance', label: 'Financial Ledger' },
                    { key: 'expenses', label: 'Expense Vouchers' },
                    { key: 'reports', label: 'Reports & Analytics' },
                    { key: 'administration', label: 'System Admin' },
                  ].map(({ key, label }) => {
                    const isChecked = rolePermissions[role][key as keyof typeof rolePermissions['Director']];
                    return (
                      <div
                        key={key}
                        onClick={() => togglePermission(role, key as any)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked
                            ? 'bg-white border-blue-200 shadow-2xs'
                            : 'bg-gray-100/60 border-gray-200/80 opacity-60'
                        }`}
                      >
                        <span className="text-xs font-semibold text-gray-800">{label}</span>
                        {/* Beautiful Toggle Switch */}
                        <div
                          className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                            isChecked ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                              isChecked ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};
