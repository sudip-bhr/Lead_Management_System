import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Bell, Shield, Save, Smartphone, Mail, Globe, Share2, MessageSquare, Send, CheckCircle2, Copy } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/axios';

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

export default function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Lead Capture Simulator State
  const [simType, setSimType] = useState('whatsapp');
  const [simName, setSimName] = useState('Sarah Connor');
  const [simPhone, setSimPhone] = useState('+14155552671');
  const [simEmail, setSimEmail] = useState('sarah@example.com');
  const [simCourse, setSimCourse] = useState('Full Stack Web Development');
  const [simMessage, setSimMessage] = useState('Hi, I saw your ad and want more details about the upcoming batch!');
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordMessage({ type: 'error', text: 'Please fill in both fields.' });
      return;
    }
    setIsChangingPassword(true);
    setPasswordMessage({ type: '', text: '' });
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update password' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSimulateLead = async (e) => {
    e.preventDefault();
    setSimLoading(true);
    setSimResult(null);
    try {
      if (simType === 'whatsapp') {
        const res = await api.post('/webhooks/whatsapp-lead', {
          name: simName,
          phone: simPhone,
          message: simMessage,
          course_interest: simCourse,
        });
        setSimResult({ type: 'success', data: res.data });
      } else {
        const res = await api.post('/webhooks/facebook-lead', {
          name: simName,
          phone: simPhone,
          email: simEmail,
          course_interest: simCourse,
          utm_campaign: 'FB_Lead_Ads_Promo',
        });
        setSimResult({ type: 'success', data: res.data });
      }
    } catch (err) {
      setSimResult({ type: 'error', message: err.response?.data?.error || err.message || 'Simulation failed' });
    } finally {
      setSimLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'integrations', name: 'Integrations & Webhooks', icon: Share2 },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account settings, API integrations, and system preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-blue-700" : "text-gray-400")} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'profile' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                      Change Avatar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      defaultValue={user?.name || ''}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      disabled
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <input
                      type="text"
                      defaultValue={user?.role || ''}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 capitalize"
                      disabled
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="p-6 space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Lead Capture Integrations</h2>
                <p className="text-sm text-gray-500">Connect Facebook Lead Ads & WhatsApp Cloud API to automatically capture incoming leads into your CRM.</p>
              </div>

              {/* WhatsApp Cloud API Box */}
              <div className="border rounded-lg p-5 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">WhatsApp Cloud API Webhook</h3>
                      <p className="text-xs text-gray-500">Capture leads automatically when users message your WhatsApp Business Number.</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <label className="font-medium text-gray-700 block mb-1">Webhook Callback URL</label>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={`${window.location.origin.replace('5173', '4000')}/api/webhooks/whatsapp`}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 bg-white text-gray-600 font-mono text-[11px]"
                      />
                      <button 
                        onClick={() => copyToClipboard(`${window.location.origin.replace('5173', '4000')}/api/webhooks/whatsapp`)}
                        className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 text-gray-600"
                        title="Copy URL"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="font-medium text-gray-700 block mb-1">Verify Token</label>
                      <input
                        readOnly
                        value="my_verify_token"
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 bg-white text-gray-600 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-gray-700 block mb-1">Environment Variable</label>
                      <code className="block rounded-md border border-gray-300 px-3 py-1.5 bg-gray-100 text-gray-700 text-[11px]">
                        WHATSAPP_CLOUD_TOKEN
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Facebook Lead Ads Box */}
              <div className="border rounded-lg p-5 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2.5 rounded-lg text-blue-700">
                      <Facebook className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Facebook Lead Ads (Meta Leadgen)</h3>
                      <p className="text-xs text-gray-500">Sync Instant Forms directly from Facebook & Instagram Ad campaigns.</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <label className="font-medium text-gray-700 block mb-1">Webhook Callback URL</label>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={`${window.location.origin.replace('5173', '4000')}/api/webhooks/facebook`}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 bg-white text-gray-600 font-mono text-[11px]"
                      />
                      <button 
                        onClick={() => copyToClipboard(`${window.location.origin.replace('5173', '4000')}/api/webhooks/facebook`)}
                        className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 text-gray-600"
                        title="Copy URL"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="font-medium text-gray-700 block mb-1">Verify Token</label>
                      <input
                        readOnly
                        value="my_verify_token"
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 bg-white text-gray-600 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-gray-700 block mb-1">Environment Variable</label>
                      <code className="block rounded-md border border-gray-300 px-3 py-1.5 bg-gray-100 text-gray-700 text-[11px]">
                        FB_PAGE_ACCESS_TOKEN
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Capture Simulator Card */}
              <div className="border-2 border-dashed border-blue-200 rounded-xl p-6 bg-linear-to-br from-blue-50/40 to-slate-50 space-y-4">
                <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Send className="h-4 w-4 text-blue-600" />
                      Interactive Lead Capture Simulator
                    </h3>
                    <p className="text-xs text-gray-500">Test submitting a simulated WhatsApp or Facebook lead to verify real-time CRM capture and auto-assignment.</p>
                  </div>
                </div>

                <form onSubmit={handleSimulateLead} className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-medium text-gray-700 block mb-1">Simulation Channel</label>
                      <select
                        value={simType}
                        onChange={(e) => setSimType(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="whatsapp">WhatsApp Inbound Message</option>
                        <option value="facebook">Facebook Lead Ad Instant Form</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-medium text-gray-700 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={simName}
                        onChange={(e) => setSimName(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-gray-700 block mb-1">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={simPhone}
                        onChange={(e) => setSimPhone(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-gray-700 block mb-1">{simType === 'facebook' ? 'Email Address' : 'Course Interest'}</label>
                      {simType === 'facebook' ? (
                        <input
                          type="email"
                          required
                          value={simEmail}
                          onChange={(e) => setSimEmail(e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={simCourse}
                          onChange={(e) => setSimCourse(e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      )}
                    </div>
                  </div>

                  {simType === 'whatsapp' && (
                    <div className="text-xs">
                      <label className="font-medium text-gray-700 block mb-1">Simulated Message Text</label>
                      <textarea
                        rows={2}
                        value={simMessage}
                        onChange={(e) => setSimMessage(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {simResult && (
                    <div className={cn("p-3 rounded-md text-xs font-medium border", simResult.type === 'success' ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200")}>
                      {simResult.type === 'success' ? (
                        <div>
                          <p className="font-semibold">{simResult.data.message}</p>
                          <p className="text-[11px] mt-0.5 opacity-90">Lead ID: #{simResult.data.leadId} {simResult.data.isNew ? '(New Lead Created)' : '(Existing Lead Updated)'}</p>
                        </div>
                      ) : (
                        <p>{simResult.message}</p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={simLoading}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white transition shadow-sm",
                        simType === 'whatsapp' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
                      )}
                    >
                      <Send className="h-4 w-4" />
                      {simLoading ? 'Simulating...' : `Simulate ${simType === 'whatsapp' ? 'WhatsApp' : 'Facebook'} Lead`}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h2>
              <div className="space-y-6">
                {[
                  { title: 'Email Notifications', desc: 'Receive daily summary emails.', icon: Mail, checked: true },
                  { title: 'Push Notifications', desc: 'Get alerted instantly on new leads.', icon: Smartphone, checked: false },
                  { title: 'Browser Alerts', desc: 'Show desktop notifications.', icon: Globe, checked: true },
                ].map((pref, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-1 bg-gray-100 p-2 rounded-lg">
                      <pref.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{pref.title}</h3>
                      <p className="text-sm text-gray-500">{pref.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={pref.checked} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
                
                <div className="pt-4 flex justify-end border-t mt-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition">
                    <Save className="h-4 w-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Security</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Change Password</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    {passwordMessage.text && (
                      <div className={cn("p-3 rounded-md text-sm", passwordMessage.type === 'error' ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700")}>
                        {passwordMessage.text}
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <button type="submit" disabled={isChangingPassword} className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm font-medium hover:bg-gray-900 transition mt-2 disabled:opacity-50">
                      {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                <div className="border-t pt-6 mt-6">
                  <h3 className="text-sm font-medium text-red-600 mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Two-Factor Authentication (2FA)
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">Add an extra layer of security to your account by enabling 2FA.</p>
                  <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
