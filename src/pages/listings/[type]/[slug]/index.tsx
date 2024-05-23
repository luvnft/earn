import { Box, HStack, VStack } from '@chakra-ui/react';
import axios from 'axios';
import { useAtom } from 'jotai';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';

import { ErrorSection } from '@/components/shared/ErrorSection';
import { Comments } from '@/features/comments';
import {
  type Bounty,
  DescriptionUI,
  getListingTypeLabel,
  ListingHeader,
  ListingWinners,
  RightSideBar,
} from '@/features/listings';
import { bountySnackbarAtom } from '@/features/navbar';
import { type User } from '@/interface/user';
import { Default } from '@/layouts/Default';
import { getURL } from '@/utils/validUrl';

interface BountyDetailsProps {
  bounty: Bounty | null;
}

function BountyDetails({ bounty: initialBounty }: BountyDetailsProps) {
  const [, setBountySnackbar] = useAtom(bountySnackbarAtom);

  const [submissionNumber, setSubmissionNumber] = useState<number>(0);

  const getSubmissionsCount = async () => {
    try {
      const submissionCountDetails = await axios.get(
        `/api/submission/${initialBounty?.id}/count/`,
      );
      setSubmissionNumber(submissionCountDetails?.data || 0);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      await getSubmissionsCount();
      if (initialBounty) {
        setBountySnackbar({
          submissionCount: submissionNumber,
          deadline: initialBounty?.deadline,
          rewardAmount: initialBounty?.rewardAmount,
          type: initialBounty?.type,
          isPublished: initialBounty?.isPublished,
        });
      }
    };
    fetchSubmissions();
  }, [initialBounty, submissionNumber]);

  const encodedTitle = encodeURIComponent(initialBounty?.title || '');

  return (
    <Default
      meta={
        <Head>
          <title>{`Superteam Earn Bounty | ${
            initialBounty?.title || 'Apply'
          } by ${initialBounty?.sponsor?.name}`}</title>
          <meta
            name="description"
            content={`${getListingTypeLabel(
              initialBounty?.type ?? 'Bounty',
            )} on Superteam Earn | ${
              initialBounty?.sponsor?.name
            } is seeking freelancers and builders ${
              initialBounty?.title
                ? `to work on ${initialBounty.title}`
                : '| Apply Here'
            }`}
          />
          <link
            rel="canonical"
            href={`${getURL()}listings/${initialBounty?.type}/${initialBounty?.slug}/`}
          />
          <meta
            property="og:title"
            content={`${initialBounty?.title || 'Bounty'} | Superteam Earn`}
          />
          <meta
            property="og:image"
            content={`${getURL()}api/bounty-og/?title=${encodedTitle}&reward=${initialBounty?.rewardAmount}&token=${initialBounty?.token}&sponsor=${
              initialBounty?.sponsor?.name
            }&logo=${
              initialBounty?.sponsor?.logo
            }&type=${initialBounty?.type}&compensationType=${initialBounty?.compensationType}&minRewardAsk=${initialBounty?.minRewardAsk}&maxRewardAsk=${initialBounty?.maxRewardAsk}`}
          />
          <meta
            name="twitter:title"
            content={`${initialBounty?.title || 'Bounty'} | Superteam Earn`}
          />
          <meta
            name="twitter:image"
            content={`${getURL()}api/bounty-og/?title=${encodedTitle}&reward=${initialBounty?.rewardAmount}&token=${initialBounty?.token}&sponsor=${
              initialBounty?.sponsor?.name
            }&logo=${
              initialBounty?.sponsor?.logo
            }&type=${initialBounty?.type}&compensationType=${initialBounty?.compensationType}&minRewardAsk=${initialBounty?.minRewardAsk}&maxRewardAsk=${initialBounty?.maxRewardAsk}`}
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content="Superteam Bounty" />
          <meta charSet="UTF-8" key="charset" />
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1"
            key="viewport"
          />
        </Head>
      }
    >
      <Box>
        <>
          {initialBounty === null && <ErrorSection />}
          {initialBounty !== null && !initialBounty?.id && (
            <ErrorSection message="Sorry! The bounty you are looking for is not available." />
          )}
          {initialBounty !== null && !!initialBounty?.id && (
            <>
              <ListingHeader listing={initialBounty} />
              {initialBounty?.isWinnersAnnounced && (
                <ListingWinners bounty={initialBounty} />
              )}
              <HStack
                align={['center', 'center', 'start', 'start']}
                justify={['center', 'center', 'space-between', 'space-between']}
                flexDir={{ base: 'column-reverse', md: 'row' }}
                gap={4}
                maxW={'8xl'}
                mx={'auto'}
                mb={10}
                px={3}
              >
                <VStack gap={8} w={'full'} mt={{ base: 0, md: 10 }}>
                  <DescriptionUI
                    skills={initialBounty?.skills?.map((e) => e.skills) ?? []}
                    description={initialBounty?.description}
                  />
                  <Comments
                    isAnnounced={initialBounty?.isWinnersAnnounced ?? false}
                    listingSlug={initialBounty?.slug ?? ''}
                    listingType={initialBounty?.type ?? ''}
                    poc={initialBounty?.poc as User}
                    sponsorId={initialBounty?.sponsorId}
                    refId={initialBounty?.id ?? ''}
                    refType="BOUNTY"
                  />
                </VStack>
                <RightSideBar listing={initialBounty} />
              </HStack>
            </>
          )}
        </>
      </Box>
    </Default>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug, type } = context.query;

  let bountyData;
  try {
    const bountyDetails = await axios.get(`${getURL()}api/bounties/${slug}`, {
      params: { type },
    });
    bountyData = bountyDetails.data;
  } catch (e) {
    console.error(e);
    bountyData = null;
  }

  return {
    props: {
      bounty: bountyData,
    },
  };
};

export default BountyDetails;
