import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './home.page';
import { StatsPage } from './stats.page';
import { MessagesPage } from './messages.page';
import { RankingPage } from './ranking.page';
import { Navbar } from '../components/navbar';
import { Center, Container } from '@mantine/core';

export function Navigation() {
  return (
    <BrowserRouter>
      <Container size='md' mt={20} mb={10}>
        <Center>
          <Navbar />
        </Center>
      </Container>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/stats' element={<StatsPage />} />
        <Route path='/messages' element={<MessagesPage />} />
        <Route path='/rankings' element={<RankingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
