import React from 'react';
import AgencyTopNavigation from '../../dashboard/components/AgencyTopNavigation';

export default function ClientTopNavigation({
  profileMenuOpen,
  onProfilePress,
  onNotificationOpen,
}: {
  profileMenuOpen: boolean;
  onProfilePress: () => void;
  onNotificationOpen?: () => void;
}) {
  return (
    <AgencyTopNavigation
      profileMenuOpen={profileMenuOpen}
      onProfilePress={onProfilePress}
      onBeforeOpenNotifications={onNotificationOpen}
      avatarInitials="CL"
    />
  );
}
