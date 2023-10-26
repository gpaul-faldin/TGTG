import React from 'react';
import Image from 'next/image';

const HomePage = () => {
  return (
    <div className=" min-h-screen flex flex-col md:flex-row items-center justify-center p-8" style={{background:"#42273B"}}>
      <div className="max-w-xl text-white md:pr-8 mb-4 text-center md:text-left mt-navbar">
        <h1 className="text-4xl font-bold">Bienvenue sur notre site</h1>
        <p className="text-xl mt-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ac
          vestibulum libero. Proin nec justo in metus ultrices facilisis.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ac
          vestibulum libero. Proin nec justo in metus ultrices facilisis.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ac
          vestibulum libero. Proin nec justo in metus ultrices facilisis.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ac
          vestibulum libero. Proin nec justo in metus ultrices facilisis.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ac
          vestibulum libero. Proin nec justo in metus ultrices facilisis.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ac
          vestibulum libero. Proin nec justo in metus ultrices facilisis.
        </p>
      </div>
      <div className="md:w-1/2">
        <div className="w-full md:max-w-md mx-auto">
          <Image
            src="/sac.png"
            width={500}
            height={500}
            alt="Image description"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
