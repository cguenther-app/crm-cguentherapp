/**
 * Legt die `accounting_entries` Collection an.
 *
 * Usage:
 *   node scripts/pb-setup-accounting.mjs <email> <password>
 *
 * Voraussetzung: SSH-Tunnel aktiv (ssh -L 8090:localhost:8090 root@server)
 */

const PB_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';
const EMAIL = process.argv[2] || process.env.PB_EMAIL;
const PASSWORD = process.argv[3] || process.env.PB_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('Usage: node scripts/pb-setup-accounting.mjs <email> <password>');
  process.exit(1);
}

async function request(path, options = {}) {
  const res = await fetch(`${PB_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`${path} failed: ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  console.log('Authenticating...');
  const { token } = await request('/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: EMAIL, password: PASSWORD }),
  });

  const h = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const AUTH_RULE = '@request.auth.id != ""';
  const rules = {
    listRule: AUTH_RULE,
    viewRule: AUTH_RULE,
    createRule: AUTH_RULE,
    updateRule: AUTH_RULE,
    deleteRule: AUTH_RULE,
  };

  // Fetch existing collections to get IDs for relations
  console.log('Fetching existing collections...');
  const collections = await request('/api/collections?perPage=200', { headers: h });
  const invoicesCollection = collections.items.find((c) => c.name === 'invoices');

  if (!invoicesCollection) {
    console.warn('  Warning: invoices collection not found – invoice relation will be skipped');
  }

  // --- accounting_entries: always try to delete by name first, then recreate ---
  console.log('Deleting accounting_entries collection if it exists...');
  const delRes = await fetch(`${PB_URL}/api/collections/accounting_entries`, {
    method: 'DELETE',
    headers: h,
  });
  if (delRes.ok) {
    console.log('  deleted existing accounting_entries collection.');
  } else if (delRes.status === 404) {
    console.log('  no existing accounting_entries collection found.');
  } else {
    const err = await delRes.json();
    throw new Error(`DELETE /api/collections/accounting_entries failed: ${JSON.stringify(err)}`);
  }

  console.log('Creating accounting_entries collection...');

  const fields = [
    {
      name: 'type',
      type: 'select',
      required: true,
      maxSelect: 1,
      values: ['income', 'expense'],
    },
    { name: 'date', type: 'text', required: true },
    { name: 'amount', type: 'number', required: true },
    { name: 'category', type: 'text' },
    { name: 'description', type: 'text' },
    { name: 'reference_number', type: 'text' },
    { name: 'notes', type: 'text' },
    {
      name: 'receipt',
      type: 'file',
      maxSelect: 1,
      mimeTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    },
  ];

  // Add invoice relation only if invoices collection exists
  if (invoicesCollection) {
    fields.push({
      name: 'invoice',
      type: 'relation',
      collectionId: invoicesCollection.id,
      cascadeDelete: false,
      maxSelect: 1,
    });
  }

  const accounting = await request('/api/collections', {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      name: 'accounting_entries',
      type: 'base',
      ...rules,
      fields,
    }),
  });
  console.log(`  accounting_entries (${accounting.id})`);

  console.log('\naccounting_entries Collection erfolgreich angelegt!');
}

main().catch((err) => {
  console.error('Fehler:', err.message);
  process.exit(1);
});
