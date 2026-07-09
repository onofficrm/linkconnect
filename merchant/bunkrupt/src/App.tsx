/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import HomePage from './pages/HomePage';
import ConsultationPage from './pages/ConsultationPage';
import InfoPage from './pages/InfoPage';
import RehabilitationPage from './pages/RehabilitationPage';

export default function App() {
  return (
    <HashRouter>
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
    </HashRouter>
  );
}
