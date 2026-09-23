import React from 'react';
import AgencyTopNavigation from '../../dashboard/components/AgencyTopNavigation';

export default function ClientTopNavigation({
  profileMenuOpen,
  onProfilePress,
  onNotificationOpen,
  avatarInitials,
}: {
  profileMenuOpen: boolean;
  onProfilePress: () => void;
  onNotificationOpen?: () => void;
  avatarInitials?: string;
}) {
  return (
    <AgencyTopNavigation
      profileMenuOpen={profileMenuOpen}
      onProfilePress={onProfilePress}
      onBeforeOpenNotifications={onNotificationOpen}
      avatarInitials={avatarInitials || 'C'}
      enableIncidentBuzzer={false}
    />
  );
}
