import { apiRequest } from './apiClient';

export type AppNotification = {
  id: number;
  type: string;
  title: string;
  message: string;
  reference_type?: string | null;
  reference_id?: number | null;
  target_role: string;
  status: 'unread' | 'read';
  created_at: string;
  updated_at?: string;
};

export const notificationService = {
  getAll: (status?: AppNotification['status']) =>
    apiRequest<AppNotification[]>(
      `/notifications${status ? `?status=${status}` : ''}`,
      { authenticated: true },
    ),
  getUnreadCount: () =>
    apiRequest<{ count: number }>('/notifications/unread-count', {
      authenticated: true,
    }),
  markAsRead: (id: number) =>
    apiRequest<AppNotification>(`/notifications/${id}/read`, {
      method: 'PUT',
      authenticated: true,
    }),
  markAllAsRead: () =>
    apiRequest<{ success: true; message: string }>('/notifications/read-all', {
      method: 'PUT',
      authenticated: true,
    }),
  remove: (id: number) =>
    apiRequest<{ success: true; message: string }>(`/notifications/${id}`, {
      method: 'DELETE',
      authenticated: true,
    }),
};
