import { chromium } from 'playwright';
const shots = process.argv[2];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const errs = [];
const p = await b.newPage({ viewport: { width: 1280, height: 950 } });
p.on('pageerror', (e) => errs.push(String(e)));
await p.goto('http://localhost:4173/cir-learning/', { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(500);
console.log('ACCUEIL :', JSON.stringify((await p.locator('.home-card').innerText()).replace(/\n+/g, ' | ')));
await p.screenshot({ path: `${shots}/nomode-home.png`, fullPage: true });

// « Nouveau parcours » doit mener droit au quiz, sans écran de sélection
await p.getByRole('button', { name: /Nouveau parcours/i }).click();
await p.waitForTimeout(800);
console.log('après clic →', (await p.locator('h1').first().innerText().catch(() => '(rien)')));
console.log('questions :', await p.locator('.panel').filter({ hasText: 'QUESTION' }).count());
const qs = p.locator('.panel').filter({ hasText: 'QUESTION' });
for (let i = 0; i < await qs.count(); i++) await qs.nth(i).locator('button').first().click();
await p.locator('button', { hasText: /valider/i }).last().click();
await p.waitForTimeout(500);
for (let i = 0; i < 8; i++) {
  const go = p.getByRole('button', { name: /commencer|continuer|entrer/i }).first();
  if (!(await go.count())) break;
  await go.click().catch(() => {});
  await p.waitForTimeout(300);
  if (await p.locator('text=/Portefeuille & prospects/i').count()) break;
}
for (let i = 0; i < 20; i++) {
  if (await p.locator('text=/Portefeuille & prospects/i').count()) break;
  const c = p.locator('.choice, button.btn-primary').first();
  if (!(await c.count())) break;
  await c.click().catch(() => {});
  await p.waitForTimeout(220);
}
await p.waitForTimeout(500);
console.log('bandeau :', (await p.locator('.topbar').innerText()).replace(/\n/g, ' · '));
console.log('pistes :', (await p.locator('.list-item strong').allInnerTexts()).join(' | '));
await p.screenshot({ path: `${shots}/nomode-day.png`, fullPage: true });
console.log('erreurs :', JSON.stringify(errs.slice(0, 4)));
await b.close();
