"""
Data conversion utilities for API response transformation.
Converts GeminiService response format to UI-friendly format.
"""


def convert_api_response(data: dict) -> dict:
    """Convert GeminiService response to UI format.
    
    Args:
        data: Raw API response from GeminiService
        
    Returns:
        Dict with formatted data for UI display
    """
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

