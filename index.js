/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App.js';
import {name} from './config.json';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Index: Background FCM received');
  
  // Ensure the channel exists even in killed state
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: remoteMessage.notification?.title || 'Background Notification',
    body: remoteMessage.notification?.body || '',
    android: {
      channelId,
      smallIcon: 'ic_launcher',
      pressAction: { id: 'default' },
    },
  });
});
AppRegistry.registerComponent(name, () => App);
