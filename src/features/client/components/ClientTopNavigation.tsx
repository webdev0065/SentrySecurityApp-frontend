import React from 'react';
import AgencyTopNavigation from '../../dashboard/components/AgencyTopNavigation';

export default function ClientTopNavigation({
  profileMenuOpen,
  onProfilePress,
  onNotificationPress,
}: {
  profileMenuOpen: boolean;
  onProfilePress: () => void;
  onNotificationPress: () => void;
}) {
  return (
    <AgencyTopNavigation
      profileMenuOpen={profileMenuOpen}
      onProfilePress={onProfilePress}
      onNotificationPress={onNotificationPress}
      avatarInitials="CL"
    />
  );
}
