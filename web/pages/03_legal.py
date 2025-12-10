"""
NexSupply Legal Pages - Terms of Service & Privacy Policy
"""

import streamlit as st
from utils.i18n import t, render_language_selector_minimal

# Page config
st.set_page_config(
    page_title="Legal - NexSupply",
    page_icon="📋",
    layout="wide"
)

# Language selector
_, _, top_right = st.columns([1, 3, 1])
with top_right:
    render_language_selector_minimal()

# Navigation
col1, col2 = st.columns([1, 1])
with col1:
    # 🔴 [수정] st.button을 st.form_submit_button으로 변경하여 두 번 클릭 문제 해결
    with st.form(key="back_to_home_form"):
        back_clicked = st.form_submit_button("← Back to Home", use_container_width=True)
    
    if back_clicked:
        st.session_state.page = "home"
        st.rerun()

# Content
st.markdown("""
    <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="text-align: center; color: #0EA5E9; margin-bottom: 40px;">
            📋 Legal Information
        </h1>
    </div>
""", unsafe_allow_html=True)

# Terms of Service
with st.expander("📜 Terms of Service", expanded=True):
    st.markdown("""
        ### 1. Service Description
        NexSupply provides AI-powered sourcing analysis and consultation services for B2B businesses.
        Our platform offers:
        - Early-stage cost estimates (±20-25% accuracy)
        - Market analysis and supplier insights
        - Expert consultation services
        
        ### 2. Use of Service
        - You may use NexSupply for legitimate business sourcing purposes only
        - Estimates are for planning purposes and not final quotes
        - You are responsible for verifying all information before making business decisions
        
        ### 3. Intellectual Property
        - All analysis reports, calculations, and methodologies are proprietary
        - You may not reverse-engineer or copy our calculation logic
        - Reports are for your internal use only
        
        ### 4. Limitation of Liability
        - NexSupply provides estimates, not guarantees
        - We are not responsible for business decisions made based on our analysis
        - Always consult with qualified professionals before making final sourcing decisions
        
        ### 5. Contact
        For questions about these terms, contact: **outreach@nexsupply.net**
        
        *Last updated: November 2024*
    """)

# Privacy Policy
with st.expander("🔒 Privacy Policy", expanded=False):
    st.markdown("""
        ### 1. Information We Collect
        - **Product Information**: Product names, descriptions, images you upload
        - **Contact Information**: Email address (when you request consultation)
        - **Usage Data**: Analysis queries, mode selections, timestamps
        
        ### 2. How We Use Your Information
        - To provide sourcing analysis and reports
        - To improve our AI models and service quality
        - To contact you regarding consultation requests
        - For internal analytics and trend analysis
        
        ### 3. Data Security
        - All data is encrypted in transit (HTTPS)
        - API keys and sensitive credentials are stored securely
        - We do not share your information with third parties without consent
        
        ### 4. Your Rights
        - You can request deletion of your data
        - You can opt out of email communications
        - You can request a copy of your data
        
        ### 5. Data Retention
        - Analysis data is retained for service improvement
        - Contact information is retained for consultation follow-up
        - You can request deletion at any time
        
        ### 6. Contact
        For privacy concerns, contact: **outreach@nexsupply.net**
        
        *Last updated: November 2024*
    """)

# Footer
st.markdown("""
    <div style="text-align: center; padding: 40px 20px; color: #9CA3AF; font-size: 0.85rem;">
        <p>© 2017 NexSupply. All rights reserved.</p>
        <p style="margin-top: 8px;">
            <a href="/" style="color: #0EA5E9; text-decoration: none;">Home</a> · 
            <a href="/legal" style="color: #0EA5E9; text-decoration: none;">Legal</a>
        </p>
    </div>
""", unsafe_allow_html=True)

