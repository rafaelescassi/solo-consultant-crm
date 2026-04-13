import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import type { InvoiceWithItems, Profile } from '@/lib/types';

const styles = StyleSheet.create({
  page: { padding: 50, fontFamily: 'Helvetica', fontSize: 10, color: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  businessName: { fontSize: 18, fontWeight: 'bold', color: '#3B82F6', marginBottom: 4 },
  businessInfo: { fontSize: 9, color: '#64748B', lineHeight: 1.5 },
  invoiceTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'right', marginBottom: 8 },
  invoiceMeta: { textAlign: 'right', fontSize: 9, color: '#64748B', lineHeight: 1.5 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginVertical: 20 },
  billTo: { marginBottom: 20 },
  billToLabel: { fontSize: 9, color: '#64748B', textTransform: 'uppercase', marginBottom: 4, letterSpacing: 1 },
  clientName: { fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  clientInfo: { fontSize: 9, color: '#64748B', lineHeight: 1.5 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F1F5F9', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 4, marginBottom: 4 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: 'center' },
  colRate: { flex: 1, textAlign: 'right' },
  colAmount: { flex: 1, textAlign: 'right' },
  headerText: { fontWeight: 'bold', fontSize: 9, color: '#64748B', textTransform: 'uppercase' },
  totalsSection: { marginTop: 20, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', width: 200, justifyContent: 'space-between', paddingVertical: 4 },
  totalLabel: { fontSize: 10, color: '#64748B' },
  totalValue: { fontSize: 10, fontWeight: 'bold' },
  grandTotal: { flexDirection: 'row', width: 200, justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 2, borderTopColor: '#0F172A', marginTop: 4 },
  grandTotalLabel: { fontSize: 12, fontWeight: 'bold' },
  grandTotalValue: { fontSize: 12, fontWeight: 'bold', color: '#3B82F6' },
  footer: { position: 'absolute', bottom: 40, left: 50, right: 50 },
  footerText: { fontSize: 8, color: '#94A3B8', textAlign: 'center', lineHeight: 1.5 },
  notes: { marginTop: 20, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 4 },
  notesLabel: { fontSize: 9, fontWeight: 'bold', color: '#64748B', marginBottom: 4 },
  notesText: { fontSize: 9, color: '#475569', lineHeight: 1.5 },
});

function formatMoney(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

interface InvoicePdfProps {
  invoice: InvoiceWithItems;
  profile: Profile;
}

function InvoicePdf({ invoice, profile }: InvoicePdfProps) {
  const currency = profile.currency || 'USD';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.businessName}>{profile.business_name || 'My Business'}</Text>
            {profile.business_address && <Text style={styles.businessInfo}>{profile.business_address}</Text>}
            {profile.business_email && <Text style={styles.businessInfo}>{profile.business_email}</Text>}
            {profile.business_phone && <Text style={styles.businessInfo}>{profile.business_phone}</Text>}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceMeta}>Invoice #: {invoice.invoice_number}</Text>
            <Text style={styles.invoiceMeta}>Date: {invoice.issue_date}</Text>
            <Text style={styles.invoiceMeta}>Due: {invoice.due_date}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bill To */}
        <View style={styles.billTo}>
          <Text style={styles.billToLabel}>Bill To</Text>
          <Text style={styles.clientName}>{invoice.client.name}</Text>
          {invoice.client.company && <Text style={styles.clientInfo}>{invoice.client.company}</Text>}
          <Text style={styles.clientInfo}>{invoice.client.email}</Text>
          {invoice.client.address && <Text style={styles.clientInfo}>{invoice.client.address}</Text>}
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.colDesc]}>Description</Text>
          <Text style={[styles.headerText, styles.colQty]}>Qty</Text>
          <Text style={[styles.headerText, styles.colRate]}>Rate</Text>
          <Text style={[styles.headerText, styles.colAmount]}>Amount</Text>
        </View>

        {/* Table Rows */}
        {invoice.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colRate}>{formatMoney(item.unit_price, currency)}</Text>
            <Text style={styles.colAmount}>{formatMoney(item.amount, currency)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatMoney(invoice.subtotal, currency)}</Text>
          </View>
          {invoice.tax_rate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({invoice.tax_rate}%)</Text>
              <Text style={styles.totalValue}>{formatMoney(invoice.tax_amount, currency)}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatMoney(invoice.total, currency)}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          {profile.bank_details && (
            <Text style={styles.footerText}>Payment Details: {profile.bank_details}</Text>
          )}
          <Text style={styles.footerText}>
            Payment Terms: Net {profile.default_payment_terms} days
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderInvoicePdf(invoice: InvoiceWithItems, profile: Profile): Promise<Buffer> {
  return await renderToBuffer(<InvoicePdf invoice={invoice} profile={profile} />);
}

export default InvoicePdf;
