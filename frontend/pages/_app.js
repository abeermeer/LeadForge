import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const campaignId = router.query?.id || null;

  return (
    <Layout campaignId={campaignId}>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'toast-premium',
          duration: 4000,
          style: {
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
          },
        }}
      />
    </Layout>
  );
}
