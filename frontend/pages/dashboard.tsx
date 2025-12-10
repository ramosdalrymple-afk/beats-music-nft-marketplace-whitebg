import Head from 'next/head';
import Dashboard from '@/components/Dashboard';

export default function SellerDashboard() {
  return (
    <>
      <Head>
        <title>My Dashboard - Beats NFT Marketplace</title>
        <meta name="description" content="Manage your listings and earnings" />
      </Head>
      <Dashboard />
    </>
  );
}
