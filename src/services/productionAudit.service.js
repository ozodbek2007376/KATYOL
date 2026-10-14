/**
 * Production Audit Trail & Optimistic Locking Service
 */

export const PRODUCTION_ACTION_TYPES = {
  STARTED: 'STARTED',
  PAUSED: 'PAUSED',
  RESUMED: 'RESUMED',
  EMPLOYEE_ASSIGNED: 'EMPLOYEE_ASSIGNED',
  EMPLOYEE_REMOVED: 'EMPLOYEE_REMOVED',
  STAGE_CHANGED: 'STAGE_CHANGED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NOTES_ADDED: 'NOTES_ADDED',
  ATTACHMENT_ADDED: 'ATTACHMENT_ADDED',
};

export const productionAuditService = {
  /**
   * Creates an immutable audit trail entry for a production order
   */
  createAuditEntry: (actionType, details = {}, performedBy = 'Tizim Operatori') => {
    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 16);
    let title = 'Ishlab Chiqarish Harakati';

    switch (actionType) {
      case PRODUCTION_ACTION_TYPES.STARTED:
        title = 'Ishlab Chiqarish Boshlandi';
        break;
      case PRODUCTION_ACTION_TYPES.PAUSED:
        title = 'Ishlab Chiqarish Vaqtincha To\'xtatildi';
        break;
      case PRODUCTION_ACTION_TYPES.RESUMED:
        title = 'Ishlab Chiqarish Qayta Tiklandi';
        break;
      case PRODUCTION_ACTION_TYPES.EMPLOYEE_ASSIGNED:
        title = 'Yangi Xodim Biriktirildi';
        break;
      case PRODUCTION_ACTION_TYPES.EMPLOYEE_REMOVED:
        title = 'Xodim Biriktiruvdan Olinib Tashlandi';
        break;
      case PRODUCTION_ACTION_TYPES.STAGE_CHANGED:
        title = 'Ishlab Chiqarish Bosqichi O\'zgartirildi';
        break;
      case PRODUCTION_ACTION_TYPES.COMPLETED:
        title = 'Ishlab Chiqarish Muvaffaqiyatli Yakunlandi';
        break;
      case PRODUCTION_ACTION_TYPES.CANCELLED:
        title = 'Ishlab Chiqarish Bekor Qilindi';
        break;
      case PRODUCTION_ACTION_TYPES.NOTES_ADDED:
        title = 'Texnik Izoh Qo\'shildi';
        break;
      case PRODUCTION_ACTION_TYPES.ATTACHMENT_ADDED:
        title = 'Hujjat / Chizma Biriktirildi';
        break;
      default:
        title = 'Ishlab Chiqarish Amali';
    }

    return {
      id: `prod_log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      actionType,
      title,
      description: details.description || '',
      performedBy: details.performedBy || performedBy,
      stageName: details.stageName || '',
      timestamp: nowTime,
    };
  },

  /**
   * Optimistic Locking concurrency check
   * Prevents simultaneous overwrite conflicts when multiple users edit the same order.
   */
  checkOptimisticLock: (clientVersion, serverVersion) => {
    if (clientVersion !== serverVersion) {
      return {
        success: false,
        message: "Eslatma: Ushbu ishlab chiqarish buyurtmasi boshqa xodim tarafidan yangilangan! Iltimos, sahifani yangilab, so'nggi ma'lumotlar bilan ishlang.",
      };
    }
    return { success: true };
  },
};
