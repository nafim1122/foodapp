import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>FoodDelivery - Order Your Favorite Food</title>
        <meta name="description" content="Order your favorite food from the best restaurants near you" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                Your Favorite Food,
                <span className="block text-primary-200">Delivered Fresh</span>
              </h1>
              <p className="text-xl sm:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
                Order from the best local restaurants and get your food delivered hot and fresh to your door.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/restaurants"
                  className="btn btn-lg bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Browse Restaurants
                </Link>
                <Link
                  href="/auth/register"
                  className="btn btn-lg bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-200"
                >
                  Join as Restaurant Owner
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Why Choose FoodDelivery?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We make food ordering simple, fast, and delicious.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Fast Delivery</h3>
                <p className="text-gray-600">
                  Get your food delivered in 30 minutes or less from your favorite restaurants.
                </p>
              </div>
              
              <div className="text-center p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Guaranteed</h3>
                <p className="text-gray-600">
                  We work only with the best restaurants to ensure high-quality meals every time.
                </p>
              </div>
              
              <div className="text-center p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure Payments</h3>
                <p className="text-gray-600">
                  Pay securely with your credit card, debit card, or digital wallet.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Order?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of satisfied customers who trust us with their food delivery.
            </p>
            <Link
              href="/restaurants"
              className="btn btn-lg bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Ordering Now
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
