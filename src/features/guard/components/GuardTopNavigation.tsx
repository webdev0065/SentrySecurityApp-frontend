import React from 'react';
import AgencyTopNavigation from '../../dashboard/components/AgencyTopNavigation';

type Props = {
  profileMenuOpen: boolean;
  onProfilePress: () => void;
  avatarInitials?: string;
  onNotificationSelect?: () => void;
};

/** Guard screens intentionally reuse the established Sentry header and notification panel. */
const GuardTopNavigation: React.FC<Props> = ({
  profileMenuOpen,
  onProfilePress,
  avatarInitials,
  onNotificationSelect,
}) => (
  <AgencyTopNavigation
    profileMenuOpen={profileMenuOpen}
    onProfilePress={onProfilePress}
    avatarInitials={avatarInitials || 'G'}
    onNotificationSelect={onNotificationSelect}
  />
);

export default GuardTopNavigation;
