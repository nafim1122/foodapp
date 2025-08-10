import React, { useState } from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Temporary placeholder - will be connected to stores later
  const user = null;
  const cartItemsCount = 0;

  const handleLogout = () => {
    // Will implement logout logic later
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">🍕 FoodDelivery</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/restaurants" className="text-gray-700 hover:text-primary-600 font-medium">
              Restaurants
            </Link>
            
            {user ? (
              <>
                {user.role === 'customer' && (
                  <>
                    <Link href="/cart" className="relative text-gray-700 hover:text-primary-600 font-medium">
                      Cart
                      {cartItemsCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartItemsCount}
                        </span>
                      )}
                    </Link>
                    <Link href="/orders" className="text-gray-700 hover:text-primary-600 font-medium">
                      My Orders
                    </Link>
                  </>
                )}
                
                {user.role === 'shop_owner' && (
                  <>
                    <Link href="/dashboard/shop" className="text-gray-700 hover:text-primary-600 font-medium">
                      Dashboard
                    </Link>
                    <Link href="/dashboard/shop/orders" className="text-gray-700 hover:text-primary-600 font-medium">
                      Orders
                    </Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <Link href="/admin" className="text-gray-700 hover:text-primary-600 font-medium">
                    Admin
                  </Link>
                )}

                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center text-gray-700 hover:text-primary-600 font-medium"
                  >
                    <span className="mr-2">{user.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              <Link
                href="/restaurants"
                className="block py-2 text-gray-700 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Restaurants
              </Link>
              
              {user ? (
                <>
                  {user.role === 'customer' && (
                    <>
                      <Link
                        href="/cart"
                        className="block py-2 text-gray-700 hover:text-primary-600 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Cart ({cartItemsCount})
                      </Link>
                      <Link
                        href="/orders"
                        className="block py-2 text-gray-700 hover:text-primary-600 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                    </>
                  )}
                  
                  {user.role === 'shop_owner' && (
                    <>
                      <Link
                        href="/dashboard/shop"
                        className="block py-2 text-gray-700 hover:text-primary-600 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/shop/orders"
                        className="block py-2 text-gray-700 hover:text-primary-600 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Orders
                      </Link>
                    </>
                  )}

                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block py-2 text-gray-700 hover:text-primary-600 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    className="block py-2 text-gray-700 hover:text-primary-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-2 text-gray-700 hover:text-primary-600 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block py-2 text-gray-700 hover:text-primary-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block py-2 text-gray-700 hover:text-primary-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
