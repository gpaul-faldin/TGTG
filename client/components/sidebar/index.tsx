import { useState } from 'react';
import {  IoCart, IoNewspaperOutline, IoNotifications, IoLogOut } from 'react-icons/io5';
import { FiChevronRight, FiChevronLeft , FiUser } from 'react-icons/fi';
import Router from 'next/router';

import Link from 'next/link';

const Sidebar = ({ selectedTab, setSelectedTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const tabs = [
    { id: 'account', label: 'Info du compte', icon: <FiUser /> },
    { id: 'buy-order', label: 'Achats', icon: <IoCart /> },
    { id: 'subscription', label: 'Abonnement', icon: <IoNewspaperOutline /> },
    { id: 'notifications', label: 'Notifications', icon: <IoNotifications /> },
  ];

  return (
<div className={`bg-[#42273B] p-2 flex flex-col h-screen text-gray-200 items-center  ${isCollapsed ? 'justify-end' : 'justify-between'}`}>
  <div className="flex items-center">
    <Link href="/">
      <div className="items-center">
        {!isCollapsed ? (
          <div>
            <div className="font-roboto font-bold text-white text-2xl">To Good</div>
            <div className="font-roboto font-bold text-white text-2xl">To Bot</div>
          </div>
        ) : null}
      </div>
    </Link>
    <img src="/bot.png" alt="To Good to Bot" className="w-10 h-10 mt-3" />
  </div>
  <div className="p-4">
    <hr className="border-2 border-[#3C2436]" />
    <ul className="space-y-4">
      {tabs.map((tab) => (
        <li
          key={tab.id}
          className={`cursor-pointer flex items-center p-3 rounded-lg  ${
            selectedTab === tab.id ? 'bg-[#3C2436]' : ''
          }`}
          onClick={() => handleTabClick(tab.id)}
        >
          <span className="text-2xl mr-2">{tab.icon}</span>
          {!isCollapsed && <span className="font-Poppins">{tab.label}</span>}
        </li>
      ))}
    </ul>
  </div> <button className="focus:outline-none" onClick={toggleCollapse}>
      {isCollapsed ? <FiChevronRight size={30} /> : <FiChevronLeft size={30} />}
    </button>
  <div className="mt-auto">
   
    <div onClick={() => Router.push('/logout')} className="flex items-center cursor-pointer">
      {!isCollapsed ? (
          <div className="m-1">
              Logout  
          </div>
        ) : null}
      {/* Insert your logout icon (example uses an icon from Material Icons) */}
      <IoLogOut size={30} />
    </div>
  </div>
</div>
  );
};

export default Sidebar;
