import React from 'react';

interface BurgerMenuProps {
    isOpen: boolean;
    toggleMenu: () => void;
}

const BurgerMenu = ({ isOpen, toggleMenu }: BurgerMenuProps) => {
    return (
        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <button
          onClick={toggleMenu}
          className="text-white p-2 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    );
  };
  
  export default BurgerMenu;