import React from 'react';
import PropTypes from 'prop-types';
import { themeGet } from '@styled-system/theme-get';
import styled from 'styled-components';

import { Box, Flex } from '../Grid';
import LoadingPlaceholder from '../LoadingPlaceholder';

import AccountSwitcher from './AccountSwitcher';
import Menu from './TopBarMenu';
import { MenuContainer } from './TopBarMenuComponents';

const SidebarContainer = styled(Box)`
  border-bottom: 1px solid #e6e8eb;
`;

const Sticky = styled(Box)`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
`;

const AdminPanelSideBar = ({
  collective,
  activeSlug,
  isAccountantOnly,
  isLoading,
  selectedSection,
  onRoute,
  expandedSection,
  ...props
}) => {
  return (
    <SidebarContainer>
      <Sticky px={[2, 3, '20px']} py={[2]}>
        <Flex flex={1} maxWidth={1200}>
          <MenuContainer>
            {/* <AccountSwitcher activeSlug={activeSlug} /> */}

            {isLoading ? (
              <Box>
                {[...Array(5).keys()].map(i => (
                  <li key={i}>
                    <LoadingPlaceholder height={24} mb={12} borderRadius={8} maxWidth={'70%'} />
                  </li>
                ))}
              </Box>
            ) : (
              <Menu {...{ collective, selectedSection, onRoute, isAccountantOnly, expandedSection }} />
            )}
          </MenuContainer>
        </Flex>
      </Sticky>
    </SidebarContainer>
  );
};

AdminPanelSideBar.propTypes = {
  isLoading: PropTypes.bool,
  selectedSection: PropTypes.string,
  collective: PropTypes.shape({
    slug: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
    isHost: PropTypes.bool,
  }),
  isAccountantOnly: PropTypes.bool,
  onRoute: PropTypes.func,
  activeSlug: PropTypes.string,
};

export default AdminPanelSideBar;
