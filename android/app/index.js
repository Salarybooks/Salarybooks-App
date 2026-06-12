/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App.js';
import {name} from './config.json';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);

  // 1. If you need to call an API when a background notification arrives:
  // try {
  //   await fetch('https://your-api.com/log-notification', {
  //     method: 'POST',
  //     body: JSON.stringify({ id: remoteMessage.messageId }),
  //   });
  // } catch (e) { console.log(e); }

  // 2. Create the channel (Required for Android background/killed state)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });
  console.log('Notification channel created:', channelId);
  // 3. Display the notification
  await notifee.displayNotification({
    title: remoteMessage.notification?.title || remoteMessage.data?.title || 'New Update',
    body: remoteMessage.notification?.body || remoteMessage.data?.body || 'Check your app for details',
    android: {
      channelId,
      smallIcon: 'ic_launcher', // Use a default system icon
      pressAction: {
        id: 'default',
      },
    },
  });
});
AppRegistry.registerComponent(name, () => App);
