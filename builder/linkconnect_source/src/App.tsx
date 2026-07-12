/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Affiliate } from './pages/Affiliate';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { CpsList } from './pages/cps/CpsList';
import { CenterSelect } from './pages/CenterSelect';
import { CpaList } from './pages/cpa/CpaList';
import { PartnerDashboard } from './pages/partner/Dashboard';
import { PartnerSearch } from './pages/partner/PartnerSearch';
import { PartnerLinks } from './pages/partner/PartnerLinks';
import { PartnerDbStatus } from './pages/partner/PartnerDbStatus';
import { PartnerDbCancel } from './pages/partner/PartnerDbCancel';
import { PartnerAnalytics } from './pages/partner/PartnerAnalytics';
import { PartnerSettlement } from './pages/partner/PartnerSettlement';
import { PartnerSupport } from './pages/partner/PartnerSupport';
import { PartnerReport } from './pages/partner/PartnerReport';
import { PartnerCall } from './pages/partner/PartnerCall';
import { PartnerCps } from './pages/partner/PartnerCps';
import { PartnerCpsLinks } from './pages/partner/cps/PartnerCpsLinks';
import { PartnerCpsClicks } from './pages/partner/cps/PartnerCpsClicks';
import { PartnerCpsOrders } from './pages/partner/cps/PartnerCpsOrders';
import { PartnerCpsEarnings } from './pages/partner/cps/PartnerCpsEarnings';

import { AdvertiserCampaigns } from './pages/advertiser/AdvertiserCampaigns';
import { AdvertiserCampaignGuide } from './pages/advertiser/AdvertiserCampaignGuide';
import { AdvertiserDb } from './pages/advertiser/AdvertiserDb';
import { AdvertiserCall } from './pages/advertiser/AdvertiserCall';
import { AdvertiserBilling } from './pages/advertiser/AdvertiserBilling';
import { AdvertiserReports } from './pages/advertiser/AdvertiserReports';
import { AdvertiserSupport } from './pages/advertiser/AdvertiserSupport';

import { AdvertiserDashboard } from './pages/advertiser/Dashboard';
import { AdvertiserContract } from './pages/advertiser/AdvertiserContract';
import { AdvertiserContractView } from './pages/advertiser/AdvertiserContractView';
import { AdvertiserContractComplete } from './pages/advertiser/AdvertiserContractComplete';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminPartners } from './pages/admin/AdminPartners';
import { AdminAdvertisers } from './pages/admin/AdminAdvertisers';
import { AdminContracts } from './pages/admin/AdminContracts';
import { AdminCampaigns } from './pages/admin/AdminCampaigns';
import { AdminInspections } from './pages/admin/AdminInspections';
import { AdminBilling } from './pages/admin/AdminBilling';
import { AdminSettlements } from './pages/admin/AdminSettlements';
import { AdminApi } from './pages/admin/AdminApi';
import { AdminSupport } from './pages/admin/AdminSupport';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminConversions } from './pages/admin/AdminConversions';
import { AdminEvents } from './pages/admin/AdminEvents';
import { AdminLogs } from './pages/admin/AdminLogs';
import { AdminReviewQueue } from './pages/admin/AdminReviewQueue';
import { AdminChannelReports } from './pages/admin/AdminChannelReports';
import { AdminCallDb } from './pages/admin/AdminCallDb';
import { AdminLinkprice } from './pages/admin/AdminLinkprice';
import { AdminCpsSettings } from './pages/admin/cps/AdminCpsSettings';
import { AdminCpsMerchants } from './pages/admin/cps/AdminCpsMerchants';
import { AdminCpsClicks } from './pages/admin/cps/AdminCpsClicks';
import { AdminCpsOrders, AdminCpsUnmatched } from './pages/admin/cps/AdminCpsOrders';
import { AdminCpsPostbacks } from './pages/admin/cps/AdminCpsPostbacks';
import { AdminCpsSyncLogs } from './pages/admin/cps/AdminCpsSyncLogs';
import { AdminCpsRates } from './pages/admin/cps/AdminCpsRates';
import { AdminCpsSettlements } from './pages/admin/cps/AdminCpsSettlements';
import { NoticeList } from './pages/notice/NoticeList';
import { NoticeDetailPage } from './pages/notice/NoticeDetail';
import { NoticeForm } from './pages/notice/NoticeForm';
import { PartnerRouteGuard } from './components/PartnerRouteGuard';
import { AdvertiserRouteGuard } from './components/AdvertiserRouteGuard';
import { AdvertiserContractAccessGuard } from './components/advertiser/AdvertiserContractAccessGuard';
import { AdminRouteGuard } from './components/AdminRouteGuard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 마케팅 페이지 — Header + Footer */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="affiliate" element={<Affiliate />} />
          <Route path="select-center" element={<CenterSelect />} />
          <Route path="cpa-list" element={<CpaList />} />
          <Route path="cps" element={<CpsList />} />
          <Route path="events" element={<Events />} />
          <Route path="events/detail" element={<EventDetail />} />
          <Route path="notice" element={<NoticeList />} />
          <Route path="notice/write" element={<NoticeForm />} />
          <Route path="notice/:id/edit" element={<NoticeForm />} />
          <Route path="notice/:id" element={<NoticeDetailPage />} />
        </Route>

        {/* 센터 — 전용 레이아웃만 (마케팅 chrome 없음) */}
        {/* 파트너센터 — 가드 + 전용 레이아웃 */}
        <Route element={<PartnerRouteGuard />}>
          <Route path="partner" element={<PartnerDashboard />} />
          <Route path="partner/search" element={<PartnerSearch />} />
          <Route path="partner/cps" element={<PartnerCps />} />
          <Route path="partner/cps/links" element={<PartnerCpsLinks />} />
          <Route path="partner/cps/clicks" element={<PartnerCpsClicks />} />
          <Route path="partner/cps/orders" element={<PartnerCpsOrders />} />
          <Route path="partner/cps/earnings" element={<PartnerCpsEarnings />} />
          <Route path="partner/links" element={<PartnerLinks />} />
          <Route path="partner/db-status" element={<PartnerDbStatus />} />
          <Route path="partner/call" element={<PartnerCall />} />
          <Route path="partner/db-cancel" element={<PartnerDbCancel />} />
          <Route path="partner/analytics" element={<PartnerAnalytics />} />
          <Route path="partner/report" element={<PartnerReport />} />
          <Route path="partner/settlement" element={<PartnerSettlement />} />
          <Route path="partner/support" element={<PartnerSupport />} />
        </Route>
        <Route element={<AdvertiserRouteGuard />}>
          <Route path="advertiser/contract" element={<AdvertiserContract />} />
          <Route path="advertiser/contract/view" element={<AdvertiserContractView />} />
          <Route path="advertiser/contract/complete" element={<AdvertiserContractComplete />} />
          <Route path="advertiser/support" element={<AdvertiserSupport />} />
          <Route element={<AdvertiserContractAccessGuard />}>
            <Route path="advertiser" element={<AdvertiserDashboard />} />
            <Route path="advertiser/campaigns" element={<AdvertiserCampaigns />} />
            <Route path="advertiser/campaigns/:cpId/guide" element={<AdvertiserCampaignGuide />} />
            <Route path="advertiser/db" element={<AdvertiserDb />} />
            <Route path="advertiser/call" element={<AdvertiserCall />} />
            <Route path="advertiser/billing" element={<AdvertiserBilling />} />
            <Route path="advertiser/reports" element={<AdvertiserReports />} />
          </Route>
        </Route>
        <Route element={<AdminRouteGuard />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/partners" element={<AdminPartners />} />
          <Route path="admin/advertisers" element={<AdminAdvertisers />} />
          <Route path="admin/contracts" element={<AdminContracts />} />
          <Route path="admin/campaigns" element={<AdminCampaigns />} />
          <Route path="admin/conversions" element={<AdminConversions />} />
          <Route path="admin/call" element={<AdminCallDb />} />
          <Route path="admin/linkprice" element={<AdminLinkprice />} />
          <Route path="admin/cps" element={<AdminCpsSettings />} />
          <Route path="admin/cps/settings" element={<AdminCpsSettings />} />
          <Route path="admin/cps/merchants" element={<AdminCpsMerchants />} />
          <Route path="admin/cps/clicks" element={<AdminCpsClicks />} />
          <Route path="admin/cps/orders" element={<AdminCpsOrders />} />
          <Route path="admin/cps/unmatched" element={<AdminCpsUnmatched />} />
          <Route path="admin/cps/postbacks" element={<AdminCpsPostbacks />} />
          <Route path="admin/cps/sync-logs" element={<AdminCpsSyncLogs />} />
          <Route path="admin/cps/rates" element={<AdminCpsRates />} />
          <Route path="admin/cps/settlements" element={<AdminCpsSettlements />} />
          <Route path="admin/inspections" element={<AdminInspections />} />
          <Route path="admin/billing" element={<AdminBilling />} />
          <Route path="admin/settlements" element={<AdminSettlements />} />
          <Route path="admin/api" element={<AdminApi />} />
          <Route path="admin/support" element={<AdminSupport />} />
          <Route path="admin/settings" element={<AdminSettings />} />
          <Route path="admin/events" element={<AdminEvents />} />
          <Route path="admin/logs" element={<AdminLogs />} />
          <Route path="admin/review-queue" element={<AdminReviewQueue />} />
          <Route path="admin/channel-reports" element={<AdminChannelReports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
