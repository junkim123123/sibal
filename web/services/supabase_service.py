"""
Supabase Database Service for NexSupply AI Analyzer

이 모듈은 Supabase PostgreSQL 데이터베이스와의 모든 상호작용을 관리합니다.
프로필, 프로젝트, 메시지 데이터의 영구 저장 및 조회를 담당합니다.
"""

import streamlit as st
from typing import Optional, Dict, List, Any
from datetime import datetime
from utils.config import Config


class SupabaseService:
    """
    Supabase 데이터베이스 서비스 클래스.
    
    Streamlit 앱에서 Supabase PostgreSQL DB에 접근하기 위한
    고수준 인터페이스를 제공합니다.
    """
    
    _client = None
    
    def __init__(self):
        """Supabase 클라이언트를 초기화합니다."""
        self._client = self._get_client()
    
    @staticmethod
    def _get_client():
        """
        Supabase 클라이언트 인스턴스를 가져오거나 생성합니다.
        session_state에 캐시하여 재사용합니다.
        """
        # session_state에 이미 클라이언트가 있으면 재사용
        if "supabase_client" in st.session_state:
            return st.session_state.supabase_client
        
        # Supabase URL과 Key 확인
        supabase_url = Config.get_supabase_url()
        supabase_key = Config.get_supabase_key()
        
        if not supabase_url or not supabase_key:
            st.warning("⚠️ Supabase 설정이 없습니다. 환경 변수 또는 Streamlit secrets에 SUPABASE_URL과 SUPABASE_KEY를 설정해주세요.")
            return None
        
        try:
            from supabase import create_client, Client
            client: Client = create_client(supabase_url, supabase_key)
            st.session_state.supabase_client = client
            return client
        except ImportError:
            st.error("❌ supabase 패키지가 설치되지 않았습니다. requirements.txt에 추가해주세요.")
            return None
        except Exception as e:
            st.error(f"❌ Supabase 클라이언트 생성 실패: {str(e)}")
            return None
    
    def is_available(self) -> bool:
        """Supabase 클라이언트가 사용 가능한지 확인합니다."""
        return self._client is not None
    
    # =============================================================================
    # 프로필 관리
    # =============================================================================
    
    def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        사용자 프로필을 조회합니다.
        
        Args:
            user_id: Supabase Auth의 사용자 UUID
            
        Returns:
            프로필 정보 딕셔너리 또는 None
        """
        if not self.is_available():
            return None
        
        try:
            response = self._client.table("profiles").select("*").eq("id", user_id).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            st.error(f"프로필 조회 실패: {str(e)}")
            return None
    
    def create_or_update_profile(self, user_id: str, email: str, role: str = "free") -> bool:
        """
        프로필을 생성하거나 업데이트합니다.
        
        Args:
            user_id: 사용자 UUID
            email: 사용자 이메일
            role: 사용자 역할 ('free' 또는 'pro')
            
        Returns:
            성공 여부
        """
        if not self.is_available():
            return False
        
        try:
            # 기존 프로필 확인
            existing = self.get_user_profile(user_id)
            
            profile_data = {
                "id": user_id,
                "email": email,
                "role": role,
                "updated_at": datetime.utcnow().isoformat() + "Z"
            }
            
            if existing:
                # 업데이트
                self._client.table("profiles").update(profile_data).eq("id", user_id).execute()
            else:
                # 생성
                self._client.table("profiles").insert(profile_data).execute()
            
            return True
        except Exception as e:
            st.error(f"프로필 생성/업데이트 실패: {str(e)}")
            return False
    
    # =============================================================================
    # 프로젝트 관리
    # =============================================================================
    
    def create_project(self, user_id: str, name: str, status: str = "active") -> Optional[str]:
        """
        새 프로젝트를 생성합니다.
        
        Args:
            user_id: 프로젝트를 생성할 사용자 UUID
            name: 프로젝트 이름
            status: 프로젝트 상태 ('active', 'completed', 'archived')
            
        Returns:
            생성된 프로젝트 ID (UUID) 또는 None
        """
        if not self.is_available():
            return None
        
        try:
            project_data = {
                "user_id": user_id,
                "name": name,
                "status": status
            }
            
            response = self._client.table("projects").insert(project_data).execute()
            
            if response.data and len(response.data) > 0:
                project_id = response.data[0]["id"]
                return project_id
            
            return None
        except Exception as e:
            st.error(f"프로젝트 생성 실패: {str(e)}")
            return None
    
    def get_user_projects(self, user_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        사용자의 모든 프로젝트 목록을 조회합니다.
        
        Args:
            user_id: 사용자 UUID
            status: 필터링할 프로젝트 상태 (None이면 모두 조회)
            
        Returns:
            프로젝트 목록
        """
        if not self.is_available():
            return []
        
        try:
            query = self._client.table("projects").select("*").eq("user_id", user_id)
            
            if status:
                query = query.eq("status", status)
            
            query = query.order("created_at", desc=True)
            response = query.execute()
            
            return response.data if response.data else []
        except Exception as e:
            st.error(f"프로젝트 목록 조회 실패: {str(e)}")
            return []
    
    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        """
        프로젝트 정보를 조회합니다.
        
        Args:
            project_id: 프로젝트 UUID
            
        Returns:
            프로젝트 정보 딕셔너리 또는 None
        """
        if not self.is_available():
            return None
        
        try:
            response = self._client.table("projects").select("*").eq("id", project_id).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            st.error(f"프로젝트 조회 실패: {str(e)}")
            return None
    
    def update_project(
        self,
        project_id: str,
        name: Optional[str] = None,
        status: Optional[str] = None,
        initial_risk_score: Optional[float] = None,
        total_landed_cost: Optional[float] = None
    ) -> bool:
        """
        프로젝트 정보를 업데이트합니다.
        
        Args:
            project_id: 프로젝트 UUID
            name: 프로젝트 이름 (선택)
            status: 프로젝트 상태 (선택)
            initial_risk_score: 초기 리스크 스코어 (선택)
            total_landed_cost: 총 도착 비용 (선택)
            
        Returns:
            성공 여부
        """
        if not self.is_available():
            return False
        
        try:
            update_data = {}
            
            if name is not None:
                update_data["name"] = name
            if status is not None:
                update_data["status"] = status
            if initial_risk_score is not None:
                update_data["initial_risk_score"] = initial_risk_score
            if total_landed_cost is not None:
                update_data["total_landed_cost"] = total_landed_cost
            
            if not update_data:
                return True  # 업데이트할 것이 없음
            
            update_data["updated_at"] = datetime.utcnow().isoformat() + "Z"
            
            self._client.table("projects").update(update_data).eq("id", project_id).execute()
            
            return True
        except Exception as e:
            st.error(f"프로젝트 업데이트 실패: {str(e)}")
            return False
    
    # =============================================================================
    # 메시지 관리
    # =============================================================================
    
    def save_message(self, project_id: str, role: str, content: str) -> Optional[str]:
        """
        메시지를 저장합니다.
        
        Args:
            project_id: 프로젝트 UUID
            role: 메시지 역할 ('user' 또는 'ai')
            content: 메시지 내용
            
        Returns:
            생성된 메시지 ID (UUID) 또는 None
        """
        if not self.is_available():
            return None
        
        try:
            message_data = {
                "project_id": project_id,
                "role": role,
                "content": content
            }
            
            response = self._client.table("messages").insert(message_data).execute()
            
            if response.data and len(response.data) > 0:
                message_id = response.data[0]["id"]
                return message_id
            
            return None
        except Exception as e:
            st.error(f"메시지 저장 실패: {str(e)}")
            return None
    
    def get_project_messages(self, project_id: str) -> List[Dict[str, Any]]:
        """
        프로젝트의 모든 메시지를 조회합니다.
        
        Args:
            project_id: 프로젝트 UUID
            
        Returns:
            메시지 목록 (시간순 정렬)
        """
        if not self.is_available():
            return []
        
        try:
            response = (
                self._client.table("messages")
                .select("*")
                .eq("project_id", project_id)
                .order("timestamp", desc=False)
                .execute()
            )
            
            return response.data if response.data else []
        except Exception as e:
            st.error(f"메시지 조회 실패: {str(e)}")
            return []
    
    def save_messages_batch(self, project_id: str, messages: List[Dict[str, str]]) -> bool:
        """
        여러 메시지를 한 번에 저장합니다.
        
        Args:
            project_id: 프로젝트 UUID
            messages: 메시지 리스트 [{"role": "user", "content": "..."}, ...]
            
        Returns:
            성공 여부
        """
        if not self.is_available() or not messages:
            return False
        
        try:
            message_data = [
                {
                    "project_id": project_id,
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", "")
                }
                for msg in messages
            ]
            
            self._client.table("messages").insert(message_data).execute()
            
            return True
        except Exception as e:
            st.error(f"배치 메시지 저장 실패: {str(e)}")
            return False


# =============================================================================
# 편의 함수
# =============================================================================

def get_supabase_service() -> Optional[SupabaseService]:
    """
    Supabase 서비스 인스턴스를 가져옵니다.
    session_state에 캐시하여 재사용합니다.
    """
    if "supabase_service" not in st.session_state:
        st.session_state.supabase_service = SupabaseService()
    
    service = st.session_state.supabase_service
    return service if service.is_available() else None

