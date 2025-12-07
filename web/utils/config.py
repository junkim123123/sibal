"""
Configuration module for secure API key handling.
Uses environment variables and Streamlit secrets.
"""

import os
import functools
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file (override=True to refresh)
load_dotenv(override=True)


class Config:
    """
    Secure configuration management for NexSupply.
    Handles API keys and application settings.
    """
    
    # Gemini API Configuration
    GEMINI_TIMEOUT = 60
    
    _cached_gemini_key: Optional[str] = None
    
    @staticmethod
    @functools.lru_cache(maxsize=1)
    def _get_gemini_key_cached() -> Optional[str]:
        """
        Cached lookup for Gemini API key.
        Uses LRU cache to avoid repeated environment/secret lookups.
        """
        # Try environment variable first
        api_key = os.getenv("GEMINI_API_KEY")
        
        if api_key:
            return api_key
        
        # Try Streamlit secrets
        try:
            import streamlit as st
            if hasattr(st, 'secrets') and 'GEMINI_API_KEY' in st.secrets:
                return st.secrets['GEMINI_API_KEY']
        except Exception:
            pass
        
        return None
    
    @staticmethod
    def get_gemini_api_key() -> Optional[str]:
        """
        Get Gemini API key from environment or Streamlit secrets.
        Priority: Environment variable > Streamlit secrets
        Uses caching to avoid repeated lookups in the same session.
        """
        # Try module-level cache first
        if Config._cached_gemini_key is not None:
            return Config._cached_gemini_key
        
        # Try LRU cache
        cached = Config._get_gemini_key_cached()
        if cached:
            Config._cached_gemini_key = cached
            return cached
        
        return None
    
    @staticmethod
    def clear_gemini_key_cache() -> None:
        """Clear the Gemini API key cache (useful for testing or key rotation)."""
        Config._cached_gemini_key = None
        Config._get_gemini_key_cached.cache_clear()
    
    @staticmethod
    def get_database_url() -> Optional[str]:
        """Get database URL from environment or Streamlit secrets."""
        db_url = os.getenv("DATABASE_URL")
        
        if db_url:
            return db_url
        
        try:
            import streamlit as st
            if hasattr(st, 'secrets') and 'DATABASE_URL' in st.secrets:
                return st.secrets['DATABASE_URL']
        except Exception:
            pass
        
        return None
    
    @staticmethod
    def get_supabase_url() -> Optional[str]:
        """Get Supabase URL from environment or Streamlit secrets."""
        url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        
        if url:
            return url
        
        try:
            import streamlit as st
            if hasattr(st, 'secrets'):
                if 'SUPABASE_URL' in st.secrets:
                    return st.secrets['SUPABASE_URL']
                if 'NEXT_PUBLIC_SUPABASE_URL' in st.secrets:
                    return st.secrets['NEXT_PUBLIC_SUPABASE_URL']
        except Exception:
            pass
        
        return None
    
    @staticmethod
    def get_supabase_key() -> Optional[str]:
        """Get Supabase anon key from environment or Streamlit secrets."""
        key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        
        if key:
            return key
        
        try:
            import streamlit as st
            if hasattr(st, 'secrets'):
                if 'SUPABASE_KEY' in st.secrets:
                    return st.secrets['SUPABASE_KEY']
                if 'SUPABASE_ANON_KEY' in st.secrets:
                    return st.secrets['SUPABASE_ANON_KEY']
                if 'NEXT_PUBLIC_SUPABASE_ANON_KEY' in st.secrets:
                    return st.secrets['NEXT_PUBLIC_SUPABASE_ANON_KEY']
        except Exception:
            pass
        
        return None
    
    @staticmethod
    def get_consultation_email() -> str:
        """
        Get consultation team email from environment or Streamlit secrets.
        Defaults to public email if not configured.
        """
        # Try environment variable first
        email = os.getenv("CONSULTATION_EMAIL") or os.getenv("OUTREACH_EMAIL")
        
        if email:
            return email
        
        # Try Streamlit secrets
        try:
            import streamlit as st
            if hasattr(st, 'secrets'):
                if 'CONSULTATION_EMAIL' in st.secrets:
                    return st.secrets['CONSULTATION_EMAIL']
                if 'OUTREACH_EMAIL' in st.secrets:
                    return st.secrets['OUTREACH_EMAIL']
        except Exception:
            pass
        
        # Default public email (safe to expose)
        return "outreach@nexsupply.net"
    
    @staticmethod
    def get_lemon_squeezy_store_url() -> Optional[str]:
        """
        Get Lemon Squeezy store URL from environment or Streamlit secrets.
        
        Returns:
            Lemon Squeezy store URL or None
        """
        # Try environment variable first
        url = os.getenv("LEMON_SQUEEZY_STORE_URL")
        if url:
            return url
        
        # Try Streamlit secrets
        try:
            import streamlit as st
            if hasattr(st, 'secrets') and 'LEMON_SQUEEZY_STORE_URL' in st.secrets:
                return st.secrets['LEMON_SQUEEZY_STORE_URL']
        except Exception:
            pass
        
        return None
    
    @classmethod
    def validate_config(cls) -> dict:
        """
        Validate that required configuration is present.
        Returns a dict with validation status.
        """
        return {
            "gemini_api_key": cls.get_gemini_api_key() is not None,
            "database_url": cls.get_database_url() is not None,
        }


# Application Settings
class AppSettings:
    """Application-wide settings."""
    
    APP_NAME = "NexSupply"
    APP_DESCRIPTION = "B2B Sourcing Platform"
    VERSION = "0.1.0"
    
    # Design System Colors
    PRIMARY_COLOR = "#0EA5E9"  # Sky Blue
    BACKGROUND_COLOR = "#FFFFFF"  # Clean White
    
    # UI Settings
    PAGE_ICON = "🏭"
    LAYOUT = "wide"
    
    # =============================================================================
    # DEFAULT ANALYSIS ASSUMPTIONS
    # =============================================================================
    
    # Default order parameters
    DEFAULT_VOLUME_UNITS = 5000
    DEFAULT_TARGET_MARKET = "USA"
    DEFAULT_CHANNEL = "Amazon FBA"
    DEFAULT_INCOTERM = "DDP"
    DEFAULT_CURRENCY = "USD"
    DEFAULT_ROUTE = "cn_to_us_west_coast"
    DEFAULT_DESTINATION = "Los Angeles"
    
    # Route display mappings
    ROUTE_DISPLAY_MAP = {
        "cn_to_us_west_coast": "China → US West Coast",
        "cn_to_us_east_coast": "China → US East Coast",
        "cn_to_eu": "China → EU"
    }
    
    # Default incoterm display format
    @classmethod
    def get_incoterm_display(cls, incoterm: str = None, destination: str = None) -> str:
        """Get formatted incoterm display string."""
        incoterm = incoterm or cls.DEFAULT_INCOTERM
        destination = destination or cls.DEFAULT_DESTINATION
        return f"{incoterm} to {destination}"
    
    # Default route display
    @classmethod
    def get_route_display(cls, route: str = None) -> str:
        """Get formatted route display string."""
        route = route or cls.DEFAULT_ROUTE
        return cls.ROUTE_DISPLAY_MAP.get(route, route.replace("_", " ").title())

