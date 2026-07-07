<?php
require_once dirname(__DIR__) . '/_common.php';

if (!function_exists('lc_events_public_payload')) {
    function lc_events_public_payload()
    {
        $summary = function_exists('lc_sample_event_summary') ? lc_sample_event_summary() : array();
        $cards = function_exists('lc_sample_event_cards') ? lc_sample_event_cards() : array();
        $promo = function_exists('lc_sample_promo_cpa') ? lc_sample_promo_cpa() : array();
        $recommendations = function_exists('lc_sample_event_recommendations') ? lc_sample_event_recommendations() : array();
        $rankingTop = function_exists('lc_sample_ranking_top') ? lc_sample_ranking_top() : array();
        $rankingList = function_exists('lc_sample_ranking_list') ? lc_sample_ranking_list() : array();

        $items = array();
        foreach ($cards as $i => $card) {
            $items[] = array(
                'id'      => 'EVT-' . str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT),
                'badges'  => $card['badges'] ?? array(),
                'title'   => (string) ($card['title'] ?? ''),
                'desc'    => (string) ($card['desc'] ?? ''),
                'period'  => (string) ($card['period'] ?? ''),
                'product' => (string) ($card['product'] ?? ''),
                'benefit' => (string) ($card['benefit'] ?? ''),
                'ribbon'  => (string) ($card['ribbon'] ?? ''),
            );
        }

        return array(
            'summary'         => $summary,
            'items'           => $items,
            'recommendations' => $recommendations,
            'promoCpa'        => $promo,
            'rankingTop'      => $rankingTop,
            'rankingList'     => $rankingList,
            'dbReady'         => lc_db_installed(),
        );
    }
}

lc_api_require_method('GET');
lc_api_success(lc_events_public_payload());
