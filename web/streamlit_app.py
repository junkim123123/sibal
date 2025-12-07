"""
NexSupply - B2B Sourcing Platform
Main Entry Point with Clean Global CSS
"""
from dotenv import load_dotenv

# 로컬 개발 시 .env 로드 (가장 먼저 실행)
load_dotenv(override=False)

import streamlit as st
import streamlit.components.v1 as components
from state.session_state import init_session_state
from utils.config import AppSettings


# =============================================================================
# PWA SETUP
# =============================================================================

def setup_pwa():
    """PWA 메타 태그 및 manifest 링크 추가"""
    pwa_meta = """
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#00BFA5">
    <meta name="color-scheme" content="light dark">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="NexSupply">
    <link rel="apple-touch-icon" href="https://app.nexsupply.app/icon-192.png">
    <link rel="icon" type="image/png" sizes="192x192" href="https://app.nexsupply.app/icon-192.png">
    <link rel="icon" type="image/png" sizes="512x512" href="https://app.nexsupply.app/icon-512.png">
    <script>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js');
        }
    </script>
    """
    components.html(pwa_meta, height=0)


# =============================================================================
# PAGE CONFIGURATION
# =============================================================================

def configure_page():
    """Configure Streamlit page settings."""
    st.set_page_config(
        page_title="NexSupply",
        page_icon="🎯",
        layout="wide",
        initial_sidebar_state="collapsed"
    )


# =============================================================================
# CLEAN GLOBAL CSS - No Position Hacks
# =============================================================================

def apply_global_css():
    """Apply clean global CSS without position:absolute hacks."""
    st.markdown("""
        <style>
        /* ===========================================
           IMPORTS & FONTS
           =========================================== */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
        }
        
        /* ===========================================
           HIDE ALL STREAMLIT DEFAULTS
           =========================================== */
        
        [data-testid="stSidebar"] { display: none !important; }
        [data-testid="collapsedControl"] { display: none !important; }
        header { visibility: hidden !important; height: 0 !important; }
        header[data-testid="stHeader"] { display: none !important; }
        #MainMenu { visibility: hidden !important; }
        footer { visibility: hidden !important; }
        .stDeployButton { display: none !important; }
        
        /* ===========================================
           PURE WHITE BACKGROUND
           =========================================== */
        
        .stApp { background-color: #FFFFFF !important; }
        .main { background-color: #FFFFFF !important; }
        
        /* ===========================================
           MAIN CONTENT CENTERING
           =========================================== */
        
        .main .block-container {
            padding-top: 0 !important;
            padding-bottom: 2rem;
            max-width: 1100px;
            margin: 0 auto;
        }
        
        /* ===========================================
           INPUT CONTAINER - Layered Depth Shadow
           =========================================== */
        
        .input-container {
            background: #FFFFFF;
            border: 1px solid #E5E7EB;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(3, 105, 161, 0.2);
            margin-bottom: 16px;
        }
        
        /* ===========================================
           TEXT AREA STYLING
           =========================================== */
        
        .stTextArea textarea {
            border: 1px solid #E5E7EB !important;
            border-radius: 12px !important;
            padding: 16px !important;
            font-size: 16px !important;
            color: #1F2937 !important;
            background: #FAFAFA !important;
            resize: none !important;
            transition: all 0.2s ease !important;
        }
        
        .stTextArea textarea:focus {
            border-color: #0EA5E9 !important;
            background: #FFFFFF !important;
            box-shadow: 
                0 0 0 3px rgba(14, 165, 233, 0.15),
                0 0 20px rgba(14, 165, 233, 0.1),
                0 0 40px rgba(14, 165, 233, 0.05) !important;
            outline: none !important;
        }
        
        .stTextArea textarea::placeholder {
            color: #9CA3AF !important;
        }
        
        .stTextArea label { display: none !important; }
        
        /* ===========================================
           POPOVER BUTTON (📎 Attach)
           =========================================== */
        
        [data-testid="stPopover"] > button {
            background: #F8FAFC !important;
            border: 1px solid #E5E7EB !important;
            border-radius: 10px !important;
            padding: 8px 16px !important;
            font-size: 14px !important;
            color: #64748B !important;
            transition: all 0.2s ease !important;
        }
        
        [data-testid="stPopover"] > button:hover {
            background: #F1F5F9 !important;
            border-color: #0EA5E9 !important;
            color: #0EA5E9 !important;
        }
        
        /* ===========================================
           PRIMARY BUTTON (Search/Submit)
           =========================================== */
        
        .stButton > button[kind="primary"],
        .stButton > button[data-testid="stBaseButton-primary"] {
            background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 12px 24px !important;
            font-weight: 600 !important;
            font-size: 15px !important;
            transition: all 0.2s ease !important;
            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.35) !important;
        }
        
        .stButton > button[kind="primary"]:hover,
        .stButton > button[data-testid="stBaseButton-primary"]:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 16px rgba(14, 165, 233, 0.45) !important;
        }
        
        /* ===========================================
           SECONDARY BUTTON (Back, etc.)
           =========================================== */
        
        .stButton > button[kind="secondary"],
        .stButton > button[data-testid="stBaseButton-secondary"] {
            background: #F1F5F9 !important;
            color: #475569 !important;
            border: none !important;
            border-radius: 10px !important;
            padding: 10px 20px !important;
            font-weight: 500 !important;
        }
        
        .stButton > button[kind="secondary"]:hover,
        .stButton > button[data-testid="stBaseButton-secondary"]:hover {
            background: #E2E8F0 !important;
        }
        
        /* ===========================================
           MINI-WIZARD CARD SELECT BUTTONS
           =========================================== */
        
        /* Card select buttons - transparent overlay */
        button[data-testid="stBaseButton-secondary"][kind="secondary"] {
            background: transparent !important;
            border: none !important;
            padding: 8px !important;
            margin-top: -8px !important;
            font-size: 0.8rem !important;
            color: #64748B !important;
            opacity: 0.7;
            transition: all 0.2s ease !important;
        }
        
        button[data-testid="stBaseButton-secondary"][kind="secondary"]:hover {
            opacity: 1 !important;
            color: #0EA5E9 !important;
            background: rgba(14, 165, 233, 0.05) !important;
        }
        
        /* ===========================================
           PULSE ANIMATION FOR READY STATE
           =========================================== */
        
        @keyframes pulse-border {
            0% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.4); }
            70% { box-shadow: 0 0 0 8px rgba(14, 165, 233, 0); }
            100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
        }
        
        .pulse-active button {
            animation: pulse-border 2s infinite !important;
            border: 2px solid #0EA5E9 !important;
        }
        
        /* ===========================================
           MODE BADGE STYLING
           =========================================== */
        
        .mode-indicator {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 12px;
            animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* ===========================================
           METRIC CARD
           =========================================== */
        
        .metric-card {
            background: #FFFFFF;
            border: 1px solid #E5E7EB;
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            transition: all 0.2s ease;
        }
        
        .metric-card:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }
        
        .metric-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: #0EA5E9;
        }
        
        .metric-label {
            font-size: 0.85rem;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 4px;
        }
        
        /* ===========================================
           SUPPLIER CARD
           =========================================== */
        
        .supplier-card {
            background: #FFFFFF;
            border: 1px solid #E5E7EB;
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 12px;
            transition: all 0.2s ease;
        }
        
        .supplier-card:hover {
            border-color: #0EA5E9;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }
        
        /* ===========================================
           CLEAN FILE UPLOADER IN POPOVER
           =========================================== */
        
        [data-testid="stPopover"] [data-testid="stFileUploader"] {
            background: transparent !important;
        }
        
        [data-testid="stPopover"] [data-testid="stFileUploaderDropzone"] {
            border: 2px dashed #E5E7EB !important;
            border-radius: 12px !important;
            padding: 20px !important;
            background: #FAFAFA !important;
        }
        
        [data-testid="stPopover"] [data-testid="stFileUploaderDropzone"]:hover {
            border-color: #0EA5E9 !important;
            background: #F0F9FF !important;
        }
        
        /* ===========================================
           GENERAL CLEANUP
           =========================================== */
        
        /* Remove extra margins */
        .stMarkdown { margin-bottom: 0 !important; }
        
        /* Caption styling */
        .stCaption {
            color: #64748B !important;
            font-size: 0.85rem !important;
        }
        
        /* Warning message styling */
        .stAlert {
            border-radius: 12px !important;
        }
        
        </style>
    """, unsafe_allow_html=True)


# =============================================================================
# IMPORT PAGES
# =============================================================================

from pages.home import render_home_page
from pages.results_dashboard import render_results_page
from utils.project_manager import initialize_supabase


# =============================================================================
# MAIN
# =============================================================================

def main():
    """Main application entry point."""
    configure_page()
    setup_pwa()
    apply_global_css()
    init_session_state()
    
    # Initialize Supabase (non-blocking - works without authentication)
    try:
        initialize_supabase()
    except Exception as e:
        # Supabase 초기화 실패해도 앱은 계속 작동 (로그인 없는 경우)
        pass
    
    # Initialize page/view state
    if "view" not in st.session_state:
        st.session_state.view = "landing"
    if "page" not in st.session_state:
        st.session_state.page = "home"
    
    # Check both 'view' and 'page' for navigation (compatibility)
    is_results_page = (
        st.session_state.view == "result" or 
        st.session_state.page == "results"
    )
    
    if is_results_page:
        render_results_page()
    else:
        render_home_page()


if __name__ == "__main__":
    main()
