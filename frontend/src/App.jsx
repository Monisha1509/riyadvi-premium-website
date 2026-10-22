import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Assistant from './components/Assistant.jsx';
import ContactDock from './components/ContactDock.jsx';
import RouteFallback from './components/RouteFallback.jsx';

const SmoothScroll = lazy(() => import('./components/SmoothScroll.jsx'));
const Home = lazy(() => import('./pages/Home.jsx'));
const ServicesPage = lazy(() => import('./pages/Pages.jsx').then(m => ({ default: m.ServicesPage })));
const ServiceDetail = lazy(() => import('./pages/Pages.jsx').then(m => ({ default: m.ServiceDetail })));
const PortfolioPage = lazy(() => import('./pages/Pages.jsx').then(m => ({ default: m.PortfolioPage })));
const CaseStudy = lazy(() => import('./pages/Pages.jsx').then(m => ({ default: m.CaseStudy })));
const AboutPage = lazy(() => import('./pages/Pages.jsx').then(m => ({ default: m.AboutPage })));
const BlogPage = lazy(() => import('./pages/Pages.jsx').then(m => ({ default: m.BlogPage })));
const BlogDetail = lazy(() => import('./pages/Pages.jsx').then(m => ({ default: m.BlogDetail })));
const CareersPage = lazy(() => import('./pages/Pages.jsx').then(m => ({ default: m.CareersPage })));
const JobDetail = lazy(() => import('./pages/Pages.jsx').then(m => ({ default: m.JobDetail })));
const ContactPage = lazy(() => import('./pages/Pages.jsx').then(m => ({ default: m.ContactPage })));
const ConsultationPage = lazy(() => import('./pages/Pages.jsx').then(m => ({ default: m.ConsultationPage })));
const HealthCheckPage = lazy(() => import('./pages/Pages.jsx').then(m => ({ default: m.HealthCheckPage })));
const GuidePage = lazy(() => import('./pages/Pages.jsx').then(m => ({ default: m.GuidePage })));
const AdminPage = lazy(() => import('./pages/Pages.jsx').then(m => ({ default: m.AdminPage })));
const LegalPage = lazy(() => import('./pages/Pages.jsx').then(m => ({ default: m.LegalPage })));
const NotFound = lazy(() => import('./pages/Pages.jsx').then(m => ({ default: m.NotFound })));

export default function App() {
  const location = useLocation();
  return <Layout><Suspense fallback={null}><SmoothScroll/></Suspense><div key={location.pathname} className="route-transition"><Suspense fallback={<RouteFallback/>}><Routes>
    <Route path="/" element={<Home/>}/><Route path="/services" element={<ServicesPage/>}/><Route path="/services/:slug" element={<ServiceDetail/>}/>
    <Route path="/portfolio" element={<PortfolioPage/>}/><Route path="/portfolio/:slug" element={<CaseStudy/>}/><Route path="/about" element={<AboutPage/>}/>
    <Route path="/blog" element={<BlogPage/>}/><Route path="/blog/:slug" element={<BlogDetail/>}/><Route path="/careers" element={<CareersPage/>}/><Route path="/careers/:jobSlug" element={<JobDetail/>}/>
    <Route path="/contact" element={<ContactPage/>}/><Route path="/consultation" element={<ConsultationPage/>}/><Route path="/business-health-checkup" element={<HealthCheckPage/>}/><Route path="/software-project-planning-guide" element={<GuidePage/>}/><Route path="/admin" element={<AdminPage/>}/><Route path="/privacy" element={<LegalPage kind="privacy"/>}/><Route path="/terms" element={<LegalPage kind="terms"/>}/><Route path="*" element={<NotFound/>}/>
  </Routes></Suspense></div><ContactDock/><Assistant/></Layout>;
}
