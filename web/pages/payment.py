"""
Lemon Squeezy 결제 페이지

사용자가 NexSupply Pro 플랜을 구독할 수 있는 결제 페이지입니다.
Lemon Squeezy를 통해 월간 구독을 처리합니다.
"""

import streamlit as st
import urllib.parse
from typing import Optional
from utils.config import Config


def show_payment_page(user_id: Optional[str] = None, user_email: Optional[str] = None):
    """
    Lemon Squeezy 결제 페이지를 표시합니다.
    
    Args:
        user_id: 사용자 ID (Supabase Auth UUID)
        user_email: 사용자 이메일
    """
    st.title("💎 NexSupply Pro 업그레이드")
    st.markdown("---")
    
    st.write("AI 리스크 분석을 무제한으로 이용하세요.")
    
    # 플랜 비교
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("""
        ### Free Plan ($0)
        
        - 월 3회 분석
        - 기본 리포트
        - 제한된 기능
        """)
        
        # 현재 플랜 표시
        if user_id:
            user_profile = st.session_state.get("user_profile")
            if user_profile:
                current_role = user_profile.get("role", "free")
                if current_role == "free":
                    st.success("현재 플랜")
    
    with col2:
        st.markdown("""
        ### Pro Plan ($49/월)
        
        - ♾️ **무제한 분석**
        - 📄 상세 PDF 리포트
        - 🚀 우선 지원
        - 🔒 고급 분석 기능
        """)
        
        # 현재 플랜 표시
        if user_id:
            user_profile = st.session_state.get("user_profile")
            if user_profile:
                current_role = user_profile.get("role", "free")
                if current_role == "pro":
                    st.success("현재 플랜")
    
    st.divider()
    
    # Lemon Squeezy URL 가져오기
    lemon_squeezy_url = Config.get_lemon_squeezy_store_url()
    
    if not lemon_squeezy_url:
        st.error("⚠️ Lemon Squeezy 상점 URL이 설정되지 않았습니다. 환경 변수 또는 Streamlit secrets에 `LEMON_SQUEEZY_STORE_URL`을 설정해주세요.")
        st.code("""
        # .env 파일 또는 Streamlit Cloud Secrets에 추가:
        LEMON_SQUEEZY_STORE_URL = "https://nexsupply.lemonsqueezy.com/buy/..."
        """)
        return
    
    # 사용자 정보 확인
    if not user_id:
        st.warning("⚠️ 로그인이 필요합니다. 구독하려면 먼저 로그인해주세요.")
        return
    
    if not user_email:
        st.warning("⚠️ 이메일 정보가 없습니다. 프로필에서 이메일을 확인해주세요.")
        return
    
    # 결제 링크 생성
    # Lemon Squeezy는 URL 뒤에 쿼리 파라미터로 데이터를 넘길 수 있습니다.
    # checkout[custom][user_id] 이렇게 보내면 나중에 웹훅에서 받을 수 있습니다.
    
    checkout_url = f"{lemon_squeezy_url}?"
    params = {
        "checkout[email]": user_email,          # 고객 이메일 자동 채우기
        "checkout[custom][user_id]": user_id    # 우리 DB의 사용자 ID (나중에 연동용)
    }
    final_url = checkout_url + urllib.parse.urlencode(params)
    
    # 결제 버튼
    st.markdown("### 구독하기")
    
    # 안내 메시지
    st.info("💡 결제 버튼을 클릭하면 Lemon Squeezy 결제 페이지로 이동합니다. 결제 완료 후 자동으로 Pro 플랜이 활성화됩니다.")
    
    # 결제 버튼 (링크 버튼 사용)
    st.link_button(
        "👉 Pro 플랜 구독하기 ($49/월)",
        final_url,
        type="primary"
    )
    
    # 추가 정보
    with st.expander("💰 결제 안내"):
        st.markdown("""
        - **결제 방법**: 신용카드, PayPal 지원
        - **구독 취소**: 언제든지 취소 가능
        - **환불 정책**: 첫 30일 무조건 환불 보장
        - **자동 갱신**: 월 단위로 자동 갱신됩니다
        """)
    
    with st.expander("❓ 자주 묻는 질문"):
        st.markdown("""
        **Q: 무료 플랜에서 제한이 있나요?**  
        A: 네, 월 3회의 AI 분석만 가능합니다. Pro 플랜은 무제한입니다.
        
        **Q: 구독을 취소하면 어떻게 되나요?**  
        A: 즉시 취소 가능하며, 남은 기간 동안은 Pro 기능을 계속 사용할 수 있습니다.
        
        **Q: 결제 후 바로 Pro 기능을 사용할 수 있나요?**  
        A: 네, 결제 완료 후 몇 분 내로 자동으로 Pro 플랜이 활성화됩니다.
        """)


# 메인 실행 로직
def main():
    """결제 페이지 메인 함수"""
    # 페이지 설정
    st.set_page_config(
        page_title="NexSupply Pro 구독",
        page_icon="💎",
        layout="wide"
    )
    
    # 사용자 정보 가져오기
    user = st.session_state.get("user")
    user_id = None
    user_email = None
    
    if user and isinstance(user, dict):
        user_id = user.get("id")
        user_email = user.get("email")
    else:
        # session_state에 직접 저장된 경우
        user_id = st.session_state.get("user_id")
        user_email = st.session_state.get("email")
    
    # 결제 페이지 표시
    show_payment_page(user_id, user_email)


if __name__ == "__main__":
    main()

