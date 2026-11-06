const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function testGenerate() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000/engineering/index.html', { waitUntil: 'networkidle2', timeout: 30000 });

  const result = await page.evaluate(() => {
    const leads = Object.keys(SHARE);
    const generated = {};
    for (const leadId of leads) {
      const slug = SHARE[leadId];
      if (slug && typeof anaHtml === 'function') {
        const res = anaHtml(leadId);
        generated[slug] = {
          title: res.data && res.data.lead ? res.data.lead.nama : leadId,
          html: res.html,
          data: res.data
        };
      }
    }
    return generated;
  });

  await browser.close();

  console.log('Total generated slugs:', Object.keys(result).length);
  for (const slug of Object.keys(result)) {
    console.log(`Slug: ${slug} -> Title: ${result[slug].title}, HTML len: ${result[slug].html.length}`);
  }

  // Write files to public/analisa/[slug]/index.html
  const baseDir = path.join(__dirname, '..', 'public', 'analisa');
  for (const [slug, item] of Object.entries(result)) {
    const dir = path.join(baseDir, slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), item.html, 'utf8');
  }

  // Also write an index.html at public/analisa/index.html as a directory landing page
  const indexHtml = `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>SUNBLIX — Portal Analisa PLTS Customer</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
  <style>
    :root { --bg: #0B1222; --card: #131C30; --fg: #E2E8F0; --accent: #F5A80B; --line: rgba(148,163,184,.15); }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--fg); margin: 0; padding: 40px 20px; }
    .box { max-width: 680px; margin: 40px auto; background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 32px; text-align: center; }
    h1 { color: #fff; font-size: 24px; margin-top: 0; }
    p { color: #94A3B8; line-height: 1.6; }
    a.btn { display: inline-block; background: var(--accent); color: #0B1222; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Portal Analisa Rekayasa PLTS</h1>
    <p>Halaman ini memuat proposal dan simulasi teknis PLTS resmi PT SUNBLIX Energi Indonesia.</p>
    <p>Silakan gunakan tautan khusus yang dikirimkan oleh konsultan engineer SUNBLIX melalui WhatsApp untuk melihat analisa rumah/properti Anda.</p>
    <a href="https://sunblix.id" class="btn">Kunjungi Website SUNBLIX</a>
  </div>
</body>
</html>`;
  fs.writeFileSync(path.join(baseDir, 'index.html'), indexHtml, 'utf8');

  console.log('Successfully written all static proposal pages to public/analisa/');
}

testGenerate().catch(err => console.error('Error generating:', err));
