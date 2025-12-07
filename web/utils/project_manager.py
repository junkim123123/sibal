"""
Project Management Utilities for NexSupply AI Analyzer

프로젝트 생성, 조회, 업데이트를 위한 유틸리티 함수들을 제공합니다.
Supabase DB와 Streamlit session_state를 통합하여 사용합니다.
"""

import streamlit as st
from typing import Optional, Dict, List, Any
from datetime import datetime
from services.supabase_service import get_supabase_service


def initialize_supabase() -> bool:
    """
    Supabase 서비스를 초기화하고 사용자 프로필을 로드합니다.
    
    Returns:
        초기화 성공 여부
    """
    # Supabase 서비스 초기화
    service = get_supabase_service()
    
    if not service:
        return False
    
    # 사용자 정보가 있는 경우 프로필 로드
    user = st.session_state.get("user")
    if user and isinstance(user, dict):
        user_id = user.get("id")
        email = user.get("email")
        
        if user_id:
            # 프로필 조회
            profile = service.get_user_profile(user_id)
            
            if profile:
                st.session_state.user_profile = profile
            elif email:
                # 프로필이 없으면 생성
                service.create_or_update_profile(user_id, email, "free")
                profile = service.get_user_profile(user_id)
                if profile:
                    st.session_state.user_profile = profile
    
    return True


def create_new_project(user_id: str, project_name: Optional[str] = None) -> Optional[str]:
    """
    새 프로젝트를 생성하고 session_state에 저장합니다.
    
    Args:
        user_id: 사용자 UUID
        project_name: 프로젝트 이름 (None이면 자동 생성)
        
    Returns:
        생성된 프로젝트 ID 또는 None
    """
    service = get_supabase_service()
    
    if not service:
        # Supabase가 없어도 조용히 실패 (사용자에게 경고하지 않음)
        return None
    
    # 프로젝트 이름 자동 생성
    if not project_name or not project_name.strip():
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        project_name = f"Analysis {timestamp}"
    
    # 프로젝트 이름 길이 제한
    if len(project_name) > 100:
        project_name = project_name[:100]
    
    # 프로젝트 생성
    project_id = service.create_project(user_id, project_name, "active")
    
    if project_id:
        st.session_state.current_project_id = project_id
        # 성공 메시지는 표시하지 않음 (UI를 깔끔하게 유지)
        return project_id
    
    return None


def load_user_projects(user_id: str, refresh: bool = False) -> List[Dict[str, Any]]:
    """
    사용자의 프로젝트 목록을 로드합니다.
    
    Args:
        user_id: 사용자 UUID
        refresh: True이면 DB에서 새로 조회
        
    Returns:
        프로젝트 목록
    """
    # session_state에 이미 있고 refresh가 아니면 캐시 사용
    if not refresh and "user_projects" in st.session_state and st.session_state.user_projects:
        return st.session_state.user_projects
    
    service = get_supabase_service()
    
    if not service:
        return []
    
    # 프로젝트 목록 조회
    projects = service.get_user_projects(user_id)
    st.session_state.user_projects = projects
    
    return projects


def load_project(project_id: str) -> bool:
    """
    프로젝트를 로드하여 session_state에 설정합니다.
    
    Args:
        project_id: 프로젝트 UUID
        
    Returns:
        성공 여부
    """
    service = get_supabase_service()
    
    if not service:
        return False
    
    project = service.get_project(project_id)
    
    if project:
        st.session_state.current_project_id = project_id
        
        # 프로젝트 메시지도 로드
        messages = service.get_project_messages(project_id)
        
        # 메시지를 채팅 히스토리 형식으로 변환
        chat_history = []
        for msg in messages:
            chat_history.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })
        
        st.session_state.chat_history = chat_history
        
        return True
    
    return False


def save_message_to_db(project_id: str, role: str, content: str) -> bool:
    """
    메시지를 데이터베이스에 저장합니다.
    
    Args:
        project_id: 프로젝트 UUID
        role: 메시지 역할 ('user' 또는 'ai')
        content: 메시지 내용
        
    Returns:
        성공 여부
    """
    service = get_supabase_service()
    
    if not service:
        return False
    
    message_id = service.save_message(project_id, role, content)
    return message_id is not None


def save_chat_history_to_db(project_id: str, chat_history: List[Dict[str, str]]) -> bool:
    """
    채팅 히스토리를 일괄 저장합니다.
    
    Args:
        project_id: 프로젝트 UUID
        chat_history: 채팅 히스토리 리스트 [{"role": "user", "content": "..."}, ...]
        
    Returns:
        성공 여부
    """
    service = get_supabase_service()
    
    if not service:
        return False
    
    return service.save_messages_batch(project_id, chat_history)


def update_project_with_analysis(
    project_id: str,
    risk_score: Optional[float] = None,
    landed_cost: Optional[float] = None,
    status: Optional[str] = None
) -> bool:
    """
    AI 분석 결과로 프로젝트를 업데이트합니다.
    
    Args:
        project_id: 프로젝트 UUID
        risk_score: 초기 리스크 스코어 (0-100)
        landed_cost: 총 도착 비용
        status: 프로젝트 상태 ('active', 'completed', 'archived')
        
    Returns:
        성공 여부
    """
    service = get_supabase_service()
    
    if not service:
        return False
    
    return service.update_project(
        project_id,
        status=status,
        initial_risk_score=risk_score,
        total_landed_cost=landed_cost
    )


def extract_analysis_results(analysis_data: Dict[str, Any]) -> tuple[Optional[float], Optional[float]]:
    """
    분석 결과에서 리스크 스코어와 도착 비용을 추출합니다.
    
    Args:
        analysis_data: 분석 결과 딕셔너리
        
    Returns:
        (risk_score, landed_cost) 튜플
    """
    risk_score = None
    landed_cost = None
    
    # 리스크 스코어 추출
    risk_analysis = analysis_data.get("risk_analysis", {})
    if risk_analysis:
        # 여러 경로에서 리스크 스코어 찾기
        risk_score = (
            risk_analysis.get("overall_risk_score") or
            risk_analysis.get("risk_score") or
            risk_analysis.get("initial_risk_score")
        )
        
        if risk_score:
            try:
                risk_score = float(risk_score)
                # 0-100 범위로 정규화
                if risk_score > 1:
                    risk_score = risk_score / 100 if risk_score > 100 else risk_score
                else:
                    risk_score = risk_score * 100
            except (ValueError, TypeError):
                risk_score = None
    
    # 도착 비용 추출
    landed_cost_data = analysis_data.get("landed_cost", {})
    if landed_cost_data:
        landed_cost = (
            landed_cost_data.get("total_landed_cost_usd") or
            landed_cost_data.get("total_landed_cost") or
            landed_cost_data.get("landed_cost")
        )
        
        if landed_cost:
            try:
                landed_cost = float(landed_cost)
            except (ValueError, TypeError):
                landed_cost = None
    
    return risk_score, landed_cost


def ensure_project_exists(user_id: str) -> Optional[str]:
    """
    현재 활성 프로젝트가 없으면 새로 생성합니다.
    
    Args:
        user_id: 사용자 UUID
        
    Returns:
        프로젝트 ID
    """
    # 이미 프로젝트가 있으면 반환
    current_project_id = st.session_state.get("current_project_id")
    if current_project_id:
        return current_project_id
    
    # 새 프로젝트 생성
    return create_new_project(user_id)

