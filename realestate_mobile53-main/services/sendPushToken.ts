import axios from 'axios';

export async function sendPushTokenToBackend(token: string, userId: string) {
  try {
    await axios.post('http://localhost:3000/api/push/register', {
      token,
      userId,
    });
  } catch (err) {
    console.error('Failed to send push token to backend:', err);
  }
}
