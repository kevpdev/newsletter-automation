import { google } from 'googleapis';
import http from 'http';
import { URL } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
];

async function generateRefreshToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ GMAIL_CLIENT_ID ou GMAIL_CLIENT_SECRET manquant');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force consent screen to get refresh token
  });

  console.log('\n🔐 Génération du refresh token avec les bons scopes:\n');
  console.log('Scopes requis:');
  SCOPES.forEach((scope) => console.log(`  - ${scope}`));
  console.log('\n📋 Étapes:\n');
  console.log('1. Ouvre cette URL dans ton navigateur:');
  console.log(`\n${authUrl}\n`);
  console.log('2. Accepte les permissions');
  console.log('3. Tu seras redirigé vers http://localhost:3000/oauth2callback?code=...');
  console.log('4. Le serveur va capturer le code automatiquement\n');

  const server = http.createServer(async (req, res) => {
    if (req.url?.startsWith('/oauth2callback')) {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const code = url.searchParams.get('code');

      if (!code) {
        res.writeHead(400);
        res.end('❌ Code manquant');
        return;
      }

      try {
        const { tokens } = await oauth2Client.getToken(code);

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html>
            <head><title>Succès</title></head>
            <body style="font-family: monospace; padding: 40px;">
              <h1>✅ Refresh token généré!</h1>
              <p>Ajoute cette ligne dans ton <code>~/.zshrc</code>:</p>
              <pre style="background: #f5f5f5; padding: 20px; border-radius: 5px;">export GMAIL_REFRESH_TOKEN="${tokens.refresh_token}"</pre>
              <p>Puis recharge: <code>source ~/.zshrc</code></p>
              <p>Tu peux fermer cette fenêtre.</p>
            </body>
          </html>
        `);

        console.log('\n✅ Refresh token généré!\n');
        console.log('Ajoute cette ligne dans ton ~/.zshrc:\n');
        console.log(`export GMAIL_REFRESH_TOKEN="${tokens.refresh_token}"\n`);
        console.log('Puis recharge: source ~/.zshrc\n');

        setTimeout(() => {
          server.close();
          process.exit(0);
        }, 1000);
      } catch (error) {
        console.error('❌ Erreur:', error);
        res.writeHead(500);
        res.end('❌ Erreur lors de la récupération du token');
        server.close();
        process.exit(1);
      }
    }
  });

  server.listen(3000, () => {
    console.log('🌐 Serveur démarré sur http://localhost:3000');
    console.log("En attente de l'autorisation...\n");
  });
}

generateRefreshToken().catch((error) => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
