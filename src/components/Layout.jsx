import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { Toaster } from 'react-hot-toast';
import Header from './Header';
import Footer from './Footer';

// Layout component that includes Header, Footer, and Toast notifications
const Layout = () => (
  <div className="d-flex flex-column min-vh-100 bg-light">
    <Header />
    <main className="flex-grow-1">
      <Container>
        <Outlet />
      </Container>
    </main>
    <Footer />
    
    {/* Toast notifications */}
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 4000,
          iconTheme: {
            primary: '#10B981',
            secondary: '#FFFFFF',
          },
        },
        error: {
          duration: 6000,
          iconTheme: {
            primary: '#EF4444',
            secondary: '#FFFFFF',
          },
        },
      }}
    />
  </div>
);

export default Layout;
