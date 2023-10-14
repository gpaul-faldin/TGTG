import React, { useState } from 'react';
import BurgerMenu from '../burgerMenu';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Modal from '../modal';
import Register from '@/pages/register';

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      className={`p-4 flex justify-between items-center fixed top-0 left-0 right-0 bg-purple-800 shadow-md `}
      style={{ backgroundColor: "#3C2436", height: "110px" }}
    >
       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
         <Register/>
        </Modal>
      <div className="flex items-center">
        <Link href="/">
          <div className="pl-16">
            <div className="font-roboto font-bold text-white text-2xl">To Good</div>
            <div className="font-roboto font-bold text-white text-2xl">To Bot</div>
          </div>
        </Link>
        <img src="/bot.png" alt="To Good to Bot" className="w-10 h-10 mt-3" />
      </div>
      <BurgerMenu isOpen={isMobileMenuOpen} toggleMenu={toggleMobileMenu} />
      <nav className={`md:flex md:space-x-4 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <Link href="/homepage">
          <div className={`text-white font-roboto text-xl mr-4 ${router.pathname === '/homepage' ? 'active' : ''}`}>
            Homepage
            {router.pathname === '/homepage' && <div className="active-bar"></div>}
          </div>
        </Link>
        <Link href="/plan">
          <div className={`text-white font-Grandstander  text-xl mr-4 ${router.pathname === '/plan' ? 'active' : ''}`}>
            Plan
            {router.pathname === '/plan' && <div className="active-bar"></div>}
          </div>
        </Link>
        <Link href="/profil">
          <div className={`text-white font-roboto  text-xl ${router.pathname === '/profil' ? 'active' : ''}`}>
            Profil
            {router.pathname === '/profil' && <div className="active-bar"></div>}
          </div>
        </Link>
      </nav>
      <button
  className="bg-green-500 text-white font-Grandstander px-8 py-2 rounded-full ml-4 text-xl"
  style={{ backgroundColor: "#9EE493", color: "#3C2436", fontFamily: "Grandstander" }}
  onClick={openModal}
>
  Sign In
</button>
      <style jsx>{`
        .active {
          border-bottom: 2px solid white;
        }

        .active-bar {
          height:00.5px;
          background-color: white;
          margin-top: 4px; 
        }
      `}</style>
    </header>
  );
};

export default NavBar;
