import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';

import { MantineProvider } from '@mantine/core';
import { Navigation } from './pages/router';

function App() {
  return (
    <MantineProvider>
      <Navigation />
    </MantineProvider>
  );
}

export default App;
