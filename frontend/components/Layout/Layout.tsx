import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <span className="text-2xl font-bold text-orange-600">🍕 FoodDelivery</span>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <a href="/auth/login" className="text-gray-700 hover:text-orange-600">
              Login
            </a>
            <a href="/auth/register" className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-2xl font-bold text-white">🍕 FoodDelivery</span>
          <p className="text-gray-300 text-base mt-2">
            Your favorite meals delivered fresh and fast.
          </p>
          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-base text-gray-400">
              &copy; 2025 FoodDelivery. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Food Delivery App',
  description = 'Order delicious food from your favorite restaurants'
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {title !== 'Food Delivery App' && (
        <title>{title}</title>
      )}
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};
