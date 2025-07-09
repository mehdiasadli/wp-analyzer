import { Button } from '@mantine/core';
import { useData } from '../stores/data.store';
import { useNavigate } from 'react-router-dom';

export function ShowStatsButton() {
  const { messages } = useData();
  const navigate = useNavigate();

  function handleClick() {
    if (messages.length === 0) {
      alert('No messages found, try to upload a chat file first');
      return;
    }

    navigate('/stats');
  }

  return <Button onClick={handleClick}>Show Stats</Button>;
}
