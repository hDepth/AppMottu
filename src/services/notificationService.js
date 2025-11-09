// src/services/notificationService.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configuração básica de comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 📱 Registrar permissão e retornar o token (caso push)
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert('Notificações só funcionam em dispositivos físicos.');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Permissão para notificações negada!');
    return;
  }

  // Retorna token (caso queira enviar push remoto depois)
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Expo Push Token:', token);

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

// 🔔 Enviar notificação local
export async function scheduleLocalNotification({ title, body }) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null, // dispara imediatamente
  });
}
