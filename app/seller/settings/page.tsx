'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SubscriptionInfo from '@/app/components/SubscriptionInfo';

interface Company {
  id: string;
  name: string;
  business_name: string;
  address: string;
  ntn_number: string;
  gst_number: string;
  fbr_token: string;
  logo_url: string;
  province: string;
  phone: string;
  email: string;
}

interface Settings {
  id: string;
  company_id: string;
  invoice_prefix: string;
  invoice_counter: number;
  default_sales_tax_rate: number;
  default_further_tax_rate: number;
  default_scenario: string;
  default_uom: string;
  invoice_template: string;
  default_items_per_page: number;
  default_hs_code?: string;
  letterhead_top_space?: number;
  letterhead_show_qr?: boolean;
  other_settings: any;
}

interface Template {
  id: string;
  name: string;
  description: string;
  template_key: string;
  preview_image_url: string;
  is_paid: boolean;
  price: number;
  features: string[];
  has_access: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('company');
  const [saving, setSaving] = useState(false);
  const [selectedTemplatePreview, setSelectedTemplatePreview] = useState<string | null>(null);

  // Form states
  const [companyForm, setCompanyForm] = useState({
    name: '',
    business_name: '',
    address: '',
    ntn_number: '',
    gst_number: '',
    fbr_token: '',
    logo_url: '',
    province: '',
    phone: '',
    email: '',
  });

  const [settingsForm, setSettingsForm] = useState({
    invoice_prefix: 'INV',
    invoice_counter: 1,
    default_hs_code: '',
    default_sales_tax_rate: 18.0,
    default_further_tax_rate: 0.0,
    default_scenario: 'SN002',
    default_uom: 'Numbers, pieces, units',
    invoice_template: 'modern',
    default_items_per_page: 10,
    letterhead_top_space: 120,
    letterhead_show_qr: true,
  });

  const [whatsappForm, setWhatsappForm] = useState({
    whatsapp_number: '',
    whatsapp_enabled: false,
    whatsapp_message_template: '',
    whatsapp_api_mode: 'link',
    whatsapp_phone_number_id: '',
    whatsapp_access_token: '',
    whatsapp_business_account_id: '',
  });

  const [emailForm, setEmailForm] = useState({
    email_enabled: false,
    smtp_host: '',
    smtp_port: 587,
    smtp_secure: 'tls',
    smtp_user: '',
    smtp_password: '',
    smtp_from_email: '',
    smtp_from_name: '',
    email_subject_template: '',
    email_body_template: '',
  });

  const [testingEmail, setTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }
    setUser(JSON.parse(session));
  }, [router]);

  const companyId = user?.company_id;

  // Fetch settings with React Query
  const { data: settingsData, isLoading: loading } = useQuery({
    queryKey: ['settings', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/seller/settings?company_id=${companyId}`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes - settings don't change often
    refetchOnWindowFocus: false,
  });

  // Fetch templates with React Query
  const { data: templatesData } = useQuery({
    queryKey: ['templates', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/seller/templates?company_id=${companyId}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      return data.templates || [];
    },
    enabled: !!companyId,
    staleTime: 10 * 60 * 1000, // 10 minutes - templates rarely change
    refetchOnWindowFocus: false,
  });

  const company = settingsData?.company || null;
  const settings = settingsData?.settings || null;
  const templates = templatesData || [];

  // Update forms when data loads
  useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name || '',
        business_name: company.business_name || '',
        address: company.address || '',
        ntn_number: company.ntn_number || '',
        gst_number: company.gst_number || '',
        fbr_token: company.fbr_token || '',
        logo_url: company.logo_url || '',
        province: company.province || '',
        phone: company.phone || '',
        email: company.email || '',
      });
    }
  }, [company]);

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        invoice_prefix: settings.invoice_prefix || 'INV',
        invoice_counter: settings.invoice_counter || 1,
        default_hs_code: settings.default_hs_code ?? settings.other_settings?.default_hs_code ?? '',
        default_sales_tax_rate: settings.default_sales_tax_rate || 18.0,
        default_further_tax_rate: settings.default_further_tax_rate || 0.0,
        default_scenario: settings.default_scenario || 'SN002',
        default_uom: settings.default_uom || 'Numbers, pieces, units',
        invoice_template: settings.invoice_template || 'modern',
        default_items_per_page: settings.default_items_per_page || 10,
        letterhead_top_space: settings.letterhead_top_space ?? settings.other_settings?.letterhead_top_space ?? 120,
        letterhead_show_qr: settings.letterhead_show_qr ?? settings.other_settings?.letterhead_show_qr ?? true,
      });

      // Load WhatsApp settings
      if (settings.other_settings?.whatsapp) {
        setWhatsappForm(settings.other_settings.whatsapp);
      }

      // Load Email settings
      if (settings.other_settings?.email) {
        setEmailForm(settings.other_settings.email);
      }
    }
  }, [settings]);



  // loadTemplates removed - now using React Query above

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate NTN format if provided (alphanumeric with dashes allowed)
      const ntnCleaned = companyForm.ntn_number.replace(/-/g, '');
      // if (companyForm.ntn_number && ntnCleaned.length < 7) {
      //   alert('NTN must be either 7 digits (NTN) or 13 digits (CNIC). Dashes are allowed but not counted.');
      //   setSaving(false);
      //   return;
      // }

      const session = localStorage.getItem('seller_session');
      if (!session) return;

      const userData = JSON.parse(session);
      const companyId = userData.company_id;

      const response = await fetch('/api/seller/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          company_data: companyForm,
        }),
      });

      if (response.ok) {
        alert('Company information updated successfully!');
        queryClient.invalidateQueries({ queryKey: ['settings'] });
      } else {
        alert('Failed to update company information');
      }
    } catch (error) {
      console.error('Error saving company:', error);
      alert('Error saving company information');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async (e?: React.FormEvent, customSettings?: any) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      const session = localStorage.getItem('seller_session');
      if (!session) return;

      const userData = JSON.parse(session);
      const companyId = userData.company_id;

      const settingsToSave = customSettings || settingsForm;

      const response = await fetch('/api/seller/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          settings_data: settingsToSave,
        }),
      });

      if (response.ok) {
        alert('Invoice settings updated successfully!');
        queryClient.invalidateQueries({ queryKey: ['settings'] });
      } else {
        alert('Failed to update invoice settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving invoice settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectTemplate = async (templateKey: string) => {
    const newSettings = { ...settingsForm, invoice_template: templateKey };
    setSettingsForm(newSettings);
    await handleSaveSettings(undefined, newSettings);
  };

  const handleTestEmailConnection = async () => {
    setTestingEmail(true);
    setEmailTestResult(null);

    try {
      const response = await fetch('/api/seller/email/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailForm),
      });

      const data = await response.json();

      if (data.success) {
        setEmailTestResult({
          success: true,
          message: data.message || 'Connection successful!',
        });
      } else {
        setEmailTestResult({
          success: false,
          message: data.error || 'Connection failed',
        });
      }
    } catch (error: any) {
      setEmailTestResult({
        success: false,
        message: error.message || 'Failed to test connection',
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    alert('Password change functionality will be implemented soon!');
    setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⚙️</div>
          <div className="text-lg text-gray-600">Loading settings...</div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'company', name: 'Company Information', icon: '🏢' },
    { id: 'invoice', name: 'Invoice Settings', icon: '📄' },
    { id: 'tax', name: 'Tax Configuration', icon: '💰' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'templates', name: 'Templates', icon: '🎨' },
    { id: 'preferences', name: 'Preferences', icon: '⚙️' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your company settings and preferences</p>
      </div>

      {/* Subscription Info - Non-blocking informational display */}
      <SubscriptionInfo />

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Company Information Tab */}
        {activeTab === 'company' && (
          <form onSubmit={handleSaveCompany}>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Company Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyForm.business_name}
                  onChange={(e) => setCompanyForm({ ...companyForm, business_name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NTN Number <span className="text-blue-600 text-xs">(Required for FBR - 7 digits)</span>
                </label>
                <input
                  type="text"
                  value={companyForm.ntn_number}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9A-Za-z-]/g, ''); // allow digits, letters, and dashes
                    setCompanyForm({ ...companyForm, ntn_number: value });
                  }}

                  placeholder="e.g., 1234567 or ABC1234"
                  maxLength={20}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter NTN number (can contain digits, letters, and dashes). Current: {companyForm.ntn_number.length} characters
                  {/* {companyForm.ntn_number.replace(/-/g, '').length > 0 && companyForm.ntn_number.replace(/-/g, '').length !== 7 && companyForm.ntn_number.replace(/-/g, '').length !== 13 && (
                      <span className="text-red-600 font-semibold"> ⚠️ Invalid length</span>
                    )} */}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  value={companyForm.gst_number}
                  onChange={(e) => setCompanyForm({ ...companyForm, gst_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province <span className="text-red-500">*</span>
                </label>
                <select
                  value={companyForm.province}
                  onChange={(e) => setCompanyForm({ ...companyForm, province: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Province</option>
                  <option value="Sindh">Sindh</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                  <option value="Azad Kashmir">Azad Kashmir</option>
                  <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  placeholder="+92-XXX-XXXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  placeholder="company@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  FBR Token <span className="text-blue-600 text-xs">(Required for FBR Validation)</span>
                </label>
                <input
                  type="text"
                  value={companyForm.fbr_token}
                  onChange={(e) => setCompanyForm({ ...companyForm, fbr_token: e.target.value })}
                  placeholder="Enter your FBR API token"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    This token is required to validate invoices with FBR. Get it from FBR portal.
                  </p>
                  <a
                    href="/seller/fbr-sandbox"
                    target="_blank"
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold whitespace-nowrap ml-4"
                  >
                    🧪 Test Sandbox API →
                  </a>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo URL
                </label>
                <input
                  type="text"
                  value={companyForm.logo_url}
                  onChange={(e) => setCompanyForm({ ...companyForm, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload your logo to an image hosting service and paste the URL here.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Company Information'}
              </button>
            </div>
          </form>
        )}

        {/* Invoice Settings Tab */}
        {activeTab === 'invoice' && (
          <form onSubmit={handleSaveSettings}>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Invoice Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Prefix <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={settingsForm.invoice_prefix}
                  onChange={(e) => setSettingsForm({ ...settingsForm, invoice_prefix: e.target.value })}
                  required
                  placeholder="INV"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Prefix for invoice numbers (e.g., INV-2025-00001)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Counter <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={settingsForm.invoice_counter}
                  onChange={(e) => setSettingsForm({ ...settingsForm, invoice_counter: parseInt(e.target.value) })}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Next invoice number will be {settingsForm.invoice_counter}
                </p>
              </div>

              {/* Default HS Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default HS Code
                </label>
                <input
                  type="text"
                  value={settingsForm.default_hs_code}
                  onChange={(e) => setSettingsForm({ ...settingsForm, default_hs_code: e.target.value })}
                  placeholder="e.g., 7304.3900"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This HS Code will auto-fill when adding new invoice items
                </p>
              </div>

              <div className="md:col-span-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">📋 Invoice Number Format</h3>
                  <p className="text-sm text-blue-800">
                    Your invoices will be numbered as: <strong>{settingsForm.invoice_prefix}{settingsForm.invoice_counter}</strong>
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Next invoice: <strong>{settingsForm.invoice_prefix}{settingsForm.invoice_counter}</strong>, then <strong>{settingsForm.invoice_prefix}{settingsForm.invoice_counter + 1}</strong>, etc.
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    Example: INV-2025-00001, INV-2025-00002, etc.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Invoice Settings'}
              </button>
            </div>
          </form>
        )}

        {/* Tax Configuration Tab */}
        {activeTab === 'tax' && (
          <form onSubmit={handleSaveSettings}>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tax Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Sales Tax Rate (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settingsForm.default_sales_tax_rate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, default_sales_tax_rate: parseFloat(e.target.value) })}
                  required
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Standard sales tax rate in Pakistan is 18%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Further Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settingsForm.default_further_tax_rate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, default_further_tax_rate: parseFloat(e.target.value) })}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Additional tax rate (optional)
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default FBR Scenario <span className="text-red-500">*</span>
                </label>
                <select
                  value={settingsForm.default_scenario}
                  onChange={(e) => setSettingsForm({ ...settingsForm, default_scenario: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SN002">SN002 – Goods at Standard Rate to Unregistered Buyers</option>
                  <option value="SN001">SN001 – Goods at Standard Rate to Registered Buyers</option>
                  <option value="SN005">SN005 – Reduced Rate Sale</option>
                  <option value="SN006">SN006 – Exempt Goods Sale</option>
                  <option value="SN007">SN007 – Zero Rated Sale</option>
                  <option value="SN016">SN016 – Processing / Conversion of Goods</option>
                  <option value="SN017">SN017 – Sale of Goods where FED is Charged in ST Mode</option>
                  <option value="SN018">SN018 – Sale of Services where FED is Charged in ST Mode</option>
                  <option value="SN019">SN019 – Sale of Services</option>
                  <option value="SN024">SN024 – Goods Sold that are Listed in SRO 297(1)/2023</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  This scenario will be automatically selected when creating new invoices
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Unit of Measurement (UOM) <span className="text-red-500">*</span>
                </label>
                <select
                  value={settingsForm.default_uom}
                  onChange={(e) => setSettingsForm({ ...settingsForm, default_uom: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Numbers, pieces, units">Numbers, pieces, units</option>
                  <option value="Kilograms">Kilograms</option>
                  <option value="Grams">Grams</option>
                  <option value="Meters">Meters</option>
                  <option value="Centimeters">Centimeters</option>
                  <option value="Liters">Liters</option>
                  <option value="Milliliters">Milliliters</option>
                  <option value="Dozens">Dozens</option>
                  <option value="Boxes">Boxes</option>
                  <option value="Cartons">Cartons</option>
                  <option value="Pairs">Pairs</option>
                  <option value="Sets">Sets</option>
                  <option value="Square meters">Square meters</option>
                  <option value="Cubic meters">Cubic meters</option>
                  <option value="Tons">Tons</option>
                  <option value="Bags">Bags</option>
                  <option value="Bottles">Bottles</option>
                  <option value="Cans">Cans</option>
                  <option value="Packets">Packets</option>
                  <option value="Rolls">Rolls</option>
                  <option value="Sheets">Sheets</option>
                  <option value="Hours">Hours</option>
                  <option value="Days">Days</option>
                  <option value="Months">Months</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  This unit will be automatically selected for the first item when creating new invoices
                </p>
              </div>

              <div className="md:col-span-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-green-900 mb-2">💡 Tax Calculation Preview</h3>
                  <div className="text-sm text-green-800 space-y-1">
                    <p>For a product worth PKR 1,000:</p>
                    <p>• Sales Tax ({settingsForm.default_sales_tax_rate}%): PKR {(1000 * settingsForm.default_sales_tax_rate / 100).toFixed(2)}</p>
                    <p>• Further Tax ({settingsForm.default_further_tax_rate}%): PKR {(1000 * settingsForm.default_further_tax_rate / 100).toFixed(2)}</p>
                    <p className="font-semibold pt-2 border-t border-green-300">
                      Total: PKR {(1000 + (1000 * settingsForm.default_sales_tax_rate / 100) + (1000 * settingsForm.default_further_tax_rate / 100)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Per Page */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Items Per Page
                </label>
                <select
                  value={settingsForm.default_items_per_page}
                  onChange={(e) => setSettingsForm({ ...settingsForm, default_items_per_page: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={10}>10 items</option>
                  <option value={25}>25 items</option>
                  <option value={50}>50 items</option>
                  <option value={100}>100 items</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Default number of invoices to display per page
                </p>
              </div>

              <div className="md:col-span-2">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Important Note</h3>
                  <p className="text-sm text-yellow-800">
                    These are default values that will be pre-filled when creating new invoices.
                    You can still change tax rates for individual invoices.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Tax Configuration'}
              </button>
            </div>
          </form>
        )}

        {/* WhatsApp Tab */}
        {activeTab === 'whatsapp' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">WhatsApp Integration</h2>
            <p className="text-gray-600 mb-6">
              Connect your WhatsApp Business account and send invoices directly to your customers.
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              try {
                const session = localStorage.getItem('seller_session');
                if (!session) return;
                const userData = JSON.parse(session);
                const companyId = userData.company_id;

                const response = await fetch('/api/seller/settings', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    company_id: companyId,
                    company_data: whatsappForm,
                  }),
                });

                if (response.ok) {
                  alert('WhatsApp settings updated successfully!');
                  queryClient.invalidateQueries({ queryKey: ['settings'] });
                } else {
                  alert('Failed to update WhatsApp settings');
                }
              } catch (error) {
                console.error('Error saving WhatsApp settings:', error);
                alert('Error saving WhatsApp settings');
              } finally {
                setSaving(false);
              }
            }}>
              <div className="space-y-6">
                {/* Enable WhatsApp */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={whatsappForm.whatsapp_enabled}
                          onChange={(e) => setWhatsappForm({ ...whatsappForm, whatsapp_enabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        Enable WhatsApp Integration
                      </h3>
                      <p className="text-sm text-blue-800">
                        Turn on to send invoices directly to customers via WhatsApp. They&apos;ll receive a professional message with invoice details instantly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Integration Mode Selection */}
                {whatsappForm.whatsapp_enabled && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4">🔌 Choose Integration Mode</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Link Mode */}
                      <div
                        onClick={() => setWhatsappForm({ ...whatsappForm, whatsapp_api_mode: 'link' })}
                        className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${whatsappForm.whatsapp_api_mode === 'link'
                          ? 'border-green-500 bg-green-50 shadow-lg'
                          : 'border-gray-300 bg-white hover:border-green-300'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            checked={whatsappForm.whatsapp_api_mode === 'link'}
                            onChange={() => setWhatsappForm({ ...whatsappForm, whatsapp_api_mode: 'link' })}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">🔗 Link Mode (Simple)</h4>
                            <p className="text-sm text-gray-600 mb-2">Opens WhatsApp with pre-filled message</p>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <span className="text-green-600">✓</span>
                                <span>No setup required</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-green-600">✓</span>
                                <span>100% Free</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-green-600">✓</span>
                                <span>Works immediately</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-orange-600">⚠</span>
                                <span>Manual send required</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* API Mode */}
                      <div
                        onClick={() => setWhatsappForm({ ...whatsappForm, whatsapp_api_mode: 'api' })}
                        className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${whatsappForm.whatsapp_api_mode === 'api'
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-300 bg-white hover:border-blue-300'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            checked={whatsappForm.whatsapp_api_mode === 'api'}
                            onChange={() => setWhatsappForm({ ...whatsappForm, whatsapp_api_mode: 'api' })}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">⚡ Cloud API (Advanced)</h4>
                            <p className="text-sm text-gray-600 mb-2">Automated sending with PDF attachment</p>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <span className="text-green-600">✓</span>
                                <span>Fully automated</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-green-600">✓</span>
                                <span>PDF attachment included</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-green-600">✓</span>
                                <span>Track delivery status</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-blue-600">ℹ</span>
                                <span>Requires Meta setup</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* WhatsApp Number */}
                {whatsappForm.whatsapp_enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Business Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={whatsappForm.whatsapp_number}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9+]/g, '');
                        setWhatsappForm({ ...whatsappForm, whatsapp_number: value });
                      }}
                      placeholder="923001234567 or +923001234567"
                      required={whatsappForm.whatsapp_enabled}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your WhatsApp Business number in international format (e.g., 923001234567 for Pakistan)
                    </p>
                  </div>
                )}

                {/* Cloud API Configuration */}
                {whatsappForm.whatsapp_enabled && whatsappForm.whatsapp_api_mode === 'api' && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-blue-900 mb-1">☁️ WhatsApp Cloud API Configuration</h3>
                        <p className="text-sm text-blue-700">Connect your Meta WhatsApp Business Account</p>
                      </div>
                      <a
                        href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
                      >
                        📚 Setup Guide
                      </a>
                    </div>

                    <div className="space-y-4">
                      {/* Phone Number ID */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={whatsappForm.whatsapp_phone_number_id}
                          onChange={(e) => setWhatsappForm({ ...whatsappForm, whatsapp_phone_number_id: e.target.value })}
                          placeholder="Enter Phone Number ID from Meta"
                          required={whatsappForm.whatsapp_api_mode === 'api'}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Find this in Meta Business Suite → WhatsApp → API Setup
                        </p>
                      </div>

                      {/* Access Token */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Access Token <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={whatsappForm.whatsapp_access_token}
                          onChange={(e) => setWhatsappForm({ ...whatsappForm, whatsapp_access_token: e.target.value })}
                          placeholder="Enter your permanent Access Token"
                          required={whatsappForm.whatsapp_api_mode === 'api'}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Generate a System User Token for permanent access (recommended for production)
                        </p>
                      </div>

                      {/* Business Account ID */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Business Account ID <span className="text-gray-500">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={whatsappForm.whatsapp_business_account_id}
                          onChange={(e) => setWhatsappForm({ ...whatsappForm, whatsapp_business_account_id: e.target.value })}
                          placeholder="Enter Business Account ID"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Your WhatsApp Business Account ID from Meta
                        </p>
                      </div>

                      {/* Setup Instructions */}
                      <div className="bg-white border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-xl">🚀</span>
                          <span>Quick Setup Steps</span>
                        </h4>
                        <ol className="space-y-2 text-sm text-gray-700">
                          <li className="flex gap-2">
                            <span className="font-bold text-blue-600">1.</span>
                            <span>Create a <a href="https://business.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Meta Business Account</a></span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-bold text-blue-600">2.</span>
                            <span>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Meta for Developers</a> and create an app</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-bold text-blue-600">3.</span>
                            <span>Add WhatsApp product to your app</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-bold text-blue-600">4.</span>
                            <span>Get your Phone Number ID and generate Access Token</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-bold text-blue-600">5.</span>
                            <span>Paste the credentials above and save</span>
                          </li>
                        </ol>
                      </div>

                      {/* Pricing Info */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                          <span className="text-xl">💰</span>
                          <span>Pricing</span>
                        </h4>
                        <div className="text-sm text-green-800 space-y-1">
                          <p><strong>First 1,000 conversations/month:</strong> FREE 🎉</p>
                          <p><strong>After that:</strong> ~$0.01-0.09 per conversation (varies by country)</p>
                          <p className="text-xs text-green-700 mt-2">
                            💡 Much cheaper than SMS and more effective!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message Template */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Template
                  </label>
                  <textarea
                    value={whatsappForm.whatsapp_message_template}
                    onChange={(e) => setWhatsappForm({ ...whatsappForm, whatsapp_message_template: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Enter your custom message template..."
                  />
                  <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Placeholders:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div><code className="bg-gray-200 px-2 py-1 rounded">{'{customer_name}'}</code> - Customer name</div>
                      <div><code className="bg-gray-200 px-2 py-1 rounded">{'{invoice_number}'}</code> - Invoice number</div>
                      <div><code className="bg-gray-200 px-2 py-1 rounded">{'{total_amount}'}</code> - Total amount</div>
                      <div><code className="bg-gray-200 px-2 py-1 rounded">{'{invoice_date}'}</code> - Invoice date</div>
                      <div><code className="bg-gray-200 px-2 py-1 rounded">{'{company_name}'}</code> - Your company name</div>
                      <div><code className="bg-gray-200 px-2 py-1 rounded">{'{subtotal}'}</code> - Subtotal amount</div>
                      <div><code className="bg-gray-200 px-2 py-1 rounded">{'{payment_status}'}</code> - Payment status</div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {whatsappForm.whatsapp_message_template && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Message Preview:</h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {whatsappForm.whatsapp_message_template
                            .replace(/{customer_name}/g, 'John Doe')
                            .replace(/{invoice_number}/g, 'INV-2025-00001')
                            .replace(/{total_amount}/g, '50,000')
                            .replace(/{invoice_date}/g, new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' }))
                            .replace(/{company_name}/g, companyForm.name || 'Your Company')
                            .replace(/{subtotal}/g, '42,373')
                            .replace(/{payment_status}/g, 'PENDING')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* How it Works */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 How It Works</h3>
                  <ol className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <span>Configure your WhatsApp Business number above and enable the integration</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <span>When viewing an invoice, click the &quot;Send via WhatsApp&quot; button</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      <span>WhatsApp will open with a pre-filled message ready to send to your customer</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                      <span>Click send and your customer receives the invoice details instantly!</span>
                    </li>
                  </ol>
                </div>

                {/* Benefits */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">✨ Benefits</h3>
                  <ul className="space-y-2 text-sm text-yellow-800">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Instant delivery - customers receive invoices immediately</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Professional communication - branded messages with your company name</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Higher engagement - customers are more likely to see WhatsApp messages</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Easy follow-up - continue the conversation in the same chat</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>No additional cost - uses your existing WhatsApp Business account</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                >
                  {saving ? 'Saving...' : '💾 Save WhatsApp Settings'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Email Tab */}
        {activeTab === 'email' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Integration</h2>
            <p className="text-gray-600 mb-6">
              Configure SMTP settings to send professional invoice emails with PDF attachments.
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              try {
                const session = localStorage.getItem('seller_session');
                if (!session) return;
                const userData = JSON.parse(session);
                const companyId = userData.company_id;

                const response = await fetch('/api/seller/settings', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    company_id: companyId,
                    company_data: emailForm,
                  }),
                });

                if (response.ok) {
                  alert('Email settings updated successfully!');
                  queryClient.invalidateQueries({ queryKey: ['settings'] });
                } else {
                  alert('Failed to update email settings');
                }
              } catch (error) {
                console.error('Error saving email settings:', error);
                alert('Error saving email settings');
              } finally {
                setSaving(false);
              }
            }}>
              <div className="space-y-6">
                {/* Enable Email */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailForm.email_enabled}
                          onChange={(e) => setEmailForm({ ...emailForm, email_enabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        Enable Email Integration
                      </h3>
                      <p className="text-sm text-blue-800">
                        Send professional invoice emails with PDF attachments directly to your customers.
                      </p>
                    </div>
                  </div>
                </div>

                {emailForm.email_enabled && (
                  <>
                    {/* SMTP Provider Selection */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-4">📮 Choose Email Provider</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { id: 'gmail', name: 'Gmail', icon: '📧' },
                          { id: 'outlook', name: 'Outlook', icon: '📨' },
                          { id: 'yahoo', name: 'Yahoo', icon: '📬' },
                          { id: 'sendgrid', name: 'SendGrid', icon: '🚀' },
                          { id: 'mailgun', name: 'Mailgun', icon: '💌' },
                          { id: 'custom', name: 'Custom SMTP', icon: '⚙️' },
                        ].map((provider) => (
                          <button
                            key={provider.id}
                            type="button"
                            onClick={() => {
                              const configs: any = {
                                gmail: { smtp_host: 'smtp.gmail.com', smtp_port: 587, smtp_secure: 'tls' },
                                outlook: { smtp_host: 'smtp-mail.outlook.com', smtp_port: 587, smtp_secure: 'tls' },
                                yahoo: { smtp_host: 'smtp.mail.yahoo.com', smtp_port: 587, smtp_secure: 'tls' },
                                sendgrid: { smtp_host: 'smtp.sendgrid.net', smtp_port: 587, smtp_secure: 'tls' },
                                mailgun: { smtp_host: 'smtp.mailgun.org', smtp_port: 587, smtp_secure: 'tls' },
                                custom: { smtp_host: '', smtp_port: 587, smtp_secure: 'tls' },
                              };
                              setEmailForm({ ...emailForm, ...configs[provider.id] });
                            }}
                            className="p-3 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center"
                          >
                            <div className="text-2xl mb-1">{provider.icon}</div>
                            <div className="text-sm font-semibold">{provider.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SMTP Configuration */}
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 SMTP Configuration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP Host <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={emailForm.smtp_host}
                            onChange={(e) => setEmailForm({ ...emailForm, smtp_host: e.target.value })}
                            placeholder="smtp.gmail.com"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Port <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={emailForm.smtp_port}
                            onChange={(e) => setEmailForm({ ...emailForm, smtp_port: parseInt(e.target.value) })}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Security <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={emailForm.smtp_secure}
                            onChange={(e) => setEmailForm({ ...emailForm, smtp_secure: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="tls">TLS (587)</option>
                            <option value="ssl">SSL (465)</option>
                            <option value="none">None (25)</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username / Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={emailForm.smtp_user}
                            onChange={(e) => setEmailForm({ ...emailForm, smtp_user: e.target.value })}
                            placeholder="your-email@gmail.com"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password / App Password <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            value={emailForm.smtp_password}
                            onChange={(e) => setEmailForm({ ...emailForm, smtp_password: e.target.value })}
                            placeholder="Enter password or app-specific password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-orange-600 mt-1">
                            ⚠️ For Gmail: Use App Password, not your regular password. Enable 2FA first.
                          </p>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            From Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={emailForm.smtp_from_email}
                            onChange={(e) => setEmailForm({ ...emailForm, smtp_from_email: e.target.value })}
                            placeholder="invoices@yourcompany.com"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            From Name
                          </label>
                          <input
                            type="text"
                            value={emailForm.smtp_from_name}
                            onChange={(e) => setEmailForm({ ...emailForm, smtp_from_name: e.target.value })}
                            placeholder="Your Company Name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Test Connection Button */}
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleTestEmailConnection}
                          disabled={testingEmail || !emailForm.smtp_host || !emailForm.smtp_user || !emailForm.smtp_password}
                          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-semibold flex items-center gap-2"
                        >
                          {testingEmail ? (
                            <>
                              <span className="animate-spin">⚙️</span>
                              <span>Testing...</span>
                            </>
                          ) : (
                            <>
                              <span>🔌</span>
                              <span>Test Connection</span>
                            </>
                          )}
                        </button>

                        {emailTestResult && (
                          <div className={`flex-1 px-4 py-2 rounded-lg ${emailTestResult.success
                            ? 'bg-green-100 border border-green-300 text-green-800'
                            : 'bg-red-100 border border-red-300 text-red-800'
                            }`}>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{emailTestResult.success ? '✅' : '❌'}</span>
                              <span className="text-sm font-medium">{emailTestResult.message}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email Templates */}
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-4">✉️ Email Templates</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Subject Template
                          </label>
                          <input
                            type="text"
                            value={emailForm.email_subject_template}
                            onChange={(e) => setEmailForm({ ...emailForm, email_subject_template: e.target.value })}
                            placeholder="Invoice {invoice_number} from {company_name}"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Body Template
                          </label>
                          <textarea
                            value={emailForm.email_body_template}
                            onChange={(e) => setEmailForm({ ...emailForm, email_body_template: e.target.value })}
                            rows={8}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
                          />
                        </div>

                        <div className="bg-white border border-green-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Placeholders:</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div><code className="bg-gray-200 px-2 py-1 rounded">{'{customer_name}'}</code></div>
                            <div><code className="bg-gray-200 px-2 py-1 rounded">{'{invoice_number}'}</code></div>
                            <div><code className="bg-gray-200 px-2 py-1 rounded">{'{total_amount}'}</code></div>
                            <div><code className="bg-gray-200 px-2 py-1 rounded">{'{invoice_date}'}</code></div>
                            <div><code className="bg-gray-200 px-2 py-1 rounded">{'{company_name}'}</code></div>
                            <div><code className="bg-gray-200 px-2 py-1 rounded">{'{payment_status}'}</code></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Setup Guides */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Gmail Guide */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="text-base font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                          <span>📧</span>
                          <span>Gmail Setup</span>
                        </h3>
                        <ol className="space-y-1 text-xs text-yellow-800">
                          <li className="flex gap-2">
                            <span className="font-bold">1.</span>
                            <span>Enable 2FA on Gmail</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-bold">2.</span>
                            <span>Go to Security → App Passwords</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-bold">3.</span>
                            <span>Generate App Password</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-bold">4.</span>
                            <span>Use App Password above</span>
                          </li>
                        </ol>
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                        >
                          → Generate Gmail App Password
                        </a>
                      </div>

                      {/* Outlook Guide */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-base font-semibold text-blue-900 mb-2 flex items-center gap-2">
                          <span>📨</span>
                          <span>Outlook Setup</span>
                        </h3>
                        <ol className="space-y-1 text-xs text-blue-800">
                          <li className="flex gap-2">
                            <span className="font-bold">1.</span>
                            <span>Enable 2FA on Microsoft Account</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-bold">2.</span>
                            <span>Go to Security → App Passwords</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-bold">3.</span>
                            <span>Create new App Password</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-bold">4.</span>
                            <span>Use App Password above</span>
                          </li>
                        </ol>
                        <a
                          href="https://account.microsoft.com/security"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                        >
                          → Generate Outlook App Password
                        </a>
                      </div>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                      <h3 className="text-base font-semibold text-red-900 mb-2 flex items-center gap-2">
                        <span className="text-xl">⚠️</span>
                        <span>Important: Regular Passwords Don&apos;t Work!</span>
                      </h3>
                      <p className="text-sm text-red-800 mb-2">
                        Gmail and Outlook have disabled basic authentication. You <strong>MUST</strong> use an App Password.
                      </p>
                      <ul className="text-xs text-red-700 space-y-1 ml-4">
                        <li>❌ Regular email password = Won&apos;t work</li>
                        <li>✅ App Password = Works perfectly</li>
                      </ul>
                      <p className="text-xs text-red-600 mt-2 font-semibold">
                        Error &quot;basic authentication is disabled&quot;? → You need an App Password!
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                >
                  {saving ? 'Saving...' : '💾 Save Email Settings'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>

            {/* Change Password */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
              <form onSubmit={handleChangePassword}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      required
                      minLength={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 6 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      required
                      minLength={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>

            {/* FBR Integration */}
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">FBR Integration</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    FBR API Token
                  </label>
                  <input
                    type="password"
                    value={companyForm.fbr_token}
                    onChange={(e) => setCompanyForm({ ...companyForm, fbr_token: e.target.value })}
                    placeholder="Enter your FBR API token"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for posting invoices to FBR
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">🔐 Security Information</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Your FBR token is encrypted and stored securely</li>
                    <li>Never share your FBR token with anyone</li>
                    <li>Contact FBR support if you need to regenerate your token</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveCompany}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {saving ? 'Saving...' : 'Save FBR Token'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invoice Templates</h2>
            <p className="text-gray-600 mb-6">
              Choose from our collection of professional invoice templates. Preview templates with sample data before selecting.
            </p>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading templates...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template: Template) => (
                  <div
                    key={template.id}
                    className={`border-2 rounded-lg overflow-hidden transition-all ${settingsForm.invoice_template === template.template_key
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      } ${!template.has_access ? 'opacity-75' : ''}`}
                  >
                    {/* Template Header */}
                    <div className={`p-4 ${template.has_access ? 'bg-white' : 'bg-gray-50'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            {template.name}
                            {template.is_paid && (
                              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-semibold">
                                PREMIUM
                              </span>
                            )}
                            {settingsForm.invoice_template === template.template_key && (
                              <span className="text-blue-600 text-xl">✓</span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        </div>
                      </div>

                      {template.is_paid && (
                        <div className="mt-2">
                          <p className="text-2xl font-bold text-gray-900">
                            PKR {parseFloat(template.price.toString()).toLocaleString('en-PK')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Template Preview */}
                    <div
                      className="bg-gray-100 p-4 cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() => setSelectedTemplatePreview(template.template_key)}
                    >
                      <div className="bg-white rounded shadow-sm p-4 text-xs">
                        {/* Mini preview based on template type */}
                        {template.template_key === 'modern' && (
                          <div>
                            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-2 rounded mb-2">
                              <div className="font-bold text-xs">INVOICE</div>
                              <div className="text-xs opacity-75">INV-2025-00001</div>
                            </div>
                            <div className="text-gray-600 space-y-1">
                              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        )}
                        {template.template_key === 'classic' && (
                          <div className="border-2 border-gray-800 p-2">
                            <div className="font-bold text-xs mb-1" style={{ fontFamily: 'serif' }}>INVOICE</div>
                            <div className="h-0.5 w-8 bg-gray-800 mb-1"></div>
                            <div className="text-xs text-gray-700" style={{ fontFamily: 'monospace' }}>INV-2025-00001</div>
                            <div className="mt-2 space-y-1">
                              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        )}
                        {template.template_key === 'excel' && (
                          <div className="border border-gray-400">
                            <div className="border-b border-gray-400 p-1 bg-gray-100">
                              <div className="font-bold text-xs">INVOICE</div>
                              <div className="text-xs text-gray-600">INV-2025-00001</div>
                            </div>
                            <table className="w-full text-xs">
                              <tbody>
                                <tr className="border-b border-gray-300">
                                  <td className="p-1 bg-gray-100 border-r border-gray-300 font-bold" style={{ width: '30%' }}>SELLER</td>
                                  <td className="p-1 text-gray-600">Company Name</td>
                                </tr>
                                <tr className="border-b border-gray-300">
                                  <td className="p-1 bg-gray-100 border-r border-gray-300 font-bold">BUYER</td>
                                  <td className="p-1 text-gray-600">Customer Name</td>
                                </tr>
                              </tbody>
                            </table>
                            <div className="p-1 border-t border-gray-400 bg-gray-100">
                              <div className="h-1.5 bg-gray-300 rounded w-full mb-0.5"></div>
                              <div className="h-1.5 bg-gray-300 rounded w-3/4"></div>
                            </div>
                          </div>
                        )}
                        {!['modern', 'classic', 'excel'].includes(template.template_key) && (
                          <div className="text-center py-4">
                            <div className="text-2xl mb-2">🎨</div>
                            <div className="text-xs text-gray-600">Click to preview</div>
                          </div>
                        )}
                      </div>
                      <p className="text-center text-xs text-gray-600 mt-2">
                        👁️ Click to view full preview
                      </p>
                    </div>

                    {/* Template Features */}
                    <div className="p-4 bg-white">
                      <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Features</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {template.features && template.features.length > 0 ? (
                          template.features.map((feature, index) => (
                            <li key={index}>✓ {feature}</li>
                          ))
                        ) : (
                          <li>✓ Professional invoice template</li>
                        )}
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      {template.has_access ? (
                        <button
                          onClick={() => handleSelectTemplate(template.template_key)}
                          disabled={saving || settingsForm.invoice_template === template.template_key}
                          className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${settingsForm.invoice_template === template.template_key
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                          {settingsForm.invoice_template === template.template_key ? '✓ Active Template' : 'Use This Template'}
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <button
                            onClick={() => setSelectedTemplatePreview(template.template_key)}
                            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                          >
                            👁️ Preview Template
                          </button>
                          <button
                            onClick={() => {
                              alert(
                                `To get access to the ${template.name}, please contact Super Admin.\n\n` +
                                `Template: ${template.name}\n` +
                                `Price: PKR ${parseFloat(template.price.toString()).toLocaleString('en-PK')}\n\n` +
                                `Email: admin@invoicesystem.com\n` +
                                `Phone: +92-XXX-XXXXXXX`
                              );
                            }}
                            className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold"
                          >
                            🔒 Contact for Access
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Full Template Preview Modal */}
            {selectedTemplatePreview && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedTemplatePreview(null)}
              >
                <div
                  className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">
                      {templates.find((t: Template) => t.template_key === selectedTemplatePreview)?.name} - Full Preview
                    </h3>
                    <button
                      onClick={() => setSelectedTemplatePreview(null)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-6">
                    <iframe
                      src={`/seller/invoices/preview?template=${selectedTemplatePreview}`}
                      className="w-full h-[600px] border border-gray-300 rounded"
                      title="Template Preview"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Letterhead Template Settings */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📄 Letterhead Template Settings</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configure settings for the Letterhead template (for pre-printed letterhead paper)
              </p>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Top Space (mm) <span className="text-blue-600 text-xs">- Space for pre-printed header</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={settingsForm.letterhead_top_space || 120}
                    onChange={(e) => setSettingsForm({ ...settingsForm, letterhead_top_space: parseInt(e.target.value) })}
                    className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 100-140mm. Adjust based on your letterhead design.
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settingsForm.letterhead_show_qr !== false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, letterhead_show_qr: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Show QR Code on Letterhead Template</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Display QR code for invoice verification (only for FBR posted invoices)
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleSaveSettings()}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                  >
                    {saving ? 'Saving...' : 'Save Letterhead Settings'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>

            <div className="space-y-6">

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo URL
                </label>
                <input
                  type="url"
                  value={companyForm.logo_url}
                  onChange={(e) => setCompanyForm({ ...companyForm, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Logo will appear on invoices and documents
                </p>
                {companyForm.logo_url && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Logo Preview:</p>
                    <img
                      src={companyForm.logo_url}
                      alt="Company Logo"
                      className="h-20 object-contain border border-gray-300 rounded-lg p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Date Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Format
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="PKR">PKR - Pakistani Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>

              {/* Notifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-700">Email notifications for new invoices</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-700">Email notifications for payments received</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-700">Email notifications for overdue invoices</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-700">Weekly summary reports</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveCompany}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

