// pages/dashboard/index.js
import { useState , useEffect } from 'react';
import AccountPage from './account';
import BuyOrderPage from './buyorder';
import SubscriptionPage from './subscription';
import NotificationsPage from './notifications';
import Sidebar from '../../components/sidebar';
import { decodeJwt } from '@/components/utils/token';
import Router from 'next/router';

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState('account');
  const [connectedUser, setConnectedUser] = useState(false);

  useEffect(() => {
    if (!decodeJwt()) {
        setConnectedUser(false)
        Router.push('/login')
        } else {
            setConnectedUser(true)
            }
    }
    , []);

  const renderSelectedTab = () => {
    switch (selectedTab) {
      case 'account':
        return <AccountPage />;
      case 'buy-order':
        return <BuyOrderPage />;
      case 'subscription':
        return <SubscriptionPage />;
      case 'notifications':
        return <NotificationsPage />;
      default:
        return <AccountPage />;
    }
  };

  return (
    <>
    {connectedUser ? (
      <div className="flex">
        <Sidebar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        <div className="flex-1">{renderSelectedTab()}</div>
      </div>
    ) : null}
  </>
  );
};

export default Dashboard;
