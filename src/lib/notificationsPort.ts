import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { logger } from './logger';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface NotificationDateTrigger {
  type: 'date';
  date: Date;
  channelId?: string;
}

export interface NotificationPortRequest {
  identifier: string;
  content: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
  };
  trigger: NotificationDateTrigger;
}

export interface NotificationsPort {
  getPermission(): Promise<PermissionStatus>;
  requestPermission(): Promise<PermissionStatus>;
  ensureChannel(channelId: string, channelName: string): Promise<void>;
  scheduleNotification(request: NotificationPortRequest): Promise<string>;
  cancelScheduledNotification(identifier: string): Promise<void>;
  getAllScheduled(): Promise<{ identifier: string }[]>;
  cancelAllScheduled(): Promise<void>;
}

export class ExpoNotificationsPort implements NotificationsPort {
  private channelReady = false;

  async getPermission(): Promise<PermissionStatus> {
    try {
      const perms = await Notifications.getPermissionsAsync();
      if (perms.status === 'granted') return 'granted';
      if (perms.status === 'denied') return 'denied';
      return 'undetermined';
    } catch (err) {
      logger.warn('Failed to get notification permissions', err);
      return 'undetermined';
    }
  }

  async requestPermission(): Promise<PermissionStatus> {
    try {
      const perms = await Notifications.requestPermissionsAsync();
      if (perms.status === 'granted') return 'granted';
      if (perms.status === 'denied') return 'denied';
      return 'undetermined';
    } catch (err) {
      logger.warn('Failed to request notification permissions', err);
      return 'denied';
    }
  }

  async ensureChannel(channelId: string, channelName: string): Promise<void> {
    if (this.channelReady || Platform.OS !== 'android') {
      return;
    }
    try {
      await Notifications.setNotificationChannelAsync(channelId, {
        name: channelName,
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1E4D8F',
      });
      this.channelReady = true;
    } catch (err) {
      logger.warn('Failed to configure Android notification channel', err);
    }
  }

  async scheduleNotification(request: NotificationPortRequest): Promise<string> {
    // Schedule strictly using absolute DATE trigger, never TIME_INTERVAL
    return await Notifications.scheduleNotificationAsync({
      identifier: request.identifier,
      content: request.content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: request.trigger.date,
        channelId: request.trigger.channelId,
      },
    });
  }

  async cancelScheduledNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (err) {
      logger.warn(`Failed to cancel notification ${identifier}`, err);
    }
  }

  async getAllScheduled(): Promise<{ identifier: string }[]> {
    try {
      const list = await Notifications.getAllScheduledNotificationsAsync();
      return list.map((item) => ({ identifier: item.identifier }));
    } catch (err) {
      logger.warn('Failed to fetch scheduled notifications', err);
      return [];
    }
  }

  async cancelAllScheduled(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (err) {
      logger.warn('Failed to cancel all notifications', err);
    }
  }
}

export class FakeNotificationsPort implements NotificationsPort {
  public permission: PermissionStatus = 'granted';
  public scheduled: Map<string, NotificationPortRequest> = new Map();
  public channels: Set<string> = new Set();
  public shouldFailSchedule = false;

  async getPermission(): Promise<PermissionStatus> {
    return this.permission;
  }

  async requestPermission(): Promise<PermissionStatus> {
    return this.permission;
  }

  async ensureChannel(channelId: string): Promise<void> {
    this.channels.add(channelId);
  }

  async scheduleNotification(request: NotificationPortRequest): Promise<string> {
    if (this.shouldFailSchedule) {
      throw new Error('Simulated notification scheduling failure');
    }
    this.scheduled.set(request.identifier, request);
    return request.identifier;
  }

  async cancelScheduledNotification(identifier: string): Promise<void> {
    this.scheduled.delete(identifier);
  }

  async getAllScheduled(): Promise<{ identifier: string }[]> {
    return Array.from(this.scheduled.keys()).map((id) => ({ identifier: id }));
  }

  async cancelAllScheduled(): Promise<void> {
    this.scheduled.clear();
  }
}

export const defaultNotificationsPort: NotificationsPort = new ExpoNotificationsPort();
