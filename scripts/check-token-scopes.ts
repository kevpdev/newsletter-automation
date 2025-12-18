import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

async function checkTokenScopes() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('❌ Credentials manquantes');
    process.exit(1);
  }

  console.log(`\n🔍 Vérification des scopes du refresh token...\n`);
  console.log(`Refresh token (30 premiers chars): ${refreshToken.substring(0, 30)}...\n`);

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost');

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  try {
    // Force refresh to get a new access token
    const { credentials } = await oauth2Client.refreshAccessToken();

    console.log('✅ Access token obtenu avec succès\n');

    if (credentials.scope) {
      console.log('📋 Scopes associés au token:\n');
      const scopes = credentials.scope.split(' ');
      scopes.forEach((scope) => {
        const isRequired = scope.includes('gmail.readonly') || scope.includes('gmail.modify');
        const emoji = isRequired ? '✅' : '  ';
        console.log(`${emoji} ${scope}`);
      });

      console.log('\n📌 Scopes requis pour l\'app:');
      console.log('✅ https://www.googleapis.com/auth/gmail.readonly');
      console.log('✅ https://www.googleapis.com/auth/gmail.modify');

      const hasReadonly = scopes.some(s => s.includes('gmail.readonly'));
      const hasModify = scopes.some(s => s.includes('gmail.modify'));

      if (hasReadonly && hasModify) {
        console.log('\n✅ Tous les scopes nécessaires sont présents!');
      } else {
        console.log('\n❌ Scopes manquants:');
        if (!hasReadonly) console.log('   - gmail.readonly');
        if (!hasModify) console.log('   - gmail.modify');
        console.log('\n💡 Génère un nouveau refresh token avec les bons scopes:');
        console.log('   pnpm run auth:generate');
      }
    } else {
      console.log('⚠️  Pas de scope dans la réponse');
    }

    console.log('\n');
  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

checkTokenScopes();
