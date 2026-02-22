/**
 * PocketBase Setup Script
 * Erstellt alle Collections (organizations, contacts, notes)
 *
 * Usage:
 *   node scripts/pb-setup.mjs <email> <password>
 *
 * Voraussetzung: SSH-Tunnel aktiv (ssh -L 8090:localhost:8090 root@server)
 */

const PB_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';
const EMAIL = process.argv[2] || process.env.PB_EMAIL;
const PASSWORD = process.argv[3] || process.env.PB_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('Usage: node scripts/pb-setup.mjs <email> <password>');
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

  // --- users (existiert bereits als PocketBase Default) ---
  console.log('Fetching users collection...');
  const users = await request('/api/collections/users', { headers: h });
  console.log(`  users (${users.id})`);

  // --- organizations ---
  console.log('Creating organizations collection...');
  const org = await request('/api/collections', {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      name: 'organizations',
      type: 'base',
      ...rules,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'industry', type: 'text' },
        { name: 'address_street', type: 'text' },
        { name: 'address_zip', type: 'text' },
        { name: 'address_city', type: 'text' },
        { name: 'website', type: 'url' },
        { name: 'phone', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['lead', 'contacted', 'responded', 'interested', 'offer_sent', 'customer', 'no_interest', 'paused'],
        },
        { name: 'tags', type: 'text' },
      ],
    }),
  });
  console.log(`  organizations (${org.id})`);

  // --- contacts ---
  console.log('Creating contacts collection...');
  const contact = await request('/api/collections', {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      name: 'contacts',
      type: 'base',
      ...rules,
      fields: [
        { name: 'organization', type: 'relation', required: true, collectionId: org.id, cascadeDelete: true, maxSelect: 1 },
        { name: 'first_name', type: 'text', required: true },
        { name: 'last_name', type: 'text', required: true },
        { name: 'role', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
        { name: 'mobile', type: 'text' },
        { name: 'is_primary', type: 'bool' },
      ],
    }),
  });
  console.log(`  contacts (${contact.id})`);

  // --- notes ---
  console.log('Creating notes collection...');
  const notes = await request('/api/collections', {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      name: 'notes',
      type: 'base',
      ...rules,
      fields: [
        { name: 'organization', type: 'relation', collectionId: org.id, cascadeDelete: false, maxSelect: 1 },
        { name: 'contact', type: 'relation', collectionId: contact.id, cascadeDelete: false, maxSelect: 1 },
        {
          name: 'type',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['internal', 'call', 'visit', 'email_in', 'email_out', 'other'],
        },
        { name: 'content', type: 'editor', required: true },
        { name: 'noted_at', type: 'date', required: true },
        { name: 'created_by', type: 'relation', required: true, collectionId: users.id, cascadeDelete: false, maxSelect: 1 },
      ],
    }),
  });
  console.log(`  notes (${notes.id})`);

  console.log('\nAlle Collections erfolgreich angelegt!');
}

main().catch((err) => {
  console.error('Fehler:', err.message);
  process.exit(1);
});
