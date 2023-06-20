import React from 'react';
import PropTypes from 'prop-types';
import { values } from 'lodash';
import { useIntl } from 'react-intl';
import styled from 'styled-components';

import AccountSettings from '../admin-panel/sections/AccountSettings';
import FinancialContributions from '../admin-panel/sections/FinancialContributions';
import HostVirtualCards from '../admin-panel/sections/HostVirtualCards';
import InvoicesReceipts from '../admin-panel/sections/InvoicesReceipts';
import NotificationsSettings from '../admin-panel/sections/NotificationsSettings';
import PendingContributions from '../admin-panel/sections/PendingContributions';
import TeamSettings from '../admin-panel/sections/Team';
import Container from '../Container';
import { Box } from '../Grid';
import PendingApplications from '../host-dashboard/applications/PendingApplications';
import HostDashboardExpenses from '../host-dashboard/HostDashboardExpenses';
import HostDashboardHostedCollectives from '../host-dashboard/HostDashboardHostedCollectives';
import HostDashboardReports from '../host-dashboard/HostDashboardReports';
import LoadingPlaceholder from '../LoadingPlaceholder';
import NotFound from '../NotFound';
import { H2 } from '../Text';

import Expenses from './sections/Expenses';
import ManageContributions from './sections/ManageContributions';
import Contributors from './sections/Contributors';

import Transactions from './sections/Transactions';
import ActivityLog from './sections/ActivityLog';
import {
  COLLECTIVE_SECTIONS,
  FISCAL_HOST_SECTIONS,
  HOST_DASHBOARD_SECTIONS,
  LEGACY_COLLECTIVE_SETTINGS_SECTIONS,
  SECTION_LABELS,
} from './constants';
import { ALL_SECTIONS } from '../admin-panel/constants';

const ADMIN_PANEL_SECTIONS = {
  [HOST_DASHBOARD_SECTIONS.HOSTED_COLLECTIVES]: HostDashboardHostedCollectives,
  [HOST_DASHBOARD_SECTIONS.FINANCIAL_CONTRIBUTIONS]: FinancialContributions,
  [HOST_DASHBOARD_SECTIONS.PENDING_CONTRIBUTIONS]: PendingContributions,
  [HOST_DASHBOARD_SECTIONS.HOST_EXPENSES]: HostDashboardExpenses,
  [HOST_DASHBOARD_SECTIONS.PENDING_APPLICATIONS]: PendingApplications,
  [HOST_DASHBOARD_SECTIONS.REPORTS]: HostDashboardReports,
  [HOST_DASHBOARD_SECTIONS.HOST_VIRTUAL_CARDS]: HostVirtualCards,
  [COLLECTIVE_SECTIONS.NOTIFICATIONS]: NotificationsSettings,
  [COLLECTIVE_SECTIONS.TEAM]: TeamSettings,
  // NEW
  [COLLECTIVE_SECTIONS.MANAGE_CONTRIBUTIONS]: ManageContributions,
  [COLLECTIVE_SECTIONS.CONTRIBUTORS]: Contributors,
  [COLLECTIVE_SECTIONS.EXPENSES]: Expenses,
  [COLLECTIVE_SECTIONS.TRANSACTIONS]: Transactions,
  [COLLECTIVE_SECTIONS.HOME]: ActivityLog,
};

const FISCAL_HOST_SETTINGS_SECTIONS = {
  [FISCAL_HOST_SECTIONS.INVOICES_RECEIPTS]: InvoicesReceipts,
};

const Title = styled(H2)`
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
`;

const AdminPanelSection = ({ collective, isLoading, section, subpath, settings }) => {
  const { formatMessage } = useIntl();

  if (isLoading) {
    return (
      <React.Fragment>
        <LoadingPlaceholder height={26} mb={4} maxWidth={500} />
        <LoadingPlaceholder height={300} />
      </React.Fragment>
    );
  }

  const AdminSectionComponent = ADMIN_PANEL_SECTIONS[section];
  if (AdminSectionComponent) {
    return (
      <AdminSectionComponent
        settings={settings}
        account={collective}
        hostSlug={collective.slug}
        subpath={subpath}
        isDashboard={true}
      />
    );
  }

  // Fiscal Host Settings
  const FiscalHostSettingsComponent = FISCAL_HOST_SETTINGS_SECTIONS[section];
  if (FiscalHostSettingsComponent) {
    return <FiscalHostSettingsComponent isDashboard={true} collective={collective} settings={settings} />;
  }

  // Form
  if (values(LEGACY_COLLECTIVE_SETTINGS_SECTIONS).includes(section)) {
    return (
      <Container width="100%">
        {SECTION_LABELS[section] && (
          <Box mb={3}>
            <Title>{formatMessage(SECTION_LABELS[section])}</Title>
          </Box>
        )}
        <AccountSettings account={collective} section={section} />
      </Container>
    );
  }

  return (
    <Container display="flex" justifyContent="center" alignItems="center">
      <NotFound />
    </Container>
  );
};

AdminPanelSection.propTypes = {
  isLoading: PropTypes.bool,
  section: PropTypes.string,
  subpath: PropTypes.arrayOf(PropTypes.string),
  /** The account. Can be null if isLoading is true */
  collective: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    name: PropTypes.string,
    isHost: PropTypes.bool,
  }),
};

export default AdminPanelSection;
