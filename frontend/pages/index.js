import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getUser();
    if (currentUser) {
      setUser(currentUser);
    }
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/shops');
      if (response.ok) {
        const data = await response.json();
        setShops(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching shops:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold text-orange-600">🍕 FoodDelivery</a>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">Welcome, {user.name}</span>
                  {user.role === 'admin' && (
                    <a href="/admin/dashboard" className="text-orange-600 hover:text-orange-700">Admin Panel</a>
                  )}
                  {user.role === 'shop_owner' && (
                    <a href="/dashboard/shop" className="text-orange-600 hover:text-orange-700">Shop Dashboard</a>
                  )}
                  <button 
                    onClick={() => {
                      authService.logout();
                      window.location.reload();
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a href="/auth/login" className="text-gray-700 hover:text-orange-600">Login</a>
                  <a href="/auth/register" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm">
                    Sign Up
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-orange-600">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
              Delicious Food Delivered
            </h1>
            <p className="mt-6 text-xl text-orange-100 max-w-3xl mx-auto">
              Order from your favorite restaurants and get fresh, hot meals delivered right to your door.
            </p>
            <div className="mt-8">
              {!user && (
                <a
                  href="/auth/register"
                  className="inline-block bg-white text-orange-600 font-semibold py-3 px-8 rounded-lg text-lg hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Why Choose FoodDelivery?</h2>
            <p className="mt-4 text-lg text-gray-600">Experience the best food delivery service</p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Get your food delivered in 30 minutes or less</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍴</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Food</h3>
              <p className="text-gray-600">Fresh ingredients and delicious meals from top restaurants</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Ordering</h3>
              <p className="text-gray-600">Simple and intuitive ordering process</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Restaurants */}
      {shops.length > 0 && (
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900">Popular Restaurants</h2>
              <p className="mt-4 text-lg text-gray-600">Discover amazing restaurants in your area</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.slice(0, 6).map((shop) => (
                <div key={shop._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-orange-200 flex items-center justify-center">
                    <span className="text-4xl">🍽️</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{shop.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{shop.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        {shop.category}
                      </span>
                      {shop.rating && (
                        <div className="flex items-center">
                          <span className="text-yellow-400">⭐</span>
                          <span className="ml-1 text-sm text-gray-600">{shop.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-orange-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Ready to Order?
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Join thousands of satisfied customers
            </p>
            {!user ? (
              <div className="space-x-4">
                <a
                  href="/auth/register"
                  className="inline-block bg-white text-orange-600 font-semibold py-3 px-8 rounded-lg text-lg hover:bg-gray-100 transition-colors"
                >
                  Sign Up Now
                </a>
                <a
                  href="/auth/login"
                  className="inline-block border border-white text-white font-semibold py-3 px-8 rounded-lg text-lg hover:bg-orange-700 transition-colors"
                >
                  Login
                </a>
              </div>
            ) : (
              <div className="text-white">
                <p className="text-lg">Welcome back! Start browsing restaurants to place your order.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">© 2025 FoodDelivery. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
