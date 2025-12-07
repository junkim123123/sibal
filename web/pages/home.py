"""
NexSupply Landing Page - Redesigned for Clarity & Conversion
Clean, unified input area with polished Quick Start cards
"""

import streamlit as st
import time
import traceback

from services.gemini_service import GeminiService
from state.session_state import get_sourcing_state
from utils.i18n import t, render_language_selector_minimal


# =============================================================================
# DATA CONVERSION
# =============================================================================

def convert_api_response(data: dict) -> dict:
    """Convert GeminiService response to UI format."""
    market = data.get("market_snapshot", {})
    cost = data.get("landed_cost_breakdown", {})
    suppliers_raw = data.get("verified_suppliers", [])
    lead_time = data.get("lead_time_analysis", {})
    
    market_snapshot = {
        "demand": market.get("demand", "Medium"),
        "demand_change": market.get("demand_trend", "+0%"),
        "demand_evidence": market.get("demand_evidence", "Based on marketplace data"),
        "margin": market.get("margin_estimate", "25%"),
        "margin_note": market.get("margin_note", "After platform fees"),
        "margin_change": market.get("margin_trend", "+0%"),
        "competition": market.get("competition_level", "Medium"),
        "competition_change": market.get("competition_trend", "+0%"),
        "market_size": market.get("market_size_usd", "$10M")
    }
    
    cost_components = cost.get("cost_components", {})
    # Default percentages (will be recalculated if cost_components exist)
    landed_cost = {
        "product": 45,  # Default: will be recalculated from actual cost data
        "shipping": 25,  # Default: will be recalculated from actual cost data
        "customs": 18,  # Default: will be recalculated from actual cost data
        "handling": 12,  # Default: will be recalculated from actual cost data
        "total_landed_cost_usd": cost.get("total_landed_cost_usd", 0),
        "cost_per_unit_usd": cost.get("cost_per_unit_usd", 0),
        "quantity_basis": cost.get("quantity_basis", 1000),
        "components": cost_components,
        "hidden_cost_warnings": cost.get("hidden_cost_warnings", []),
    }
    
    # Recalculate percentages from actual cost components if available
    if cost_components:
        fob = cost_components.get("fob_price_usd", 0)
        freight = cost_components.get("ocean_freight_usd", 0) + cost_components.get("inland_freight_usd", 0)
        customs = cost_components.get("customs_duty_usd", 0) + cost_components.get("customs_broker_fee_usd", 0)
        handling = cost_components.get("terminal_handling_charge_usd", 0) + cost_components.get("insurance_usd", 0)
        
        calc_total = fob + freight + customs + handling
        if calc_total > 0:
            landed_cost["product"] = round((fob / calc_total) * 100)
            landed_cost["shipping"] = round((freight / calc_total) * 100)
            landed_cost["customs"] = round((customs / calc_total) * 100)
            landed_cost["handling"] = round((handling / calc_total) * 100)
    
    lead_time_analysis = {
        "production_days": lead_time.get("production_lead_time_days", 21),
        "shipping_days": lead_time.get("sea_freight_lead_time_days", 30),
        "port_congestion_days": lead_time.get("port_congestion_buffer_days", 5),
        "customs_days": lead_time.get("customs_clearance_days", 5),
        "delivery_days": lead_time.get("inland_delivery_days", 3),
        "total_days": lead_time.get("total_lead_time_days", 61),
        "safety_stock_days": lead_time.get("safety_stock_days", 14),
        "current_conditions": lead_time.get("current_conditions", ""),
        "order_advance_days": lead_time.get("recommended_order_advance_days", 75)
    }
    
    suppliers = []
    for s in suppliers_raw:
        suppliers.append({
            "name": s.get("name", "Unknown Supplier"),
            "location": s.get("location", "Unknown"),
            "region": s.get("region", ""),
            "rating": s.get("rating", 4.5),
            "min_order": s.get("min_order_qty", "MOQ varies"),
            "price_range": s.get("price_range_usd", "Contact for pricing"),
            "verified": s.get("verified", True),
            "response_time": s.get("response_time", "< 48h"),
            "certifications": s.get("certifications", []),
            "years_in_business": s.get("years_in_business", 3),
            "factory_grade": s.get("estimated_factory_grade", "Tier-2 Factory"),
            "trade_assurance": s.get("trade_assurance", False),
            "quality_tier": s.get("estimated_quality_tier", "Medium"),
            "risk_notes": s.get("risk_notes", "No specific risks identified"),
            "green_flags": s.get("green_flags", []),
        })
    
    risk_analysis_raw = data.get("risk_analysis", {})
    
    return {
        "market_snapshot": market_snapshot,
        "landed_cost": landed_cost,
        "lead_time": lead_time_analysis,
        "suppliers": suppliers,
        "trends": data.get("trends_with_evidence", data.get("market_trends", [])),
        "product_info": data.get("product_info", {}),
        "risk_assessment": data.get("risk_assessment", {}),
        "risk_analysis": risk_analysis_raw,
        "action_items": data.get("action_items", []),
        "honest_assessment": data.get("honest_assessment", {}),
        "data_transparency": data.get("data_transparency", {}),
        "analysis_confidence": data.get("analysis_confidence", 0.75),
        "raw_data": data
    }


# =============================================================================
# CSS - Refined and Polished
# =============================================================================

def apply_css():
    st.markdown("""
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        .input-label {
            font-weight: 600;
            color: #1F2937;
            font-size: 0.95rem;
            margin-bottom: 10px;
            display: block;
        }
        
        /* Text inputs styling - MORE SPACIOUS */
        .stTextInput input {
            border: 1.5px solid #E5E7EB !important;
            border-radius: 12px !important;
            font-size: 16px !important;
            padding: 16px 18px !important;
            background: #FAFAFA !important;
            transition: all 0.2s ease !important;
            height: 54px !important;
        }
        
        .stTextInput input:focus {
            border-color: #0EA5E9 !important;
            background: white !important;
            box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.12) !important;
        }
        
        .stTextArea textarea {
            border: 1.5px solid #E5E7EB !important;
            border-radius: 12px !important;
            font-size: 15px !important;
            padding: 16px 18px !important;
            background: #FAFAFA !important;
            min-height: 100px !important;
            transition: all 0.2s ease !important;
            line-height: 1.6 !important;
        }
        
        .stTextArea textarea:focus {
            border-color: #0EA5E9 !important;
            background: white !important;
            box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.12) !important;
        }
        
        /* Hide default labels */
        .stTextArea label, .stTextInput label { display: none !important; }
        
        /* Hint text */
        .hint-text {
            font-size: 0.85rem;
            color: #6B7280;
            margin-top: 16px;
            padding: 14px 18px;
            background: #F8FAFC;
            border-radius: 10px;
            border-left: 4px solid #0EA5E9;
            line-height: 1.5;
        }
        
        /* ===== QUICK START CARDS ===== */
        .quick-section-header {
            text-align: center;
            margin: 40px 0 24px 0;
        }
        
        .quick-section-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #374151;
            margin-bottom: 6px;
        }
        
        .quick-section-subtitle {
            font-size: 0.85rem;
            color: #9CA3AF;
        }
        
        .quick-card {
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 14px;
            padding: 20px;
            margin-bottom: 12px;
            transition: all 0.25s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        
        .quick-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
            opacity: 0;
            transition: opacity 0.25s ease;
        }
        
        .quick-card:hover {
            border-color: #0EA5E9;
            box-shadow: 0 8px 24px rgba(14, 165, 233, 0.12);
            transform: translateY(-2px) scale(1.02);
            background: #FAFAFA;
        }
        
        .quick-card:hover::before {
            opacity: 1;
        }
        
        .quick-card-icon {
            font-size: 1.5rem;
            margin-bottom: 10px;
        }
        
        .quick-card-title {
            font-weight: 600;
            color: #0F172A;
            font-size: 0.95rem;
            margin-bottom: 8px;
        }
        
        .quick-card-desc {
            font-size: 0.8rem;
            color: #64748B;
            line-height: 1.5;
        }
        
        /* Quick start button - more visible */
        div[data-testid="column"] .stButton > button[data-testid="stBaseButton-secondary"] {
            background: #F0F9FF !important;
            border: 1px solid #BAE6FD !important;
            color: #0369A1 !important;
            font-weight: 600 !important;
            border-radius: 8px !important;
            padding: 8px 16px !important;
            font-size: 0.85rem !important;
            transition: all 0.2s ease !important;
        }
        
        div[data-testid="column"] .stButton > button[data-testid="stBaseButton-secondary"]:hover {
            background: #0EA5E9 !important;
            border-color: #0EA5E9 !important;
            color: white !important;
        }
        
        /* Primary analyze button - pulse ready */
        .ready-pulse .stButton > button[data-testid="stBaseButton-primary"] {
            animation: glow-pulse 2s infinite;
        }
        
        @keyframes glow-pulse {
            0%, 100% { box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35); }
            50% { box-shadow: 0 4px 24px rgba(14, 165, 233, 0.55); }
        }
        
        /* File attachment section */
        .file-section {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #F1F5F9;
        }
        
        /* Attached file indicator */
        .attached-file {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #F0FDF4;
            color: #166534;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        /* Template hint box */
        .template-hint {
            background: #FEF3C7;
            border: 1px solid #FDE68A;
            border-radius: 10px;
            padding: 12px 16px;
            margin-bottom: 16px;
            font-size: 0.85rem;
            color: #92400E;
        }
        </style>
    """, unsafe_allow_html=True)


# =============================================================================
# LANDING PAGE - Refined UI
# =============================================================================

def render_home_page():
    """Clean landing page with unified input and polished Quick Start."""
    
    apply_css()
    
    # Initialize session state
    if "search_query" not in st.session_state:
        st.session_state.search_query = ""
    if "context_query" not in st.session_state:
        st.session_state.context_query = ""
    if "uploaded_file" not in st.session_state:
        st.session_state.uploaded_file = None
    
    # Error display
    state = get_sourcing_state()
    error = state.get_error()
    if error:
        st.error(f"{t('error_analysis_failed')}: {error}")
        if st.button(t("clear_error")):
            state.clear_error()
            st.rerun()
    
    # === TOP BAR with Language Selector ===
    _, _, top_right = st.columns([1, 3, 1])
    with top_right:
        render_language_selector_minimal()
    
    # === HERO SECTION ===
    st.markdown(f"""
        <div style="text-align: center; padding: 30px 0 24px 0;">
            <h1 style="font-size: 2.5rem; font-weight: 800; color: #0EA5E9; margin: 0; line-height: 1.2;">
                {t('hero_headline')}
            </h1>
            <p style="font-size: 1rem; color: #64748B; margin-top: 12px; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.5;">
                {t('hero_subtitle')}
            </p>
        </div>
    """, unsafe_allow_html=True)
    
    # === AI LIMITATION NOTICE (Trust Building) ===
    st.markdown("""
        <div style="max-width: 700px; margin: 0 auto 24px auto; padding: 14px 20px; 
                    background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); 
                    border-radius: 12px; border-left: 4px solid #F59E0B;
                    font-size: 0.9rem; color: #92400E; text-align: center;">
            💡 <strong>How it works:</strong> AI provides estimates (±20-25% accuracy) for early screening. 
            <strong>Expert consultation</strong> refines to real quotes & verified suppliers.
        </div>
    """, unsafe_allow_html=True)
    
    # === UNIFIED INPUT BOX === (wider layout)
    _, center, _ = st.columns([0.5, 3, 0.5])
    
    with center:
        # Show hint if template contains placeholders (check context area)
        context_text = st.session_state.get("context_query", "")
        if context_text and "[" in context_text and "]" in context_text:
            st.markdown(f"""
                <div class="template-hint">
                    💡 <strong>Tip:</strong> Fill in <strong>Product or keyword</strong> above, then replace the [brackets] below with your details.
                </div>
            """, unsafe_allow_html=True)
        
        # --- Input 1: Product or Keyword ---
        st.markdown(f'<span class="input-label">🏷️ {t("input_label_product")}</span>', unsafe_allow_html=True)
        
        product_query = st.text_input(
            "Product or keyword",
            value=st.session_state.search_query,
            placeholder=t('input_placeholder_product'),
            label_visibility="collapsed",
            key="product_input"
        )
        st.session_state.search_query = product_query
        
        st.markdown("<div style='height: 24px;'></div>", unsafe_allow_html=True)
        
        # --- Input 2: Context (Optional) ---
        st.markdown(f'<span class="input-label">📋 {t("input_label_context")}</span>', unsafe_allow_html=True)
        
        context_query = st.text_area(
            "Context and requirements",
            value=st.session_state.context_query,
            placeholder=t('input_placeholder_context'),
            height=120,
            label_visibility="collapsed",
            key="context_input"
        )
        st.session_state.context_query = context_query
        
        # --- Hint ---
        st.markdown(f"""
            <div class="hint-text">
                💡 {t('input_hint')}
            </div>
        """, unsafe_allow_html=True)
        
        st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)

        # --- Action Row: Attach + Analyze ---
        col1, col2 = st.columns([1, 2])
        
        with col1:
            with st.popover("📎 Attach File"):
                uploaded = st.file_uploader(
                    "Select file",
                    type=["png", "jpg", "jpeg", "pdf"],
                    label_visibility="collapsed"
                )
                if uploaded:
                    st.session_state.uploaded_file = uploaded
                    st.success(f"✓ {uploaded.name}")
                st.caption("Images (JPG, PNG) or PDF")
        
        with col2:
            # Combine inputs
            full_query = product_query.strip()
            if context_query.strip():
                full_query = f"{product_query.strip()}\n\n{context_query.strip()}"
            
            has_input = bool(full_query) or st.session_state.uploaded_file
            
            # Analyze button
            analyze_clicked = st.button(
                f"🔍 {t('btn_analyze')}", 
                type="primary", 
                use_container_width=True,
                key="main_analyze_btn"
            )
            
            if analyze_clicked:
                if not has_input:
                    st.warning(t("error_no_input"))
                else:
                    st.session_state.search_query = full_query
                    state.clear_error()
                    
                    # 프로젝트 생성 (Supabase 연동)
                    project_id = None
                    user_id = None
                    if st.session_state.get("user") and isinstance(st.session_state.user, dict):
                        user_id = st.session_state.user.get("id")
                        if user_id:
                            try:
                                from utils.project_manager import create_new_project
                                # 제품 이름 추출 (프로젝트 이름으로 사용)
                                project_name = product_query.strip()[:50] if product_query.strip() else None
                                project_id = create_new_project(user_id, project_name)
                            except Exception as e:
                                # 프로젝트 생성 실패해도 분석은 계속 진행
                                print(f"[Project Creation Error] {e}")
                    
                    # === STEP-BY-STEP PROGRESS (Security-Aware Messages) ===
                    with st.status("🔎 AI is building your Sourcing Blueprint...", expanded=True) as status:
                        st.write("⏱️ *This analysis takes 10-20 seconds*")
                        st.write("")
                        st.write("📊 **Step 1/3:** Calculating Landed Cost & Margin Estimate...")
                        start_time = time.time()
                        
                        try:
                            service = GeminiService()
                            
                            # Step 2
                            elapsed = int(time.time() - start_time)
                            if elapsed > 5:  # Only update if taking time
                                status.update(label="🧠 Deep-diving into complex supply chains...")
                                st.write("📊 **Step 2/3:** Analyzing Market Demand & Competition Risk...")
                            
                            # Check elapsed time before analysis
                            elapsed = time.time() - start_time
                            if elapsed > 25:  # If already taking long, show timeout message
                                status.update(label="⏳ Taking Longer Than Expected...")
                                st.warning("⏳ **Taking Longer Than Expected!**\n\nDo you want us to email the full report and supplier shortlist when it's ready?")
                                # Email collection form (shown in status)
                                email_for_report = st.text_input("Your Email (optional)", key="timeout_email", placeholder="your@email.com")
                                if email_for_report and "@" in email_for_report:
                                    st.info("✅ We'll email you the report when ready. Continuing analysis...")
                            
                            result = service.analyze_product(state.get_input())
                            
                            # Step 3
                            elapsed = int(time.time() - start_time)
                            if elapsed > 15:  # If taking longer, show progress
                                status.update(label="🔍 Vetting Suppliers & Running Risk Assessment...")
                            else:
                                status.update(label="✅ Step 3/3: Generating report...")
                            
                            st.write("📊 **Step 3/3:** Vetting Suppliers & Running Risk Assessment...")
                            
                            if result["success"]:
                                status.update(label="✅ Analysis complete!", state="complete")
                                converted = convert_api_response(result["data"])
                                converted["analysis_mode"] = result.get("mode", "general")
                                
                                # 분석 결과를 데이터베이스에 저장 (프로젝트가 있는 경우)
                                if project_id:
                                    try:
                                        from utils.project_manager import (
                                            save_message_to_db,
                                            update_project_with_analysis,
                                            extract_analysis_results
                                        )
                                        
                                        # 사용자 입력 메시지 저장
                                        if full_query:
                                            save_message_to_db(project_id, "user", full_query)
                                        
                                        # AI 응답 저장 (요약)
                                        ai_summary = f"Analysis completed: {converted.get('product_info', {}).get('product_name', 'Product analysis')}"
                                        save_message_to_db(project_id, "ai", ai_summary)
                                        
                                        # 분석 결과 데이터 추출 및 프로젝트 업데이트
                                        risk_score, landed_cost = extract_analysis_results(converted)
                                        update_project_with_analysis(
                                            project_id=project_id,
                                            risk_score=risk_score,
                                            landed_cost=landed_cost,
                                            status="completed"
                                        )
                                    except Exception as e:
                                        # DB 저장 실패해도 결과는 표시
                                        print(f"[DB Save Error] Failed to save analysis: {e}")
                                
                                state.set_result(converted)
                                st.session_state.analysis_mode = result.get("mode", "general")
                                st.session_state.page = "results"
                                st.rerun()
                            else:
                                status.update(label="❌ Analysis failed", state="error")
                                error_code = "A-101"  # Generic error code
                                from utils.config import Config
                                contact_email = Config.get_consultation_email()
                                
                                # Get error details from result if available
                                error_msg = result.get("error", "Unknown error")
                                error_details = result.get("error_details", "")
                                
                                # Display error with traceback
                                st.error(f"⚠️ **Analysis Failed. (Error Code: {error_code})**\n\nWe apologize for the issue. Please **refresh the page** or email us the details directly at **{contact_email}**")
                                
                                # Print full traceback to terminal
                                print(f"\n{'='*80}")
                                print(f"ERROR CODE: {error_code}")
                                print(f"{'='*80}")
                                print(f"Error Message: {error_msg}")
                                if error_details:
                                    print(f"Error Details: {error_details}")
                                print(f"Full Result: {result}")
                                print(f"{'='*80}\n")
                                
                                st.session_state.last_error = error_code
                        
                        except Exception as e:
                            status.update(label="❌ Error occurred", state="error")
                            error_code = "A-102"  # Generic error code
                            from utils.config import Config
                            contact_email = Config.get_consultation_email()
                            st.error(f"⚠️ **Analysis Failed. (Error Code: {error_code})**\n\nWe apologize for the issue. Please **refresh the page** or email us the details directly at **{contact_email}**")
                            st.session_state.last_error = error_code
                            
                            # Print full traceback to terminal
                            print(f"\n{'='*80}")
                            print(f"ERROR CODE: {error_code}")
                            print(f"{'='*80}")
                            traceback.print_exc()
                            print(f"{'='*80}\n")
                            
                            # Log error internally (not shown to user)
                            import logging
                            logger = logging.getLogger(__name__)
                            logger.error(f"Analysis error (code {error_code}): {str(e)}", exc_info=True)
        
        # Demo button (shown separately if there was an error)
        if st.session_state.get("last_error"):
            if st.button(t("btn_demo"), key="demo_btn"):
                service = GeminiService()
                mock = service.get_mock_analysis(st.session_state.get("search_query", "Demo"))
                converted = convert_api_response(mock["data"])
                converted["analysis_mode"] = "general"
                state.set_result(converted)
                st.session_state.analysis_mode = "general"
                st.session_state.last_error = None
                st.session_state.page = "results"
                st.rerun()
        
        # File indicator (if attached)
        if st.session_state.uploaded_file:
            st.markdown(f"""
                <div style="margin-top: 12px;">
                    <span class="attached-file">📎 {st.session_state.uploaded_file.name}</span>
                </div>
            """, unsafe_allow_html=True)
    
    # === QUICK START SECTION ===
    st.markdown(f"""
        <div class="quick-section-header">
            <div class="quick-section-title">⚡ {t('quick_start')}</div>
            <div class="quick-section-subtitle">{t('quick_start_subtitle')}</div>
        </div>
    """, unsafe_allow_html=True)
    
    # Quick start cards - 2x2 grid
    col1, col2 = st.columns(2)
    
    quick_options = [
        {
            "icon": "🔍",
            "key": "quick_verify",
            "sub_key": "quick_verify_sub",
            "template_key": "template_verify",
            "mode": "verify",
            "color": "#8B5CF6",  # Purple
            "expectation": "Typical analysis time: ~10 minutes."
        },
        {
            "icon": "📊",
            "key": "quick_cost",
            "sub_key": "quick_cost_sub",
            "template_key": "template_cost",
            "mode": "cost",
            "color": "#10B981",  # Green
            "expectation": "Great for early product ideas."
        },
        {
            "icon": "📸",
            "key": "quick_market",
            "sub_key": "quick_market_sub",
            "template_key": "template_market",
            "mode": "market",
            "color": "#F59E0B",  # Amber
            "expectation": "Use this before deep cost analysis."
        },
        {
            "icon": "💡",
            "key": "quick_leadtime",
            "sub_key": "quick_leadtime_sub",
            "template_key": "template_leadtime",
            "mode": "leadtime",
            "color": "#EC4899",  # Pink
            "expectation": "Critical for production planning and inventory management."
        },
    ]
    
    for idx, opt in enumerate(quick_options):
        target_col = col1 if idx % 2 == 0 else col2
        
        with target_col:
            card_title = t(opt["key"])
            card_desc = t(opt["sub_key"])
            
            st.markdown(f"""
                <div class="quick-card">
                    <div class="quick-card-icon">{opt['icon']}</div>
                    <div class="quick-card-title">{card_title}</div>
                    <div class="quick-card-desc">{card_desc}</div>
                    <div style="font-size: 0.75rem; color: #94A3B8; margin-top: 8px; font-style: italic;">
                        {opt.get('expectation', '')}
                    </div>
                </div>
            """, unsafe_allow_html=True)
            
            if st.button(
                f"→ Use this mode",
                key=f"quick_{idx}",
                use_container_width=True,
                type="secondary"
            ):
                template = t(opt["template_key"])
                # Template goes into Context area, not Product keyword
                st.session_state.search_query = ""  # Clear product field
                st.session_state.context_query = template  # Put template in context
                st.session_state.analysis_mode = opt["mode"]
                st.session_state.template_just_filled = True
                
                # Log mode card usage for analytics
                try:
                    from services.data_logger import log_mode_usage
                    log_mode_usage(
                        mode_name=opt["mode"],
                        template_used=template,
                        converted=False  # Will be updated when analysis runs
                    )
                except Exception:
                    pass  # Don't break UX if logging fails
                
                st.rerun()
    
    # Toast notification
    if st.session_state.get("template_just_filled"):
        st.toast(t("template_loaded"), icon="📝")
        st.session_state.template_just_filled = False
    
    # === FOOTER ===
    st.markdown(f"""
        <div style="text-align: center; padding: 50px 0 20px 0; color: #9CA3AF; font-size: 0.8rem;">
            {t('powered_by')} · © 2017 NexSupply<br>
            <a href="/legal" style="color: #64748B; text-decoration: none; margin: 0 8px;">Terms of Service</a> · 
            <a href="/legal" style="color: #64748B; text-decoration: none; margin: 0 8px;">Privacy Policy</a>
        </div>
    """, unsafe_allow_html=True)


# =============================================================================
# RESULT PAGE (Simplified redirect)
# =============================================================================

def render_result_page():
    """Redirect to full results - main logic in results_dashboard.py."""
    import pages.results_dashboard as results_dashboard
    results_dashboard.render_results_page()
