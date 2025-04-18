import { 
  createBrowserRouter,
  createRoutesFromElements,
  Route
} from 'react-router-dom';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Layout from './components/Layout';

// Create routes configuration
const routes = createRoutesFromElements(
  <Route element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="gallery" element={<Gallery />} />
  </Route>
);

// Configure router with future flags to eliminate warnings
const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

export default router;
