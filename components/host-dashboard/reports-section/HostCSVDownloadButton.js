import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { FormattedMessage } from 'react-intl';

import { fetchCSVFileFromRESTService } from '../../../lib/api';
import { simpleDateToISOString } from '../../../lib/date-utils';
import { useAsyncCall } from '../../../lib/hooks/useAsyncCall';

import Link from '../../Link';
import StyledButton from '../../StyledButton';
import StyledLink from '../../StyledLink';

const getHostReportURL = (hostSlug, params) => {
  const { dateFrom, dateTo, accountsSlugs, format = 'txt' } = params || {};
  const url = new URL(`${process.env.REST_URL}/v2/${hostSlug}/hostTransactions.${format}`);

  if (dateFrom) {
    url.searchParams.set('dateFrom', dateFrom);
  }
  if (dateTo) {
    url.searchParams.set('dateTo', dateTo);
  }
  if (accountsSlugs?.length) {
    url.searchParams.set('account', accountsSlugs.join(','));
  }

  url.searchParams.set('fetchAll', '1');

  return url.toString();
};

const prepareDateArgs = dateInterval => {
  if (!dateInterval) {
    return {};
  } else {
    return {
      dateFrom: simpleDateToISOString(dateInterval.from, false, dateInterval.timezoneType),
      dateTo: simpleDateToISOString(dateInterval.to, true, dateInterval.timezoneType),
    };
  }
};

const triggerCSVDownload = (host, reportUrl, dateInterval) => {
  let filename = `host-${host.slug}-transactions`;
  if (dateInterval?.from) {
    const until = dateInterval.to || dayjs().format('YYYY-MM-DD');
    filename += `-${dateInterval.from}-${until}`;
  }

  return fetchCSVFileFromRESTService(reportUrl, filename);
};

const HostCSVDownloadButton = ({ host, collectives, dateInterval }) => {
  const accountsSlugs = collectives?.map(c => c.slug);
  const hostReportUrl = getHostReportURL(host?.slug, { ...prepareDateArgs(dateInterval), accountsSlugs });
  const { loading: isFetching, call: downloadCSV } = useAsyncCall(
    () => triggerCSVDownload(host, hostReportUrl, dateInterval),
    { useErrorToast: true },
  );

  return (
    <StyledLink
      as={Link}
      width="100%"
      href={hostReportUrl}
      onClick={e => {
        e.preventDefault();
        downloadCSV();
      }}
    >
      <StyledButton
        buttonStyle="primary"
        buttonSize="small"
        py="7px"
        minWidth={140}
        width="100%"
        loading={isFetching}
        disabled={!host}
      >
        <FormattedMessage defaultMessage="Generate CSV report" />
      </StyledButton>
    </StyledLink>
  );
};

HostCSVDownloadButton.propTypes = {
  collectives: PropTypes.arrayOf(PropTypes.shape({ slug: PropTypes.string.isRequired })),
  dateInterval: PropTypes.object,
  host: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    legacyId: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
  }),
};

export default HostCSVDownloadButton;
