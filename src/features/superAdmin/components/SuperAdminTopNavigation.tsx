import React from 'react';
import AgencyTopNavigation from '../../dashboard/components/AgencyTopNavigation';

// Share the brand header's dimensions and interaction treatment across roles.
export default function SuperAdminTopNavigation(props: React.ComponentProps<typeof AgencyTopNavigation>) {
  return <AgencyTopNavigation {...props} />;
}
