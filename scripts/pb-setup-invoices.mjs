/**
 * Legt die `invoices` Collection an.
 *
 * Usage:
 *   node scripts/pb-setup-invoices.mjs <email> <password>
 *
 * Voraussetzung: SSH-Tunnel aktiv (ssh -L 8090:localhost:8090 root@server)
 */

const PB_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';
const EMAIL = process.argv[2] || process.env.PB_EMAIL;
const PASSWORD = process.argv[3] || process.env.PB_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('Usage: node scripts/pb-setup-invoices.mjs <email> <password>');
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
  const orgsCollection = collections.items.find((c) => c.name === 'organizations');
  const contactsCollection = collections.items.find((c) => c.name === 'contacts');
  const offersCollection = collections.items.find((c) => c.name === 'offers');

  if (!orgsCollection) {
    throw new Error('organizations collection not found – run pb-setup.mjs first');
  }
  if (!contactsCollection) {
    throw new Error('contacts collection not found – run pb-setup.mjs first');
  }
  if (!offersCollection) {
    throw new Error('offers collection not found – run pb-setup-offers.mjs first');
  }

  // --- invoices: always try to delete by name first, then recreate ---
  console.log('Deleting invoices collection if it exists...');
  const delRes = await fetch(`${PB_URL}/api/collections/invoices`, {
    method: 'DELETE',
    headers: h,
  });
  if (delRes.ok) {
    console.log('  deleted existing invoices collection.');
  } else if (delRes.status === 404) {
    console.log('  no existing invoices collection found.');
  } else {
    const err = await delRes.json();
    throw new Error(`DELETE /api/collections/invoices failed: ${JSON.stringify(err)}`);
  }

  console.log('Creating invoices collection...');
  const invoices = await request('/api/collections', {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      name: 'invoices',
      type: 'base',
      ...rules,
      fields: [
        {
          name: 'offer',
          type: 'relation',
          collectionId: offersCollection.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'organization',
          type: 'relation',
          required: true,
          collectionId: orgsCollection.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'contact',
          type: 'relation',
          collectionId: contactsCollection.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'number', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['open', 'paid', 'cancelled'],
        },
        { name: 'date', type: 'text', required: true },
        { name: 'due_date', type: 'text' },
        { name: 'positions', type: 'text' },
        { name: 'total', type: 'number' },
        { name: 'notes', type: 'text' },
        { name: 'footer_note', type: 'text' },
      ],
    }),
  });
  console.log(`  invoices (${invoices.id})`);

  console.log('\ninvoices Collection erfolgreich angelegt!');
}

main().catch((err) => {
  console.error('Fehler:', err.message);
  process.exit(1);
});
