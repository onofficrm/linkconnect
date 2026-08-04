/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';

const HomePage = lazy(() => import('./pages/HomePage'));
const ConsultationPage = lazy(() => import('./pages/ConsultationPage'));
const InfoPage = lazy(() => import('./pages/InfoPage'));
const RehabilitationPage = lazy(() => import('./pages/RehabilitationPage'));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-bg px-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cta border-t-transparent" aria-label="로딩 중" />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="consultation" element={<ConsultationPage />} />
            <Route path="rehabilitation" element={<RehabilitationPage />} />
            <Route path="rehabilitation/info" element={<InfoPage type="rehabilitation" />} />
            <Route path="bankruptcy" element={<InfoPage type="bankruptcy" />} />
            <Route path="debt-collection" element={<InfoPage type="debt-collection" />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
