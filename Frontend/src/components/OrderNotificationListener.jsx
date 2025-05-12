import { useEffect } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { useToast } from '../context/ToastContext';

const OrderNotificationListener = () => {
  const { addToast } = useToast();

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('http://localhost:5176/orderHub')
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        connection.on('OrderPlaced', (message) => {
          addToast(message, 'info');
        });
      })
      .catch(err => console.error('SignalR Connection Error:', err));

    return () => {
      connection.stop();
    };
  }, [addToast]);

  return null;
};

export default OrderNotificationListener; 