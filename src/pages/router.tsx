import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Navbar } from '../components/navbar';
import { Center, Container, Loader, Stack } from '@mantine/core';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./home.page').then((module) => ({ default: module.HomePage })));
const StatsPage = lazy(() => import('./stats.page').then((module) => ({ default: module.StatsPage })));
const MessagesPage = lazy(() => import('./messages.page').then((module) => ({ default: module.MessagesPage })));
const RankingPage = lazy(() => import('./ranking.page').then((module) => ({ default: module.RankingPage })));

// Loading component
function PageLoader() {
  return (
    <Container size='lg' py='xl'>
      <Stack align='center' gap='md'>
        <Loader size='lg' />
        <div>Loading...</div>
      </Stack>
    </Container>
  );
}

export function Navigation() {
  return (
    <BrowserRouter>
      <Container size='md' mt={20} mb={10}>
        <Center>
          <Navbar />
        </Center>
      </Container>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/stats' element={<StatsPage />} />
          <Route path='/messages' element={<MessagesPage />} />
          <Route path='/rankings' element={<RankingPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
