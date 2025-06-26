// Header.tsx
import React from 'react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={`bg-purple-700 text-white p-3 ${className}`}>
      <h1 className="text-3xl">Anime Vocab Trainer</h1>
    </header>
  );
};

export default Header;

  
  