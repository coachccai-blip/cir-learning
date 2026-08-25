// Fabrique la version hors ligne : un seul fichier HTML, jouable en double-cliquant.
//
// Pourquoi un fichier unique plutôt qu'un dossier ? Ouvert depuis le disque
// (`file://`), un navigateur refuse de charger un module JavaScript voisin —
// c'est une règle de sécurité, pas un réglage. Le seul montage qui fonctionne
// partout est donc une page qui ne demande rien à personne : script, styles,
// polices et portraits sont écrits dedans.
//
// Se lance après `vite build`, et lit ce que celui-ci a produit dans `dist/`.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
// Un cran au-dessus : le fichier jouable est seul à la racine du dépôt, pour
// qu'on le trouve sans chercher après avoir dézippé.
const OUT = join('..', 'Learn-CIR-hors-ligne.html');

const dataUri = (mime, buf) => `data:${mime};base64,${buf.toString('base64')}`;

let html = readFileSync(join(DIST, 'index.html'), 'utf8');

// 1. Les polices, référencées en `url('fonts/…')` dans le <style> de la page.
for (const file of readdirSync(join(DIST, 'fonts'))) {
  const uri = dataUri('font/woff2', readFileSync(join(DIST, 'fonts', file)));
  html = html.replaceAll(`fonts/${file}`, uri);
}

// 2. Les portraits. Ils sont demandés à l'exécution par concaténation de
//    chaînes : aucun outil ne peut les retrouver dans le code. On les fournit
//    donc par une table que `avatars/portraits.ts` consulte en priorité.
const portraits = {};
for (const file of readdirSync(join(DIST, 'portraits'))) {
  portraits[file] = dataUri('image/png', readFileSync(join(DIST, 'portraits', file)));
}

// 3. La feuille de style et le script, tirés des balises que Vite a écrites.
const cssHref = html.match(/<link rel="stylesheet"[^>]*href="([^"]+)"/)?.[1];
const jsSrc = html.match(/<script type="module"[^>]*src="([^"]+)"/)?.[1];
if (!cssHref || !jsSrc) throw new Error('Balises de style ou de script introuvables dans dist/index.html');

const local = (href) => join(DIST, href.replace(/^.*\/assets\//, 'assets/'));
const css = readFileSync(local(cssHref), 'utf8');
const js = readFileSync(local(jsSrc), 'utf8');

// Le script est fourni par une adresse `data:` plutôt qu'écrit dans la page.
// Deux raisons : le code contient des morceaux de balises `<script>` en chaînes
// de caractères, que l'analyseur HTML prendrait pour du balisage ; et `data:`
// fait partie des rares schémas qu'un navigateur accepte de charger comme
// module depuis un fichier local.
const bundle = `window.__PORTRAITS__=${JSON.stringify(portraits)};\n${js}`;
const moduleUri = dataUri('text/javascript', Buffer.from(bundle, 'utf8'));

html = html
  .replace(/<link rel="stylesheet"[^>]*>/, `<style>${css}</style>`)
  .replace(/<script type="module"[^>]*><\/script>/, `<script type="module" src="${moduleUri}"></script>`)
  // Le manifeste ne sert qu'à l'installation depuis un serveur, et sa requête
  // échouerait bruyamment depuis le disque.
  .replace(/<link rel="manifest"[^>]*>/, '');

writeFileSync(OUT, html);
const mo = (Buffer.byteLength(html) / 1024 / 1024).toFixed(2);
console.log(`${OUT} écrit — ${mo} Mo, ${Object.keys(portraits).length} portraits embarqués`);
