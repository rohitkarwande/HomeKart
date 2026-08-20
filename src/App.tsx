import React from 'react';
import { HomekartProvider, useHomekart } from './store/homekartStore';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import DropPoints from './pages/DropPoints';
import MonthlyBasket from './pages/MonthlyBasket';
import Leader from './pages/Leader';
import Referrals from './pages/Referrals';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Settings from './pages/Settings';
import Payment from './pages/Payment';
import OrderSuccess from './pages/OrderSuccess';

import './App.css';

const MainAppContent: React.FC = () => {
  const { activePage } = useHomekart();

  // Route resolver rendering pages conditionally
  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home />;
      case 'shop':
        return <Shop />;
      case 'product':
        return <ProductDetail />;
      case 'groups':
        return <Groups />;
      case 'groupDetail':
        return <GroupDetail />;
      case 'cart':
        return <Cart />;
      case 'checkout':
        return <Checkout />;
      case 'orders':
        return <Orders />;
      case 'dropPoints':
        return <DropPoints />;
      case 'monthlyBasket':
        return <MonthlyBasket />;
      case 'leader':
        return <Leader />;
      case 'referrals':
        return <Referrals />;
      case 'notifications':
        return <Notifications />;
      case 'profile':
        return <Profile />;
      case 'auth':
        return <Auth />;
      case 'settings':
        return <Settings />;
      case 'payment':
        return <Payment />;
      case 'orderSuccess':
        return <OrderSuccess />;
      default:
        return <Home />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: 'var(--color-off-white)'
    }}>
      {/* Top Desktop Navigation */}
      <Header />

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        padding: '32px 0 64px 0',
      }}>
        <div className="container">
          {renderPage()}
        </div>
      </main>

      {/* Informational Footer */}
      <Footer />

      {/* Bottom Mobile Tab Bar */}
      <MobileNav />
    </div>
  );
};

function App() {
  return (
    <HomekartProvider>
      <MainAppContent />
    </HomekartProvider>
  );
}

export default App;
