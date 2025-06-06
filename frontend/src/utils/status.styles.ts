export const getStatusTextColor = (status?: string): string => {
    const statusColorMap: Record<string, string> = {
      // Job statuses
      'Open': 'text-status-Open-600',
      'In-Progress': 'text-status-In-Progress-600',
      'Pending Approval': 'text-status-Pending Approval-600',
      'Completed': 'text-status-Completed-600',
      'Blocked by Admin': 'text-status-Blocked by Admin-600',
      
      // Application statuses
      'Pending': 'text-status-Pending-600',
      'Not Selected': 'text-status-Not Selected-600',
      'Correction': 'text-status-Correction-600'
    };
  
    return statusColorMap[status || ''] || 'text-gray-600';
}