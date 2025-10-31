// Fixed app : sign cookie with HMAC and verify server-side
const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
const PORT = 3002; // corrected app on 3002
const COOKIE_NAME = 'user_signed';
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'changeme123'; // set strong secret in prod

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function signValue(value) {
  return crypto.createHmac('sha256', COOKIE_SECRET).update(value).digest('hex');
}

function verifySigned(signed) {
  if (!signed) return null;
  const parts = signed.split('.');
  if (parts.length !== 2) return null;
  const [valueB64, sig] = parts;
  const expected = signValue(valueB64);
  // timing safe compare
  const valid = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!valid) return null;
  try {
    return Buffer.from(valueB64, 'base64').toString('utf8');
  } catch (e) {
    return null;
  }
}

// home
app.get('/', (req, res) => {
  res.send(`
    <h2>Cookie-Check Lab — FIXED</h2>
    <p>Cookie "user_signed": ${req.cookies[COOKIE_NAME] || '(none)'}</p>
    <p><a href="/admin">Accéder à /admin</a></p>
    <p>Use POST /login { username } to set a signed cookie.</p>
  `);
});

// admin - verify signature server-side
app.get('/admin', (req, res) => {
  const signed = req.cookies[COOKIE_NAME];
  const username = verifySigned(signed);
  if (!username) return res.status(401).send('Accès refusé — cookie missing/invalid');

  if (username === 'admin') {
    return res.send('<h1>ADMIN PANEL — Accès accordé (FIXED)</h1><p>Bienvenue admin.</p>');
  } else {
    return res.status(403).send(`<h1>Accès interdit</h1><p>Utilisateur : ${username}</p>`);
  }
});

// login: sets signed cookie
app.post('/login', (req, res) => {
  const { username } = req.body || {};
  if (!username) return res.status(400).send('username missing');

  const b64 = Buffer.from(username, 'utf8').toString('base64');
  const sig = signValue(b64);
  const signed = `${b64}.${sig}`;

  // set cookie HttpOnly + Secure flag optional (use Secure in https)
  res.cookie(COOKIE_NAME, signed, { path: '/', httpOnly: true, sameSite: 'Lax' /*, secure: true */ , maxAge: 24*3600*1000 });
  res.send(`Signed cookie set for ${username}. <a href="/">home</a>`);
});

app.listen(PORT, () => console.log(`FIXED app listening http://localhost:${PORT}`));

