"""
Session state management for NexSupply.
Handles initialization and management of Streamlit session state.
"""

import streamlit as st
from typing import Any, Optional, Dict
from dataclasses import dataclass, field


# =============================================================================
# SOURCING STATE CLASS
# =============================================================================

@dataclass
class SourcingState:
    """
    Centralized state container for B2B sourcing operations.
    Provides a clean interface for accessing user input and analysis results.
    """
    
    # Input state
    query: str = ""
    file_bytes: Optional[bytes] = None
    file_name: Optional[str] = None
    file_mime_type: Optional[str] = None
    
    # Analysis state
    analysis_result: Optional[Dict] = None
    is_analyzing: bool = False
    error_message: Optional[str] = None
    
    @classmethod
    def from_session(cls) -> "SourcingState":
        """
        Create SourcingState from current Streamlit session state.
        Safely extracts all relevant values.
        """
        state = cls()
        
        # Get query
        state.query = st.session_state.get("search_query", "")
        
        # Get uploaded file
        uploaded_file = st.session_state.get("uploaded_file")
        if uploaded_file is not None:
            try:
                # Read file bytes (handle already-read files)
                uploaded_file.seek(0)  # Reset file pointer
                state.file_bytes = uploaded_file.read()
                state.file_name = uploaded_file.name
                state.file_mime_type = uploaded_file.type
                uploaded_file.seek(0)  # Reset for potential re-read
            except Exception:
                # File might already be consumed or invalid
                state.file_bytes = None
        
        # Get analysis state
        state.analysis_result = st.session_state.get("analysis_data")
        state.is_analyzing = st.session_state.get("is_analyzing", False)
        state.error_message = st.session_state.get("analysis_error")
        
        return state
    
    def get_input(self) -> Dict[str, Any]:
        """
        Get user input as a dictionary for GeminiService.
        This is the primary interface between UI and AI service.
        
        Returns:
            Dictionary with keys:
            - query: str (text query)
            - context_query: str (context/requirements text)
            - file_bytes: Optional[bytes] (image/document data)
            - file_mime_type: Optional[str] (MIME type of file)
            - file_name: Optional[str] (original filename)
        """
        context_query = st.session_state.get("context_query", "")
        return {
            "query": self.query,
            "context_query": context_query,
            "file_bytes": self.file_bytes,
            "file_mime_type": self.file_mime_type,
            "file_name": self.file_name
        }
    
    def has_query(self) -> bool:
        """Check if there's a valid text query."""
        return bool(self.query and self.query.strip())
    
    def has_file(self) -> bool:
        """Check if there's an uploaded file."""
        return self.file_bytes is not None
    
    def has_input(self) -> bool:
        """Check if there's any input (query or file)."""
        return self.has_query() or self.has_file()
    
    def save_result(self, result: Dict) -> None:
        """Save analysis result to session state."""
        st.session_state.analysis_data = result
        self.analysis_result = result
    
    def set_result(self, result: Dict) -> None:
        """
        Set analysis result and navigate to results page.
        Alias for save_result with page navigation.
        Sets both 'view' and 'page' for compatibility.
        """
        self.save_result(result)
        # Set both view and page for navigation compatibility
        st.session_state.view = "result"
        st.session_state.page = "results"
        st.session_state.is_analyzing = False
    
    def save_error(self, error: str) -> None:
        """Save error message to session state."""
        st.session_state.analysis_error = error
        self.error_message = error
    
    def set_error(self, error: str) -> None:
        """
        Set error message for display.
        Alias for save_error.
        """
        self.save_error(error)
        st.session_state.is_analyzing = False
    
    def get_error(self) -> Optional[str]:
        """Get the current error message if any."""
        return st.session_state.get("analysis_error")
    
    def clear_error(self) -> None:
        """Clear the error message."""
        st.session_state.analysis_error = None
        self.error_message = None
    
    def get_result(self) -> Optional[Dict]:
        """
        Get the analysis result from session state.
        Returns None if no result is available.
        
        Returns:
            The analysis result dictionary or None
        """
        result = st.session_state.get("analysis_data")
        if result and isinstance(result, dict) and len(result) > 0:
            return result
        return None
    
    def has_result(self) -> bool:
        """Check if there's a valid analysis result."""
        return self.get_result() is not None
    
    def clear(self) -> None:
        """Clear all sourcing state."""
        st.session_state.search_query = ""
        st.session_state.uploaded_file = None
        st.session_state.analysis_data = None
        st.session_state.analysis_error = None
        st.session_state.is_analyzing = False
    
    def reset(self) -> None:
        """
        Reset sourcing state and return to search page.
        Alias for clear() with view reset.
        Resets both 'view' and 'page' for compatibility.
        """
        self.clear()
        # Reset both view and page for navigation compatibility
        st.session_state.view = "landing"
        st.session_state.page = "home"


def get_sourcing_state() -> SourcingState:
    """
    Factory function to get current SourcingState.
    Use this in pages/components to access user input.
    """
    return SourcingState.from_session()


# =============================================================================
# SESSION STATE INITIALIZATION
# =============================================================================

def init_session_state() -> None:
    """
    Initialize all session state variables for the application.
    Call this at the start of the app to ensure all states are initialized.
    """
    
    # User state
    if "user" not in st.session_state:
        st.session_state.user = None
    
    if "is_authenticated" not in st.session_state:
        st.session_state.is_authenticated = False
    
    # Search state
    if "search_query" not in st.session_state:
        st.session_state.search_query = ""
    
    # Main query for text area
    if "main_query" not in st.session_state:
        st.session_state.main_query = ""
    
    if "search_results" not in st.session_state:
        st.session_state.search_results = []
    
    # File upload state
    if "uploaded_file" not in st.session_state:
        st.session_state.uploaded_file = None
    
    # Analysis data state
    if "analysis_data" not in st.session_state:
        st.session_state.analysis_data = {}
    
    if "analysis_error" not in st.session_state:
        st.session_state.analysis_error = None
    
    if "is_analyzing" not in st.session_state:
        st.session_state.is_analyzing = False
    
    if "search_filters" not in st.session_state:
        st.session_state.search_filters = {}
    
    # Supplier state
    if "selected_supplier" not in st.session_state:
        st.session_state.selected_supplier = None
    
    if "saved_suppliers" not in st.session_state:
        st.session_state.saved_suppliers = []
    
    # Chat/AI state
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []
    
    if "ai_context" not in st.session_state:
        st.session_state.ai_context = {}
    
    # UI state
    if "current_page" not in st.session_state:
        st.session_state.current_page = "home"
    
    if "sidebar_expanded" not in st.session_state:
        st.session_state.sidebar_expanded = True
    
    # Notification state
    if "notifications" not in st.session_state:
        st.session_state.notifications = []
    
    # Supabase/Project state
    if "current_project_id" not in st.session_state:
        st.session_state.current_project_id = None
    
    if "user_profile" not in st.session_state:
        st.session_state.user_profile = None
    
    if "user_projects" not in st.session_state:
        st.session_state.user_projects = []


def get_state(key: str, default: Any = None) -> Any:
    """
    Safely get a session state value.
    
    Args:
        key: The session state key
        default: Default value if key doesn't exist
    
    Returns:
        The session state value or default
    """
    return st.session_state.get(key, default)


def set_state(key: str, value: Any) -> None:
    """
    Set a session state value.
    
    Args:
        key: The session state key
        value: The value to set
    """
    st.session_state[key] = value


def clear_state(key: str) -> None:
    """
    Clear a specific session state key.
    
    Args:
        key: The session state key to clear
    """
    if key in st.session_state:
        del st.session_state[key]


def reset_session_state() -> None:
    """Reset all session state to initial values."""
    for key in list(st.session_state.keys()):
        del st.session_state[key]
    init_session_state()


def add_notification(message: str, type: str = "info") -> None:
    """
    Add a notification to the session state.
    
    Args:
        message: The notification message
        type: Type of notification (info, success, warning, error)
    """
    if "notifications" not in st.session_state:
        st.session_state.notifications = []
    
    st.session_state.notifications.append({
        "message": message,
        "type": type
    })


def clear_notifications() -> None:
    """Clear all notifications."""
    st.session_state.notifications = []

