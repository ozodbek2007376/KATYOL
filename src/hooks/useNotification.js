import { useNotificationStore } from '@/store/useNotificationStore';

export const useNotification = () => {
  const addNotification = useNotificationStore((state) => state.addNotification);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  return {
    notify: addNotification,
    notifySuccess: (message, title = 'Success') => addNotification({ type: 'success', title, message }),
    notifyError: (message, title = 'Error') => addNotification({ type: 'error', title, message }),
    notifyWarning: (message, title = 'Warning') => addNotification({ type: 'warning', title, message }),
    notifyInfo: (message, title = 'Info') => addNotification({ type: 'info', title, message }),
    dismiss: removeNotification,
  };
};
