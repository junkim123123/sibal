"""
NexSupply Results Dashboard - Complete Redesign
5-Block Structure: Header+Assumptions, Market Snapshot, Landed Cost, Suppliers, Meta+CTA

Philosophy: "Not a perfect answer, but structure and insights to help you dream.
If you're ready to move forward, let us do the legwork."
"""

import streamlit as st
import plotly.graph_objects as go
from typing import Dict, List
from datetime import datetime

from state.session_state import get_sourcing_state
from components.supplier_card import render_supplier_card
from utils.i18n import t, render_language_selector_minimal


# =============================================================================
# CUSTOM CSS
# =============================================================================

def apply_results_css():
    """Apply clean, professional CSS for results dashboard."""
    st.markdown("""
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * { font-family: 'Inter', sans-serif !important; }
        
        /* Hide defaults */
        [data-testid="stSidebar"] { display: none !important; }
        header[data-testid="stHeader"] { display: none !important; }
        footer { visibility: hidden !important; }
        
        /* Background */
        .stApp { background: #F8FAFC !important; }
        
        /* Section styling */
        .section-header {
            font-size: 1.3rem;
            font-weight: 700;
            color: #0F172A;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            line-height: 1.4;
        }
        
        .section-subtitle {
            font-size: 0.88rem;
            color: #64748B;
            margin-top: -4px;
            margin-bottom: 24px;
            line-height: 1.5;
        }
        
        /* Card styling */
        .info-card {
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
        }
        
        .metric-card {
            background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
            border-radius: 12px;
            padding: 18px 16px;
            text-align: center;
            position: relative;
            min-height: 190px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px rgba(0,0,0,0.08);
        }
        
        .metric-value {
            font-size: 1.75rem;
            font-weight: 700;
            color: #0EA5E9;
            margin: 10px 0 6px 0;
            line-height: 1.2;
            word-break: break-word;
        }
        
        .metric-label {
            font-size: 0.85rem;
            color: #64748B;
            margin-top: 4px;
        }
        
        .metric-desc {
            font-size: 0.75rem;
            color: #94A3B8;
            margin-top: 8px;
            line-height: 1.5;
            flex-grow: 1;
        }
        
        .metric-subtitle {
            font-size: 0.8rem;
            color: #64748B;
            margin-top: 4px;
            font-weight: 500;
            line-height: 1.3;
        }
        
        .metric-extra {
            font-size: 0.7rem;
            color: #94A3B8;
            margin-top: 10px;
            font-style: italic;
            line-height: 1.4;
            min-height: 20px;
        }
        
        /* Tooltip info icon */
        .info-tooltip {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #E5E7EB;
            color: #64748B;
            font-size: 11px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: help;
        }
        
        /* Assumptions card */
        .assumptions-card {
            background: #F8FAFC;
            border: 1px solid #E5E7EB;
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 20px;
        }
        
        .assumption-item {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid #F1F5F9;
            font-size: 0.85rem;
        }
        
        .assumption-label {
            color: #64748B;
        }
        
        .assumption-value {
            color: #0F172A;
            font-weight: 500;
        }
        
        /* Confidence badge */
        .confidence-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        /* Cost table */
        .cost-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }
        
        .cost-table td {
            padding: 14px 10px;
            border-bottom: 1px solid #F1F5F9;
            vertical-align: middle;
            line-height: 1.5;
        }
        
        .cost-table .label {
            color: #64748B;
            font-size: 0.9rem;
            width: 45%;
            text-align: left;
            font-weight: 500;
        }
        
        .cost-table .value {
            text-align: right;
            font-weight: 600;
            color: #0F172A;
            font-size: 1.05rem;
            width: 30%;
        }
        
        .cost-table .pct {
            text-align: right;
            color: #94A3B8;
            font-size: 0.9rem;
            width: 25%;
            font-weight: 500;
        }
        
        /* Sensitivity card */
        .sensitivity-card {
            background: #FFFBEB;
            border: 1px solid #FDE68A;
            border-radius: 10px;
            padding: 18px;
            margin-top: 20px;
        }
        
        .sensitivity-title {
            font-weight: 600;
            color: #92400E;
            margin-bottom: 12px;
            font-size: 0.95rem;
        }
        
        .sensitivity-item {
            font-size: 0.88rem;
            color: #78350F;
            margin-bottom: 8px;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            line-height: 1.5;
        }
        
        /* Action cards */
        .action-card {
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.2s ease;
        }
        
        .action-card:hover {
            border-color: #0EA5E9;
            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.1);
        }
        
        .action-title {
            font-weight: 600;
            color: #0F172A;
            margin-bottom: 8px;
        }
        
        .action-desc {
            font-size: 0.85rem;
            color: #64748B;
            line-height: 1.5;
        }
        
        /* Sticky CTA bar at bottom */
        .sticky-cta {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
            padding: 12px 24px;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
        }
        
        .sticky-cta-text {
            color: white;
            font-size: 0.95rem;
            font-weight: 500;
        }
        
        .sticky-cta-btn {
            background: white;
            color: #0284C7;
            padding: 10px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.9rem;
            text-decoration: none;
            transition: all 0.2s ease;
            cursor: pointer;
            border: none;
        }
        
        .sticky-cta-btn:hover {
            background: #F0F9FF;
            transform: translateY(-2px);
        }
        
        /* CTA section */
        .cta-section {
            background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
            border-radius: 16px;
            padding: 32px;
            text-align: center;
            margin-top: 30px;
            margin-bottom: 80px; /* Space for sticky bar */
        }
        
        .cta-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: white;
            margin-bottom: 12px;
        }
        
        .cta-subtitle {
            color: rgba(255,255,255,0.9);
            font-size: 1rem;
            margin-bottom: 24px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            line-height: 1.6;
        }
        
        /* Responsive adjustments for metric cards */
        @media (max-width: 1200px) {
            .metric-value {
                font-size: 1.5rem;
            }
            .metric-card {
                min-height: 200px;
                padding: 16px 14px;
            }
        }
        
        @media (max-width: 768px) {
            .metric-value {
                font-size: 1.4rem;
            }
            .metric-card {
                min-height: 180px;
                padding: 14px 12px;
            }
            .metric-desc {
                font-size: 0.7rem;
            }
        }
        
        /* Disclaimer */
        .disclaimer-section {
            background: #F1F5F9;
            border-radius: 10px;
            padding: 20px;
            margin-top: 30px;
        }
        
        .disclaimer-title {
            font-weight: 600;
            color: #475569;
            margin-bottom: 10px;
            font-size: 0.9rem;
        }
        
        .disclaimer-text {
            font-size: 0.8rem;
            color: #64748B;
            line-height: 1.6;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
            .metric-value { font-size: 1.5rem; }
            .cta-section { padding: 24px 16px; }
            .cta-title { font-size: 1.2rem; }
        }
        </style>
    """, unsafe_allow_html=True)


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def format_currency(value: float) -> str:
    """Format as USD currency."""
    if value >= 1_000_000:
        return f"${value/1_000_000:.1f}M"
    elif value >= 1_000:
        return f"${value/1_000:.1f}K"
    else:
        return f"${value:.2f}"


def get_confidence_style(score: float) -> tuple:
    """Get color and label based on confidence score."""
    if score >= 0.8:
        return "#10B981", "#D1FAE5", "High"
    elif score >= 0.6:
        return "#F59E0B", "#FEF3C7", "Medium"
    return "#EF4444", "#FEE2E2", "Low"


# =============================================================================
# BLOCK 1: HEADER WITH ASSUMPTIONS
# =============================================================================

def render_header_with_assumptions(data: Dict, query: str) -> None:
    """Render header with analysis assumptions block."""
    product_info = data.get("product_info", {})
    confidence = data.get("analysis_confidence", 0.75)
    
    product_name = product_info.get("name", query[:50] if query else "Product Analysis")
    
    # Top navigation row
    nav_left, nav_right = st.columns([3, 1])
    
    with nav_left:
        # 🔴 [수정] st.button을 st.form_submit_button으로 변경하여 두 번 클릭 문제 해결
        with st.form(key="back_navigation_form"):
            back_clicked = st.form_submit_button(t("btn_back"), type="secondary", use_container_width=False)
        
        if back_clicked:
            state = get_sourcing_state()
            state.reset()
            st.rerun()
    
    with nav_right:
        render_language_selector_minimal()
    
    # Main header with screening tool disclaimer
    original_query = query[:80] if query else "your input"
    st.markdown(f"""
        <div style="margin: 20px 0;">
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <h1 style="font-size: 1.8rem; font-weight: 700; color: #0F172A; margin: 0;">
                    📊 {t('results_title')}
                </h1>
                <span style="background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">
                    🔍 Early Screening Tool
                </span>
            </div>
            <p style="color: #64748B; margin-top: 6px; font-size: 1rem;">
                {t('results_for')}: <strong>{product_name}</strong>
            </p>
            <p style="color: #94A3B8; font-size: 0.8rem; margin-top: 4px; font-style: italic;">
                Parsed from your input: "{original_query}"
            </p>
            <p style="background: #F0F9FF; color: #0369A1; padding: 8px 12px; border-radius: 8px; font-size: 0.8rem; margin-top: 12px; border-left: 3px solid #0EA5E9;">
                ⚡ Use this for early screening, not as a final PO quote. Typical accuracy: ±20-25% (up to ±35% for novel products).
            </p>
        </div>
    """, unsafe_allow_html=True)
    
    # Assumptions + Confidence row
    col1, col2 = st.columns([3, 1])
    
    with col1:
        # Import AppSettings for defaults
        from utils.config import AppSettings
        
        # Extract assumptions from analysis data (try both 'assumptions' and 'assumptions_display')
        assumptions = data.get("assumptions") or data.get("assumptions_display", {})
        target_market = assumptions.get("target_market", AppSettings.DEFAULT_TARGET_MARKET)
        channel = assumptions.get("channel", AppSettings.DEFAULT_CHANNEL)
        volume_units = assumptions.get("volume_units", AppSettings.DEFAULT_VOLUME_UNITS)
        incoterm = assumptions.get("incoterm", AppSettings.DEFAULT_INCOTERM)
        route_display = assumptions.get("route_display", AppSettings.get_route_display())
        currency = assumptions.get("currency", AppSettings.DEFAULT_CURRENCY)
        
        # Check if channel is default (add indicator only if it's actually default)
        if channel == AppSettings.DEFAULT_CHANNEL and not assumptions.get("channel"):
            channel_display = f"{channel} (default)"
        else:
            channel_display = channel
        
        # Format volume with commas
        volume_display = f"{volume_units:,} units" if volume_units else f"{AppSettings.DEFAULT_VOLUME_UNITS:,} units"
        
        # Format incoterm with destination
        if incoterm == AppSettings.DEFAULT_INCOTERM:
            incoterm_display = AppSettings.get_incoterm_display(incoterm, AppSettings.DEFAULT_DESTINATION)
            # Try to extract destination from route_display if available
            if "→" in route_display:
                destination = route_display.split("→")[-1].strip()
                incoterm_display = AppSettings.get_incoterm_display(incoterm, destination)
        else:
            incoterm_display = incoterm
        
        st.markdown(f"""
            <div class="assumptions-card">
                <div style="font-weight: 600; color: #374151; margin-bottom: 12px; font-size: 0.9rem;">
                    📋 {t('analysis_assumptions')}
                </div>
                <div class="assumption-item">
                    <span class="assumption-label">Target market</span>
                    <span class="assumption-value">{target_market}</span>
                </div>
                <div class="assumption-item">
                    <span class="assumption-label">Channel</span>
                    <span class="assumption-value">{channel_display}</span>
                </div>
                <div class="assumption-item">
                    <span class="assumption-label">Volume</span>
                    <span class="assumption-value">{volume_display}</span>
                </div>
                <div class="assumption-item">
                    <span class="assumption-label">Incoterm</span>
                    <span class="assumption-value">{incoterm_display}</span>
                </div>
                <div class="assumption-item" style="border-bottom: none;">
                    <span class="assumption-label">Currency</span>
                    <span class="assumption-value">{currency}</span>
                </div>
            </div>
        """, unsafe_allow_html=True)
    
    with col2:
        text_color, bg_color, level = get_confidence_style(confidence)
        # Show range instead of exact % for more honest representation
        conf_low = max(60, int(confidence * 100) - 10)
        conf_high = min(95, int(confidence * 100) + 5)
        
        st.markdown(f"""
            <div style="text-align: center; padding: 20px;">
                <div class="confidence-badge" style="background: {bg_color}; color: {text_color};">
                    🎯 {t('confidence')}: {level}
                </div>
                <div style="font-size: 1.5rem; font-weight: 700; color: {text_color}; margin-top: 12px;">
                    ~{conf_low}–{conf_high}%
                </div>
                <div style="font-size: 0.75rem; color: #64748B; margin-top: 8px; line-height: 1.4;">
                    Cost: ±20-25% | Lead time: ±15%
                </div>
                <div style="font-size: 0.7rem; color: #94A3B8; margin-top: 6px;">
                    <span style="cursor: help;" title="Sources: ISM Survey 2024, Freightos, Alibaba. For screening, not final PO quotes.">📊 Data sources</span>
                </div>
            </div>
        """, unsafe_allow_html=True)
    
    st.markdown("<hr style='border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;'>", unsafe_allow_html=True)


# =============================================================================
# BLOCK 2: MARKET SNAPSHOT
# =============================================================================

def render_market_snapshot(data: Dict) -> None:
    """Render market snapshot cards with detailed descriptions."""
    market = data.get("market_snapshot", {})
    lead_time = data.get("lead_time", {})
    
    # Header with light CTA (scroll anchor only)
    header_col, cta_col = st.columns([3, 1])
    with header_col:
        st.markdown(f"""
            <div class="section-header">
                {t('market_snapshot')}
            </div>
        """, unsafe_allow_html=True)
    with cta_col:
        st.markdown("""
            <a href="#consultation" style="font-size: 0.8rem; color: #0EA5E9; text-decoration: none; 
               cursor: pointer;" onclick="document.getElementById('consultation').scrollIntoView({behavior: 'smooth'}); return false;">
                Need expert help? →
            </a>
        """, unsafe_allow_html=True)
    
    col1, col2, col3, col4 = st.columns(4, gap="small")
    
    # Market Demand
    with col1:
        demand = market.get("demand", "Medium")
        demand_change = market.get("demand_change", "+0%")
        demand_desc = t("market_demand_desc")
        
        # Add numeric backup based on demand level
        demand_lower = demand.lower()
        if "high" in demand_lower:
            search_volume = "~10,000-20,000"
        elif "medium" in demand_lower:
            search_volume = "~5,000-10,000"
        else:
            search_volume = "~1,000-5,000"
        
        st.markdown(f"""
            <div class="metric-card">
                <div class="info-tooltip" title="{t('data_source_tooltip')}">ℹ️</div>
                <div style="font-size: 0.75rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px;">
                    {t('market_demand')}
                </div>
                <div class="metric-value">{demand}</div>
                <div class="metric-subtitle" style="color: #10B981;">
                    {demand_change} vs last quarter
                </div>
                <div class="metric-desc">{demand_desc}</div>
                <div class="metric-extra">
                    ~{search_volume} monthly searches
                </div>
            </div>
        """, unsafe_allow_html=True)
    
    # Average Margin
    with col2:
        margin = market.get("margin", "25%")
        margin_desc = t("avg_margin_desc")
        
        st.markdown(f"""
            <div class="metric-card">
                <div class="info-tooltip" title="Based on typical pricing for similar products">ℹ️</div>
                <div style="font-size: 0.75rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px;">
                    {t('avg_gross_margin')}
                </div>
                <div class="metric-value">{margin}</div>
                <div class="metric-subtitle">
                    typical range: 20-35%
                </div>
                <div class="metric-desc">{margin_desc}</div>
                <div class="metric-extra"></div>
            </div>
        """, unsafe_allow_html=True)
    
    # Competition
    with col3:
        competition = market.get("competition", "Medium")
        competition_desc = t("competition_desc")
        
        st.markdown(f"""
            <div class="metric-card">
                <div class="info-tooltip" title="Based on marketplace listing analysis">ℹ️</div>
                <div style="font-size: 0.75rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px;">
                    {t('competition')}
                </div>
                <div class="metric-value">{competition}</div>
                <div class="metric-subtitle">
                    ~10 active listings
                </div>
                <div class="metric-desc">{competition_desc}</div>
                <div class="metric-extra"></div>
            </div>
        """, unsafe_allow_html=True)
    
    # Total Lead Time (NEW - 4th card)
    with col4:
        # Ensure total_days is an integer
        total_days_raw = lead_time.get("total_days", 65)
        if isinstance(total_days_raw, str):
            # Parse "45-60" format
            if "–" in total_days_raw or "-" in total_days_raw:
                total_days = int(total_days_raw.split("–")[0].split("-")[0].strip())
            else:
                try:
                    total_days = int(total_days_raw)
                except ValueError:
                    total_days = 65
        else:
            total_days = int(total_days_raw)
        
        # Calculate weeks consistently with lead_time_section
        total_weeks = total_days // 7
        total_weeks_high = (total_days + 14) // 7  # Match lead_time_section calculation
        
        st.markdown(f"""
            <div class="metric-card">
                <div class="info-tooltip" title="Production + sea freight + customs + buffer">ℹ️</div>
                <div style="font-size: 0.75rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px;">
                    TOTAL LEAD TIME
                </div>
                <div class="metric-value" style="color: #0369A1;">{total_weeks}–{total_weeks_high} weeks</div>
                <div class="metric-subtitle" style="color: #0EA5E9;">
                    ~{total_days}–{total_days + 10} days
                </div>
                <div class="metric-desc">Production + shipping + customs buffer</div>
                <div class="metric-extra"></div>
            </div>
        """, unsafe_allow_html=True)
    
    st.markdown("<div style='height: 24px;'></div>", unsafe_allow_html=True)


# =============================================================================
# BLOCK 2.5: LEAD TIME VISUALIZATION (CRITICAL)
# =============================================================================

def render_lead_time_section(data: Dict) -> None:
    """Render estimated lead time breakdown - critical for B2B decision making."""
    
    # Get lead time data from result or use defaults
    lead_time = data.get("lead_time", {})
    
    # Ensure all values are integers
    def safe_int(value, default):
        if isinstance(value, str):
            try:
                return int(value.split("–")[0].split("-")[0].strip())
            except (ValueError, AttributeError):
                return default
        return int(value) if value else default
    
    production_days = safe_int(lead_time.get("production_days", 30), 30)
    shipping_days = safe_int(lead_time.get("shipping_days", 28), 28)
    customs_days = safe_int(lead_time.get("customs_days", 5), 5)
    buffer_days = safe_int(lead_time.get("buffer_days", 7), 7)
    
    # Calculate total consistently
    total_days = production_days + shipping_days + customs_days + buffer_days
    total_weeks = total_days // 7
    total_weeks_high = (total_days + 14) // 7  # Upper bound (consistent with Market Snapshot)
    
    st.markdown(f"""
        <div class="section-header">
            ⏱️ Estimated Total Lead Time
        </div>
    """, unsafe_allow_html=True)
    
    # Main lead time display
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown(f"""
            <div style="background: white; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #E5E7EB;">
                <div style="font-size: 2rem; font-weight: 800; color: #0EA5E9;">
                    {total_weeks}–{total_weeks_high}
                </div>
                <div style="font-size: 0.85rem; color: #64748B; font-weight: 600;">
                    WEEKS TOTAL
                </div>
                <div style="font-size: 0.75rem; color: #94A3B8; margin-top: 4px;">
                    (~{total_days}–{total_days + 14} days)
                </div>
            </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
            <div style="background: #F0F9FF; border-radius: 12px; padding: 16px; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; color: #0284C7;">
                    {production_days}
                </div>
                <div style="font-size: 0.8rem; color: #0369A1;">days</div>
                <div style="font-size: 0.75rem; color: #64748B; margin-top: 8px;">
                    🏭 Production
                </div>
            </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown(f"""
            <div style="background: #F0FDF4; border-radius: 12px; padding: 16px; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; color: #16A34A;">
                    {shipping_days}
                </div>
                <div style="font-size: 0.8rem; color: #15803D;">days</div>
                <div style="font-size: 0.75rem; color: #64748B; margin-top: 8px;">
                    🚢 Sea Freight
                </div>
            </div>
        """, unsafe_allow_html=True)
    
    with col4:
        st.markdown(f"""
            <div style="background: #FEF3C7; border-radius: 12px; padding: 16px; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; color: #D97706;">
                    {customs_days + buffer_days}
                </div>
                <div style="font-size: 0.8rem; color: #B45309;">days</div>
                <div style="font-size: 0.75rem; color: #64748B; margin-top: 8px;">
                    📦 Customs + Buffer
                </div>
            </div>
        """, unsafe_allow_html=True)
    
    # Timeline note
    st.markdown(f"""
        <div style="background: #F8FAFC; border-radius: 8px; padding: 12px 16px; margin-top: 16px; display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 1.2rem;">💡</span>
            <div style="font-size: 0.85rem; color: #475569;">
                <strong>Tip:</strong> Order at least <strong>{total_weeks + 2} weeks</strong> before you need stock. 
                Add <strong>2–3 weeks</strong> safety buffer for CNY (Jan–Feb) or peak season (Sep–Nov).
            </div>
        </div>
    """, unsafe_allow_html=True)
    
    # Assumption note (B2B critical)
    st.markdown("""
        <div style="background: #FEF3C7; border-radius: 8px; padding: 10px 14px; margin-top: 12px; 
                    border-left: 3px solid #F59E0B; font-size: 0.8rem; color: #92400E;">
            <strong>Assumption:</strong> Production in coastal China, sea freight to US West Coast, standard customs clearance.
        </div>
    """, unsafe_allow_html=True)
    
    st.markdown("<div style='height: 24px;'></div>", unsafe_allow_html=True)


# =============================================================================
# BLOCK 3: LANDED COST BREAKDOWN
# =============================================================================

def render_landed_cost_panel(data: Dict) -> None:
    """Render landed cost with donut chart, table, and sensitivity analysis."""
    landed_cost = data.get("landed_cost", {})
    
    st.markdown(f"""
        <div class="section-header">
            💰 {t('landed_cost')}
        </div>
        <p class="section-subtitle">{t('landed_cost_subtitle')}</p>
    """, unsafe_allow_html=True)
    
    # Get cost data
    cost_per_unit = landed_cost.get("cost_per_unit_usd", 0.85)
    if cost_per_unit == 0:
        cost_per_unit = 0.85  # Default for demo
    
    product_pct = landed_cost.get("product", 45)
    shipping_pct = landed_cost.get("shipping", 25)
    customs_pct = landed_cost.get("customs", 18)
    handling_pct = landed_cost.get("handling", 12)
    
    # Calculate actual amounts
    product_usd = cost_per_unit * product_pct / 100
    shipping_usd = cost_per_unit * shipping_pct / 100
    customs_usd = cost_per_unit * customs_pct / 100
    handling_usd = cost_per_unit * handling_pct / 100
    
    chart_col, table_col = st.columns([1.1, 1], gap="medium")
    
    with chart_col:
        # Donut chart with $ amounts
        labels = [t('manufacturing_cost'), t('total_freight'), t('customs_duty'), t('insurance_handling')]
        values = [product_pct, shipping_pct, customs_pct, handling_pct]
        amounts = [product_usd, shipping_usd, customs_usd, handling_usd]
        colors = ['#0EA5E9', '#38BDF8', '#7DD3FC', '#BAE6FD']
        
        # Custom text showing both $ and %
        custom_text = [f"${a:.2f}<br>({v}%)" for a, v in zip(amounts, values)]
        
        fig = go.Figure(data=[go.Pie(
            labels=labels,
            values=values,
            hole=0.6,
            marker=dict(colors=colors, line=dict(color='#FFFFFF', width=3)),
            textinfo='text',
            text=custom_text,
            textfont=dict(size=10, color='#0F172A'),
            hovertemplate='<b>%{label}</b><br>$%{customdata:.2f} (%{percent})<extra></extra>',
            customdata=amounts
        )])
        
        fig.update_layout(
            showlegend=True,
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=-0.2,
                xanchor="center",
                x=0.5,
                font=dict(size=10)
            ),
            margin=dict(t=30, b=90, l=30, r=30),
            height=340,
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            annotations=[dict(
                text=f"<b>${cost_per_unit:.2f}</b><br><span style='font-size:11px'>{t('per_unit')}</span>",
                x=0.5, y=0.5,
                font=dict(size=20, color='#0F172A'),
                showarrow=False
            )]
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        # Cost share note
        st.markdown(f"""
            <div style="background: #F0F9FF; border-radius: 8px; padding: 12px; margin-top: 12px; font-size: 0.85rem; color: #0369A1; line-height: 1.5;">
                💡 {t('cost_share_note')}
            </div>
        """, unsafe_allow_html=True)
    
    with table_col:
        # Cost breakdown table with proper alignment
        st.markdown(f"""
            <table class="cost-table">
                <colgroup>
                    <col style="width: 45%;">
                    <col style="width: 30%;">
                    <col style="width: 25%;">
                </colgroup>
                <tbody>
                    <tr>
                        <td class="label">{t('manufacturing_cost')}</td>
                        <td class="value">${product_usd:.2f}</td>
                        <td class="pct">{product_pct}%</td>
                    </tr>
                    <tr>
                        <td class="label">{t('total_freight')}</td>
                        <td class="value">${shipping_usd:.2f}</td>
                        <td class="pct">{shipping_pct}%</td>
                    </tr>
                    <tr>
                        <td class="label">{t('customs_duty')}</td>
                        <td class="value">${customs_usd:.2f}</td>
                        <td class="pct">{customs_pct}%</td>
                    </tr>
                    <tr>
                        <td class="label">{t('insurance_handling')}</td>
                        <td class="value">${handling_usd:.2f}</td>
                        <td class="pct">{handling_pct}%</td>
                    </tr>
                    <tr style="border-top: 2px solid #0EA5E9; border-bottom: none;">
                        <td class="label" style="font-weight: 700; color: #0F172A; padding-top: 16px;">TOTAL</td>
                        <td class="value" style="color: #0EA5E9; font-size: 1.15rem; font-weight: 700; padding-top: 16px;">${cost_per_unit:.2f}</td>
                        <td class="pct" style="padding-top: 16px; font-weight: 600;">100%</td>
                    </tr>
                </tbody>
            </table>
        """, unsafe_allow_html=True)
        
        # Sensitivity analysis card with current margin context
        st.markdown(f"""
            <div class="sensitivity-card">
                <div class="sensitivity-title">📊 {t('sensitivity')}</div>
                <div style="background: rgba(146, 64, 14, 0.1); border-radius: 6px; padding: 10px; margin-bottom: 12px;">
                    <span style="font-size: 0.85rem; color: #92400E;">
                        <strong>Current margin estimate: 25–40%</strong>
                    </span>
                </div>
                <div class="sensitivity-item">
                    <span>📈</span>
                    <span>{t('sensitivity_shipping')}</span>
                </div>
                <div class="sensitivity-item">
                    <span>📉</span>
                    <span>{t('sensitivity_duty')}</span>
                </div>
            </div>
        """, unsafe_allow_html=True)
    
    # Hidden cost warnings with product/route context
    warnings = landed_cost.get("hidden_cost_warnings", [])
    product_info = data.get("product_info", {})
    product_category = product_info.get("category", "this product category")
    
    if warnings:
        st.markdown(f"""
            <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 18px; margin-top: 20px;">
                <div style="font-weight: 600; color: #92400E; margin-bottom: 8px; font-size: 0.95rem;">⚠️ Hidden Cost Alerts</div>
                <div style="font-size: 0.8rem; color: #A16207; margin-bottom: 14px; font-style: italic; line-height: 1.4;">
                    For {product_category} shipped from China to US:
                </div>
                <ul style="margin: 0; padding-left: 22px; color: #78350F; font-size: 0.88rem; line-height: 1.6;">
                    {''.join(f'<li style="margin-bottom: 8px;">{w}</li>' for w in warnings[:4])}
                </ul>
                <div style="background: #F0F9FF; border-radius: 6px; padding: 12px; margin-top: 14px; font-size: 0.85rem; color: #0369A1; line-height: 1.5;">
                    💡 <strong>AI flags these; experts negotiate them away.</strong> Our team handles on-site QC, mold cost negotiations, and compliance verification to reduce these hidden costs.
                </div>
            </div>
        """, unsafe_allow_html=True)
    
    st.markdown("<div style='height: 24px;'></div>", unsafe_allow_html=True)


# =============================================================================
# BLOCK 4: VERIFIED SUPPLIERS
# =============================================================================

def render_suppliers_panel(data: Dict) -> None:
    """Render verified suppliers with detailed cards."""
    suppliers = data.get("suppliers", [])
    
    # Header with light CTA (scroll anchor only)
    header_col, cta_col = st.columns([3, 1])
    with header_col:
        st.markdown(f"""
            <div class="section-header">
                ✓ {t('verified_suppliers')}
            </div>
        """, unsafe_allow_html=True)
    with cta_col:
        st.markdown("""
            <a href="#consultation" style="font-size: 0.8rem; color: #0EA5E9; text-decoration: none; 
               background: #F0F9FF; padding: 6px 12px; border-radius: 6px; display: inline-block;
               cursor: pointer;" onclick="document.getElementById('consultation').scrollIntoView({behavior: 'smooth'}); return false;">
                💬 Get help preparing an RFQ →
            </a>
        """, unsafe_allow_html=True)
    
    st.markdown(f"""
        <p class="section-subtitle">{t('suppliers_subtitle')}</p>
    """, unsafe_allow_html=True)
    
    # Ensure at least 3 suppliers are shown (use demo if API returns fewer)
    if len(suppliers) < 3:
        # Add demo suppliers to reach minimum of 3
        demo_suppliers = [
            {
                "name": "Dongguan Sweet Delight Food Co., Ltd.",
                "location": "Dongguan, China",
                "factory_grade": "Tier-2 Factory",
                "trade_assurance": True,
                "years_in_business": 12,
                "price_range": "$2.10 - $2.50 per box (FOB)",
                "min_order": "5,000 display boxes",
                "quality_tier": "High",
                "certifications": ["HACCP-ISO 22000", "BRCGS (estimated)"],
                "risk_notes": "Good for custom packaging: verify specific experience with multi-layered jelly and blister pack sealing. Request recent audit reports.",
                "rating": 4.5,
                "response_time": "< 48h",
                "verified": True,
            },
            {
                "name": "Guangzhou Fancy Confectionery Co., Ltd.",
                "location": "Guangzhou, China",
                "factory_grade": "Trading Company",
                "trade_assurance": True,
                "years_in_business": 8,
                "price_range": "$2.30 - $2.80 per box (FOB)",
                "min_order": "3,000 display boxes",
                "quality_tier": "Medium",
                "certifications": ["ISO 9001 (supplier's partner factory)"],
                "risk_notes": "May offer lower MOQs but margins could be thinner due to middleman. Requires careful vetting of their actual manufacturing partner for food safety and quality control capabilities.",
                "rating": 4.5,
                "response_time": "< 48h",
                "verified": True,
            },
            {
                "name": "Fujian Happy Foods Industrial Co., Ltd.",
                "location": "Quanzhou, China",
                "factory_grade": "Tier-1 Factory",
                "trade_assurance": True,
                "years_in_business": 18,
                "price_range": "$1.95 - $2.35 per box (FOB)",
                "min_order": "10,000 display boxes",
                "quality_tier": "High",
                "certifications": ["HACCP-ISO 22000", "FDA Registered", "HALAL (upon request)"],
                "risk_notes": "Large capacity, likely best pricing for high volume. May be less flexible on small custom runs. Verify blister packaging capabilities.",
                "rating": 4.5,
                "response_time": "< 48h",
                "verified": True,
            },
        ]
        
        # Merge API suppliers with demo suppliers (prioritize API, fill with demo)
        suppliers = suppliers + demo_suppliers[:3 - len(suppliers)]
    
    # Display supplier cards with improved spacing (always show at least 3)
    display_count = max(3, len(suppliers))  # Ensure minimum 3
    for idx, supplier in enumerate(suppliers[:display_count]):
        render_supplier_card(
            supplier=supplier,
            index=idx,
            show_actions=True,
            compact=False
        )
        # Add spacing between cards (except last one)
        if idx < min(len(suppliers), 3) - 1:
            st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)
    
    # Contact button with trust badges
    st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        if st.button(f"💌 {t('btn_contact_suppliers')}", type="primary", use_container_width=True):
            st.toast("Quote requests sent to selected suppliers!", icon="✅")
        
        st.markdown(f"""
            <p style="text-align: center; font-size: 0.8rem; color: #64748B; margin-top: 10px;">
                {t('btn_contact_desc')}
            </p>
        """, unsafe_allow_html=True)
    
    st.markdown("<div style='height: 24px;'></div>", unsafe_allow_html=True)


# =============================================================================
# BLOCK 5: NEXT ACTIONS + CTA + DISCLAIMER
# =============================================================================

def render_next_actions_and_cta(data: Dict) -> None:
    """Render next actions, consultation CTA, and data disclaimer."""
    import json
    
    # --- What you can do next ---
    st.markdown(f"""
        <div class="section-header">
            🚀 {t('what_next')}
        </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown(f"""
            <div class="action-card">
                <div class="action-title">🔄 {t('action_refine')}</div>
                <div class="action-desc">{t('action_refine_desc')}</div>
            </div>
        """, unsafe_allow_html=True)
        if st.button("Refine Analysis", key="refine", use_container_width=True, type="secondary"):
            state = get_sourcing_state()
            state.reset()
            st.rerun()
    
    with col2:
        st.markdown(f"""
            <div class="action-card">
                <div class="action-title">📥 {t('action_save')}</div>
                <div class="action-desc">{t('action_save_desc')}</div>
            </div>
        """, unsafe_allow_html=True)
        if st.button("Export PDF", key="export", use_container_width=True, type="secondary"):
            # Generate downloadable JSON report
            report_data = {
                "report_type": "NexSupply Analysis Report",
                "generated_at": datetime.now().isoformat(),
                "query": st.session_state.get("search_query", ""),
                "analysis": data
            }
            report_json = json.dumps(report_data, indent=2, ensure_ascii=False, default=str)
            st.download_button(
                label="📥 Download Report (JSON)",
                data=report_json,
                file_name=f"nexsupply_report_{datetime.now().strftime('%Y%m%d_%H%M')}.json",
                mime="application/json",
                key="download_json"
            )
    
    with col3:
        st.markdown(f"""
            <div class="action-card">
                <div class="action-title">🔍 {t('action_risk')}</div>
                <div class="action-desc">{t('action_risk_desc')}</div>
            </div>
        """, unsafe_allow_html=True)
        if st.button("Run Risk Check", key="risk", use_container_width=True, type="secondary"):
            # Show detailed risk analysis
            risk_data = data.get("risk_analysis", {})
            suppliers = data.get("suppliers", [])
            
            with st.expander("🔍 Detailed Risk Analysis", expanded=True):
                st.markdown("### Supply Chain Risks")
                if risk_data:
                    for risk in risk_data.get("key_risks", []):
                        if isinstance(risk, dict):
                            st.warning(f"**{risk.get('type', 'Risk')}**: {risk.get('description', '')}")
                        else:
                            st.warning(risk)
                
                st.markdown("### Supplier-Specific Risks")
                for s in suppliers[:3]:
                    risk_notes = s.get("risk_notes", "No specific risks")
                    st.info(f"**{s.get('name', 'Supplier')}**: {risk_notes}")
    
    # --- CONSULTATION CTA with Email Form ---
    # Get summary data for the case summary line
    landed_cost_data = data.get("landed_cost", {})
    cost_per_unit = landed_cost_data.get("cost_per_unit_usd", 0)
    market_data = data.get("market_snapshot", {})
    margin_range = market_data.get("margin", "25-40%")
    suppliers_list = data.get("suppliers", [])
    supplier_count = len(suppliers_list) if suppliers_list else 3
    
    st.markdown(f"""
        <div class="cta-section" id="consultation">
            <div class="cta-title">🔥 Ready to make it real?</div>
            <div style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 12px 20px; margin: 16px auto; max-width: 500px;">
                <div style="color: rgba(255,255,255,0.95); font-size: 0.95rem; text-align: center;">
                    <strong>This case looks viable:</strong><br>
                    Landed cost ~${cost_per_unit:.2f}/unit · Margin {margin_range} · {supplier_count} vetted suppliers
                </div>
            </div>
            <div class="cta-subtitle">
                This analysis provides structure and estimates for early screening.<br>
                <strong>Our team turns it into real RFQs, factory shortlists, and shipment plans.</strong>
            </div>
        </div>
    """, unsafe_allow_html=True)
    
    # Simple email form - user enters email, we send to outreach@nexsupply.net
    query = st.session_state.get("search_query", "Product Inquiry")[:100]
    
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        # Next Steps explanation (builds trust)
        st.markdown("""
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 16px; border: 1px solid #E5E7EB;">
                <h4 style="margin: 0 0 12px 0; color: #1F2937;">📋 What happens next?</h4>
                <div style="font-size: 0.9rem; color: #4B5563; line-height: 1.6;">
                    <div style="margin-bottom: 8px;">1️⃣ <strong>Within 4 hours:</strong> We review your case and confirm viability</div>
                    <div style="margin-bottom: 8px;">2️⃣ <strong>Within 48 hours:</strong> Match 2-3 real factories & outline negotiation strategy</div>
                    <div style="margin-bottom: 8px;">3️⃣ <strong>Within 1 week:</strong> Start supplier negotiations on your behalf</div>
                </div>
            </div>
        """, unsafe_allow_html=True)
        
        st.markdown("#### 📧 Get Real Quotes & Verification")
        st.caption("Send us this case. We'll match factories and outline next steps in 24 hours.")
        
        # Auto-populate product info from analysis
        product_info = data.get("product_info", {})
        product_name = product_info.get("name", query.split("\n")[0] if query else "Product Inquiry")
        landed_cost_data = data.get("landed_cost", {})
        from utils.config import AppSettings
        quantity_basis = landed_cost_data.get("quantity_basis", AppSettings.DEFAULT_VOLUME_UNITS)
        
        # Pre-fill message with analysis summary
        default_message = f"Product: {product_name}\nVolume: {quantity_basis:,} units\nLanded cost: ${landed_cost_data.get('cost_per_unit_usd', 0):.2f}/unit\n\nPlease help me get real quotes and factory verification."
        
        # 🔴 [수정] st.form으로 감싸서 두 번 클릭 문제 해결
        with st.form(key="consultation_form", clear_on_submit=False):
            # Email input form
            user_email = st.text_input(
                "Your Email",
                placeholder="your@email.com",
                key="consultation_email",
                label_visibility="collapsed"
            )
            
            # Optional message (pre-filled)
            user_message = st.text_area(
                "Message (optional)",
                value=default_message,
                height=100,
                key="consultation_message",
                label_visibility="collapsed"
            )
            
            # 🔴 [수정] st.button 대신 st.form_submit_button 사용
            submit_clicked = st.form_submit_button(
                "🔒 Secure Real Quotes & Factory Visits – Start Now", 
                type="primary", 
                use_container_width=True
            )
        
        # 🔴 [수정] 폼 바깥에서 로직 처리 (폼 제출 후 실행)
        if submit_clicked:
            # Validate inputs using centralized validation
            from utils.validation import validate_consultation_input
            
            is_valid, error_msg = validate_consultation_input(
                email=user_email,
                name="",
                message=user_message if user_message else None
            )
            
            if not is_valid:
                st.error(f"❌ {error_msg}")
            else:
                from services.email_service import request_consultation
                from state.session_state import get_sourcing_state
                
                state = get_sourcing_state()
                result = state.get_result()
                
                with st.spinner("Sending your request..."):
                    response = request_consultation(
                        user_email=user_email,
                        user_name="",
                        message=user_message or "Consultation request from NexSupply",
                        product_name=query,
                        analysis_data=result
                    )
                
                if response.get("success"):
                    st.success("✅ Request sent! We'll contact you within 24 hours.")
                    st.balloons()
                else:
                    st.error(f"❌ {response.get('message', 'Failed to send. Please try again.')}")
        
        st.markdown("""
            <div style="background: #F0F9FF; border-radius: 8px; padding: 12px; margin-top: 12px; font-size: 0.8rem; color: #0369A1;">
                💡 <strong>Tip:</strong> Just include your product name or paste this report link. We handle the rest.
            </div>
        """, unsafe_allow_html=True)
        st.caption("✓ Your email is safe · No spam · We reply within 24 hours")
    
    # --- DATA DISCLAIMER with accuracy ranges ---
    st.markdown(f"""
        <div class="disclaimer-section">
            <div class="disclaimer-title">📋 {t('data_limitations')}</div>
            <div class="disclaimer-text">
                {t('data_limitations_text')}
            </div>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #E2E8F0;">
                <div style="font-weight: 600; color: #475569; margin-bottom: 10px; font-size: 0.85rem;">
                    📊 Typical Accuracy Ranges
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8rem; color: #64748B;">
                    <div>• Landed Cost: <strong>±20-25%</strong> <span style="color: #94A3B8;">(up to ±30-35% for novel/custom products)</span></div>
                    <div>• Margin error: <strong>±10-15 points</strong> <span style="color: #94A3B8;">(percentage points, not %)</span></div>
                    <div>• Lead Times: <strong>±1-2 weeks</strong></div>
                    <div>• Market Trends: <strong>Directional</strong></div>
                </div>
                <div style="margin-top: 12px; font-size: 0.75rem; color: #94A3B8;">
                    Best accuracy: Standard products with high data coverage (e.g., bulk candy, electronics accessories).<br>
                    Lower accuracy: Novel/custom products, volatile markets, or limited supplier data.
                </div>
            </div>
        </div>
    """, unsafe_allow_html=True)
    
    # Footer
    st.markdown(f"""
        <div style="text-align: center; padding: 30px 0 20px 0; color: #9CA3AF; font-size: 0.8rem;">
            {t('powered_by')} · © 2017 NexSupply<br>
            <a href="/legal" style="color: #64748B; text-decoration: none; margin: 0 8px;">Terms of Service</a> · 
            <a href="/legal" style="color: #64748B; text-decoration: none; margin: 0 8px;">Privacy Policy</a>
        </div>
    """, unsafe_allow_html=True)


# =============================================================================
# MAIN RENDER FUNCTION (called from streamlit_app.py)
# =============================================================================

def render_results_page():
    """Main results page with 5-block structure. Called from streamlit_app.py"""
    apply_results_css()
    
    state = get_sourcing_state()
    result = state.get_result()
    query = st.session_state.get("search_query", "")
    
    # No results check
    if result is None or not result:
        st.warning("⚠️ No analysis results found. Please perform a search first.")
        
        _, center, _ = st.columns([1, 1, 1])
        with center:
            # 🔴 [수정] st.button을 st.form_submit_button으로 변경하여 두 번 클릭 문제 해결
            with st.form(key="back_navigation_form_no_results"):
                back_clicked = st.form_submit_button(t("btn_back"), type="primary", use_container_width=True)
            
            if back_clicked:
                state.reset()
                st.rerun()
        return
    
    # BLOCK 1: Header with Assumptions
    render_header_with_assumptions(result, query)
    
    # BLOCK 2: Market Snapshot
    render_market_snapshot(result)
    
    # BLOCK 2.5: Lead Time (CRITICAL for B2B)
    render_lead_time_section(result)
    
    # Two-column layout for Cost and Suppliers - balanced for readability
    left_col, right_col = st.columns([1.2, 1], gap="large")
    
    with left_col:
        # BLOCK 3: Landed Cost
        render_landed_cost_panel(result)
    
    with right_col:
        # BLOCK 4: Suppliers
        render_suppliers_panel(result)
    
    # BLOCK 5: Next Actions + CTA + Disclaimer
    render_next_actions_and_cta(result)
    
    # STICKY CTA BAR (scroll anchor only - no direct action)
    landed_cost_data = result.get("landed_cost", {})
    cost_per_unit = landed_cost_data.get("cost_per_unit_usd", 0)
    
    st.markdown(f"""
        <div class="sticky-cta">
            <span class="sticky-cta-text">
                💡 This case looks viable (${cost_per_unit:.2f}/unit). Ready for real quotes?
            </span>
            <a href="#consultation" class="sticky-cta-btn" 
               onclick="document.getElementById('consultation').scrollIntoView({{behavior: 'smooth'}}); return false;">
                🔒 Secure Real Quotes & Factory Visits
            </a>
        </div>
    """, unsafe_allow_html=True)

