import { authenticate } from '@google-cloud/local-auth';
import { writeFileSync } from 'fs';
import { join } from 'path';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.send'
];

async function getRefreshToken() {
  try {
    // Autenticar usando o cliente OAuth local
    const auth = await authenticate({
      scopes: SCOPES,
      keyfilePath: join(process.cwd(), 'credentials.json')
    });

    // Obter credenciais incluindo o refresh token
    const credentials = auth.credentials;

    // Salvar credenciais em um arquivo
    writeFileSync('token.json', JSON.stringify(credentials, null, 2));
    
  } catch (error) {
    console.error('Erro ao obter refresh token:', error);
  }
}

getRefreshToken();
