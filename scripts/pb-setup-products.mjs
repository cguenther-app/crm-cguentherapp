/**
 * Legt die `products` Collection an und befüllt sie mit Seed-Daten.
 *
 * Usage:
 *   node scripts/pb-setup-products.mjs <email> <password>
 *
 * Voraussetzung: SSH-Tunnel aktiv (ssh -L 8090:localhost:8090 root@server)
 */

const PB_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';
const EMAIL = process.argv[2] || process.env.PB_EMAIL;
const PASSWORD = process.argv[3] || process.env.PB_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('Usage: node scripts/pb-setup-products.mjs <email> <password>');
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

  // --- products ---
  console.log('Creating products collection...');
  const products = await request('/api/collections', {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      name: 'products',
      type: 'base',
      ...rules,
      fields: [
        { name: 'article_number', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'category', type: 'text' },
        {
          name: 'billing_type',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['one_time', 'by_effort'],
        },
        { name: 'price', type: 'number' },
        { name: 'note', type: 'text' },
        { name: 'active', type: 'bool' },
      ],
    }),
  });
  console.log(`  products (${products.id})`);

  // --- seed products ---
  console.log('Seeding products...');
  const seedData = [
    {
      article_number: 'P2a',
      name: 'Online-Stellen (neuer Server)',
      description: 'Ich richte alles neu ein und stelle es online',
      category: 'Online stellen',
      billing_type: 'one_time',
      price: 0,
      note: 'Am unkompliziertesten',
      active: true,
    },
    {
      article_number: 'P2b',
      name: 'Online-Stellen (bestehender Server)',
      description: 'Einbau in bestehende Systeme',
      category: 'Online stellen',
      billing_type: 'by_effort',
      price: 0,
      note: 'Mehr Abstimmung nötig',
      active: true,
    },
    {
      article_number: 'P2c',
      name: 'Server-Check vorab',
      description: 'Ich schaue mir an, was schon da ist',
      category: 'Online stellen',
      billing_type: 'by_effort',
      price: 0,
      note: 'Oft sinnvoll vor P2b',
      active: true,
    },
  ];

  for (const item of seedData) {
    const p = await request('/api/collections/products/records', {
      method: 'POST',
      headers: h,
      body: JSON.stringify(item),
    });
    console.log(`  ${item.article_number} – ${item.name} (${p.id})`);
  }

  console.log('\nproducts Collection + Seed erfolgreich!');
}

main().catch((err) => {
  console.error('Fehler:', err.message);
  process.exit(1);
});
