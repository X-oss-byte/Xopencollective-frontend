import React from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery } from '@apollo/client';
import { omitBy } from 'lodash';
import { useRouter } from 'next/router';
import { FormattedMessage } from 'react-intl';

import { API_V2_CONTEXT } from '../../../lib/graphql/helpers';

import { Box, Flex } from '../../Grid';
import LoadingPlaceholder from '../../LoadingPlaceholder';
import MessageBox from '../../MessageBox';
import MessageBoxGraphqlError from '../../MessageBoxGraphqlError';
import Pagination from '../../Pagination';
import SearchBar from '../../SearchBar';
import StyledHr from '../../StyledHr';
import { H1 } from '../../Text';
import HostAdminCollectiveFilters, { COLLECTIVE_FILTER } from '../HostAdminCollectiveFilters';
import Filters from '../../Filters';
import PendingApplication, { processApplicationAccountFields } from './PendingApplication';

const COLLECTIVES_PER_PAGE = 20;

const pendingApplicationsQuery = gql`
  query HostDashboardPendingApplications(
    $hostSlug: String!
    $limit: Int!
    $offset: Int!
    $orderBy: ChronologicalOrderInput!
    $searchTerm: String
  ) {
    host(slug: $hostSlug) {
      id
      slug
      name
      type
      settings
      policies {
        COLLECTIVE_MINIMUM_ADMINS {
          numberOfAdmins
        }
      }
      pendingApplications(limit: $limit, offset: $offset, orderBy: $orderBy, searchTerm: $searchTerm) {
        offset
        limit
        totalCount
        nodes {
          id
          message
          customData
          account {
            id
            legacyId
            name
            slug
            website
            description
            type
            imageUrl(height: 96)
            createdAt
            ... on AccountWithHost {
              ...ProcessHostApplicationFields
            }
            memberInvitations(role: [ADMIN]) {
              id
              role
            }
            admins: members(role: ADMIN) {
              totalCount
              nodes {
                id
                account {
                  id
                  type
                  slug
                  name
                  imageUrl(height: 48)
                }
              }
            }
          }
        }
      }
    }
  }
  ${processApplicationAccountFields}
`;

const checkIfQueryHasFilters = query =>
  Object.entries(query).some(([key, value]) => {
    return !['view', 'offset', 'limit', 'hostCollectiveSlug', 'sort-by'].includes(key) && value;
  });

const getVariablesFromQuery = query => {
  return {
    offset: parseInt(query.offset) || 0,
    limit: query.limit ? Number(query.limit) : COLLECTIVES_PER_PAGE,
    searchTerm: query.searchTerm,
    hostFeesStructure: query['fees-structure'],
    orderBy: {
      field: 'CREATED_AT',
      direction: query['sort-by'] === 'oldest' ? 'ASC' : 'DESC',
    },
  };
};

const ROUTE_PARAMS = ['hostCollectiveSlug', 'slug', 'section', 'view'];

const updateQuery = (router, newParams) => {
  const query = omitBy({ ...router.query, ...newParams }, (value, key) => !value || ROUTE_PARAMS.includes(key));
  const pathname = router.asPath.split('?')[0];
  return router.push({ pathname, query });
};

const enforceDefaultParamsOnQuery = query => {
  return {
    ...query,
    status: query.status || 'PENDING',
  };
};

const PendingApplications = ({ hostSlug }) => {
  const router = useRouter() || {};
  const query = enforceDefaultParamsOnQuery(router.query);
  const hasFilters = React.useMemo(() => checkIfQueryHasFilters(query), [query]);
  const { data, error, loading, variables } = useQuery(pendingApplicationsQuery, {
    variables: { hostSlug, ...getVariablesFromQuery(query) },
    context: API_V2_CONTEXT,
  });
  const views = [
    {
      label: 'Pending',
      query: { status: 'PENDING' },
      count: data?.host?.pendingApplications?.totalCount,
      showCount: true,
    },
    { label: 'Rejected', query: { status: 'REJECTED' } },
    {
      label: 'Approved',
      query: { status: 'APPROVED' },
    },
  ];

  const hostApplications = data?.host?.pendingApplications;
  return (
    <div>
      {/* <Box mb={34}>
        {data?.host ? (
          <HostAdminCollectiveFilters
            filters={[COLLECTIVE_FILTER.SORT_BY]}
            values={query}
            onChange={queryParams =>
              updateQuery(router, {
                ...queryParams,
                offset: null,
              })
            }
          />
        ) : loading ? (
          <LoadingPlaceholder height={70} />
        ) : null}
      </Box> */}

      <Filters
        title={<FormattedMessage defaultMessage="Applications" />}
        views={views}
        query={omitBy(query, (value, key) => !value || ROUTE_PARAMS.includes(key))}
        filterOptions={[
          {
            key: 'status',
            label: 'Status',
            noFilter: 'ALL',
            options: ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'],
          },
          {
            key: 'searchTerm',
            label: 'Text search',
          },
        ]}
        orderByKey="sort-by"
        orderByOptions={[
          { value: 'most-recent', label: 'Most recent' },
          { value: 'oldest', label: 'Oldest' },
        ]}
        onChange={queryParams => {
          const pathname = router.asPath.split('?')[0];
          if (
            queryParams.status === 'APPROVED' ||
            queryParams.status === 'REJECTED' ||
            queryParams.status === 'EXPIRED'
          ) {
            return router.push({ pathname, query: { ...queryParams, limit: 0 } });
          }
          return router.push({ pathname, query: queryParams });
        }}
      />

      {error && <MessageBoxGraphqlError error={error} mb={2} />}

      {!error && !loading && !hostApplications?.nodes.length ? (
        <MessageBox type="info" withIcon data-cy="zero-collective-message">
          {hasFilters ? (
            <FormattedMessage id="discover.searchNoResult" defaultMessage="No Collectives match the current search." />
          ) : (
            <FormattedMessage id="menu.collective.none" defaultMessage="No Collectives yet" />
          )}
        </MessageBox>
      ) : (
        <React.Fragment>
          {loading
            ? Array.from(new Array(COLLECTIVES_PER_PAGE)).map((_, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Box key={index} mb={24}>
                  <LoadingPlaceholder height={362} borderRadius="8px" />
                </Box>
              ))
            : hostApplications?.nodes.map(application => (
                <Box key={application.id} mb={24} data-cy="host-application">
                  <PendingApplication host={data.host} application={application} />
                </Box>
              ))}
          <Flex mt={5} justifyContent="center">
            <Pagination
              total={hostApplications?.totalCount}
              limit={variables.limit}
              offset={variables.offset}
              ignoredQueryParams={ROUTE_PARAMS}
            />
          </Flex>
        </React.Fragment>
      )}
    </div>
  );
};

PendingApplications.propTypes = {
  hostSlug: PropTypes.string.isRequired,
};

export default PendingApplications;
