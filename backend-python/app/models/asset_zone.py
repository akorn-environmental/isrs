"""
Asset Zone model for linking assets to specific page locations.
Enables admin-manageable image zones throughout the site.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class AssetZone(Base, TimestampMixin):
    """
    Asset Zone model for managing page-specific asset locations.
    Each zone represents a configurable image/media area on a page.
    """

    __tablename__ = "asset_zones"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String(100), nullable=False, index=True, comment="Unique identifier for the zone (e.g., 'home-hero')")
    page_path = Column(String(255), nullable=False, index=True, comment="URL path where zone appears (e.g., '/' or '/about')")
    zone_name = Column(String(255), comment="Human-readable name for the zone")
    display_mode = Column(String(50), default="single", comment="Display mode: single, slideshow, grid, lightbox")
    max_assets = Column(Integer, default=1, comment="Maximum number of assets allowed in this zone")
    configuration = Column(JSON, default={}, comment="Zone-specific config (transition, speed, objectFit, etc.)")
    is_active = Column(Boolean, default=True, comment="Whether the zone is active")

    # Relationships (timestamps provided by TimestampMixin)
    assets = relationship("AssetZoneAsset", back_populates="zone", cascade="all, delete-orphan", order_by="AssetZoneAsset.sort_order")

    def __repr__(self):
        return f"<AssetZone(id={self.id}, zone_id='{self.zone_id}', page_path='{self.page_path}')>"


class AssetZoneAsset(Base, TimestampMixin):
    """
    Junction table linking assets to zones with ordering.
    Allows multiple assets per zone (for slideshows/galleries).
    """

    __tablename__ = "asset_zone_assets"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("asset_zones.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    sort_order = Column(Integer, default=0, comment="Order of asset within the zone")
    alt_text = Column(String(500), comment="Alternative text for accessibility")
    caption = Column(Text, comment="Optional caption for the asset")
    link_url = Column(String(1024), comment="Optional link when asset is clicked")
    is_active = Column(Boolean, default=True, comment="Whether this asset is active in the zone")

    # Relationships (timestamps provided by TimestampMixin)
    zone = relationship("AssetZone", back_populates="assets")
    asset = relationship("Asset")

    def __repr__(self):
        return f"<AssetZoneAsset(zone_id={self.zone_id}, asset_id={self.asset_id}, order={self.sort_order})>"
