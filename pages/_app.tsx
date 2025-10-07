// pages/_app.tsx

import 'mapbox-gl/dist/mapbox-gl.css';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthContextProvider, useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { NextComponentType, NextPageContext } from 'next';

const publicRoutes = ['/', '/login', '/signup', '/loginp', '/logina'];
const policeRoutes = ['/police', '/police/list', '/police/analytics'];
const userRoutes = ['/dashboard', '/reports', '/analytics'];
const ambulanceRoutes = ['/ambulancedashboard'];

type AppContentProps = {
  Component: NextComponentType<NextPageContext, any, {}>;
  pageProps: any;
};

const AppContent = ({ Component, pageProps }: AppContentProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const currentPath = router.pathname;

  useEffect(() => {
    if (loading) return;

    const isPoliceRoute = policeRoutes.some(path => currentPath.startsWith(path));
    const isUserRoute = userRoutes.some(path => currentPath.startsWith(path));
    const isAmbulanceRoute = ambulanceRoutes.some(path => currentPath.startsWith(path));

    if (!user) {
      if (isPoliceRoute || isUserRoute || isAmbulanceRoute) {
        router.push('/');
      }
      return;
    }
    
    // Check user roles based on email
    const isPoliceUser = user.email === 'officer1@gmail.com';
    const isAmbulanceUser = user.email === 'medic1@rescueconnect.com'; // Use your ambulance user's email here

    if (isPoliceUser && !isPoliceRoute) router.push('/police');
    if (isAmbulanceUser && !isAmbulanceRoute) router.push('/ambulancedashboard');
    
    if (!isPoliceUser && !isAmbulanceUser && (isPoliceRoute || isAmbulanceRoute)) {
      router.push('/dashboard');
    }

  }, [user, loading, currentPath, router]);

  return <Component {...pageProps} />;
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthContextProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </AuthContextProvider>
  );
}