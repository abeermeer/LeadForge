import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ErrorBoundary from '../components/ErrorBoundary';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const campaignId = (router.query?.id as string) || null;

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
