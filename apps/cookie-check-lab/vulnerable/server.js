// Simple vulnerable app : trust a 'user' cookie that is Base64 encoded
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3001; // vuln app on 3001 so you can run fixed on 3002 if besoin

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// home: show cookie and links
app.get('/', (req, res) => {
  res.send(`
    <h2>Cookie-Check Lab — VULNERABLE</h2>
    <p>Cookie "user" actuel: ${req.cookies.user || '(none)'}</p>
    <p><a href="/admin">Accéder à /admin</a></p>
    <p>Pour tester : posez cookie 'user' = Base64("admin") (dXNlcg== serait 'user')</p>
  `);
});

// admin: trust cookie; decode base64 and check username === 'admin'
app.get('/admin', (req, res) => {
  const raw = req.cookies.user;
  if (!raw) return res.status(401).send('Accès refusé — pas de cookie "user".');

  // URL-decode if needed (cookie clients peuvent l'encoder)
  const decodedUrl = decodeURIComponent(raw);

  try {
    const buf = Buffer.from(decodedUrl, 'base64');
    const user = buf.toString('utf8');

    // VULN : on fait entièrement confiance au cookie
    if (user === 'admin') {
      return res.send('<h1>ADMIN PANEL — Accès accordé (VULN)</h1><p>Bravo — tu es admin.</p>');
    } else {
      return res.status(403).send('<h1>Accès interdit</h1><p>Utilisateur : ' + user + '</p>');
    }
  } catch (e) {
    return res.status(400).send('Cookie mal formé');
  }
});

// quick login page (sets cookie 'user' to given username)
app.post('/login', (req, res) => {
  const { username } = req.body || {};
  if (!username) return res.status(400).send('username missing');

  // store Base64 encoded username in cookie (vuln)
  const b64 = Buffer.from(username, 'utf8').toString('base64');
  res.cookie('user', b64, { path: '/', maxAge: 24*3600*1000 }); // NOT HttpOnly, NOT signed
  res.send(`Cookie set to ${b64} (Base64 of ${username}). <a href="/">home</a>`);
});

app.listen(PORT, () => console.log(`VULN app listening http://localhost:${PORT}`));

