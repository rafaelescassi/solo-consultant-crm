'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Upload, LogOut, Sun, Moon, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { updateProfile, uploadLogo } from '@/app/(dashboard)/settings/actions';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

interface SettingsFormProps {
  profile: Profile;
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(profile.logo_url);
  const [uploading, setUploading] = useState(false);

  // Business profile
  const [businessName, setBusinessName] = useState(profile.business_name || '');
  const [businessEmail, setBusinessEmail] = useState(profile.business_email || '');
  const [businessPhone, setBusinessPhone] = useState(profile.business_phone || '');
  const [businessAddress, setBusinessAddress] = useState(profile.business_address || '');
  const [businessWebsite, setBusinessWebsite] = useState(profile.business_website || '');

  // Invoice defaults
  const [invoicePrefix, setInvoicePrefix] = useState(profile.invoice_prefix || 'INV');
  const [defaultTaxRate, setDefaultTaxRate] = useState(profile.default_tax_rate || 0);
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState(profile.default_payment_terms || 30);
  const [currency, setCurrency] = useState(profile.currency || 'USD');
  const [bankDetails, setBankDetails] = useState(profile.bank_details || '');

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateProfile({
        business_name: businessName,
        business_email: businessEmail,
        business_phone: businessPhone,
        business_address: businessAddress,
        business_website: businessWebsite,
        invoice_prefix: invoicePrefix,
        default_tax_rate: defaultTaxRate,
        default_payment_terms: defaultPaymentTerms,
        currency,
        bank_details: bankDetails,
      });

      if (result.success) {
        toast.success('Settings saved');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadLogo(formData);

      if (result.success) {
        setLogoUrl(result.data);
        toast.success('Logo uploaded');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="max-w-[700px] space-y-6">
      {/* Business Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Business Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-lg border flex items-center justify-center overflow-hidden bg-muted">
              {logoUrl ? (
                <Image src={logoUrl} alt="Business logo" width={80} height={80} className="object-cover" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Logo'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, or SVG. Max 2MB.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input id="business_name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your Business Name" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_email">Business Email</Label>
              <Input id="business_email" type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} placeholder="hello@business.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_phone">Business Phone</Label>
              <Input id="business_phone" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_address">Business Address</Label>
            <Textarea id="business_address" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} placeholder="Full business address" rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_website">Website</Label>
            <Input id="business_website" value={businessWebsite} onChange={(e) => setBusinessWebsite(e.target.value)} placeholder="https://your-website.com" />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
              <Input id="invoice_prefix" value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} placeholder="INV" maxLength={10} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (&euro;)</SelectItem>
                  <SelectItem value="GBP">GBP (&pound;)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                  <SelectItem value="AUD">AUD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default_tax_rate">Default Tax Rate (%)</Label>
              <Input id="default_tax_rate" type="number" min="0" max="100" step="0.01" value={defaultTaxRate} onChange={(e) => setDefaultTaxRate(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_payment_terms">Payment Terms (days)</Label>
              <Input id="default_payment_terms" type="number" min="1" value={defaultPaymentTerms} onChange={(e) => setDefaultPaymentTerms(parseInt(e.target.value) || 30)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank_details">Bank / Payment Details</Label>
            <Textarea
              id="bank_details"
              value={bankDetails}
              onChange={(e) => setBankDetails(e.target.value)}
              placeholder="Bank account details, PayPal, etc."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="gap-1"
              >
                <Sun className="h-4 w-4" /> Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="gap-1"
              >
                <Moon className="h-4 w-4" /> Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
                className="gap-1"
              >
                <Monitor className="h-4 w-4" /> System
              </Button>
            </div>
          </div>

          <Separator />

          <Button variant="outline" onClick={handleSignOut} className="gap-2 text-destructive hover:text-destructive">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
