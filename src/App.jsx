import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { UserContextProvider } from './Context/UserContext';
import Layout from './components/Layout/Layout';
import { Toaster } from 'sonner'; // For notifications
import PaymentReceipt from './components/PaymentReceipt';
import ExperiencePage from './pages/ExperienceDetails';
import ServicePage from './pages/ServiceDetails';
import Dashboard from './components/Account/BecomeAHost';
import FavoritesPage from './pages/FavouritesPage';



const IndexPage = lazy(() => import('./pages/IndexPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PlacesPage = lazy(() => import('./pages/PlacesPage'));
const PlacesFormPage = lazy(() => import('./pages/PlacesFormPage'));
const PlacePage = lazy(() => import('./pages/PropertyDetails'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const ExperiencesPage = lazy(() => import('./pages/ExperiencePage'));
const Services = lazy(() => import('./pages/ServicesPage'));


import axios from 'axios';
import ScrollToTop from './components/Layout/ScrollToTop';
import ScrollToTopButton from './components/Layout/ScrollToTopButton'
import BookingDetails from './pages/BookingDetailsPage';
import VerifyBookingPage from './components/Booking/BookingVerify';
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true;

function App() {

  

  return (
    <UserContextProvider>
      <Router>
        <ScrollToTop/>
        <ScrollToTopButton/>
        <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<IndexPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/account" element={<ProfilePage />} />
              <Route path="/account/places" element={<PlacesPage />} />
              <Route path="/account/places/new" element={<PlacesFormPage />} />
              <Route path="/account/places/:id" element={<PlacesFormPage />} />
              <Route path="/place/:id" element={<PlacePage />} />
              <Route path="/account/bookings" element={<BookingsPage />} />
              <Route path="/account/bookings/:id" element={<BookingDetails/>} />
               <Route path="/payment" element={<PaymentReceipt />} />
               <Route path="/experiences" element={<ExperiencesPage />} />
               <Route path="/services" element={<Services />} />
               <Route path="/experiences/:id" element={<ExperiencePage />} />
               <Route path="/service/:id" element={<ServicePage />} />
               <Route path="/become-host" element={<Dashboard/>}/>
               <Route path="/wishlist" element={<FavoritesPage/>}/>
               <Route path="/verify" element={<VerifyBookingPage />} />
            </Route>
          </Routes>
          <Toaster />
        </Suspense>
      </Router>
    </UserContextProvider>
  );
}

export default App;
