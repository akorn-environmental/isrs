"""Seed default review criteria for ICSR2026

This script adds the 5 standard review criteria with appropriate weights
for the ICSR2026 conference abstract review process.

Run this AFTER running the main migration: add_abstract_review_and_events.py
"""

import sys
import os
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import get_db
from app.models.conference import Conference
from app.models.abstract_review import ReviewCriteria
from sqlalchemy.orm import Session
from decimal import Decimal


def seed_review_criteria():
    """Add default review criteria for ICSR2026."""

    db = next(get_db())

    try:
        # Find ICSR2026 conference
        icsr2026 = db.query(Conference).filter(
            Conference.name.ilike('%ICSR%2026%')
        ).first()

        if not icsr2026:
            print("❌ ICSR2026 conference not found in database")
            print("   Please create the conference first")
            return False

        print(f"✅ Found conference: {icsr2026.name} (ID: {icsr2026.id})")

        # Check if criteria already exist
        existing = db.query(ReviewCriteria).filter_by(
            conference_id=icsr2026.id
        ).first()

        if existing:
            print("⚠️  Review criteria already exist for ICSR2026")
            print("   Skipping seed")
            return True

        # Create 5 default review criteria with weights matching legacy system
        criteria = [
            {
                'name': 'Relevance',
                'description': 'How relevant is this work to shellfish restoration and the conference theme?',
                'weight': Decimal('1.2'),  # Higher weight - most important
                'display_order': 1
            },
            {
                'name': 'Originality',
                'description': 'Does this work present novel findings, methods, or perspectives?',
                'weight': Decimal('1.0'),
                'display_order': 2
            },
            {
                'name': 'Methodology',
                'description': 'Are the methods sound and appropriate for the research questions?',
                'weight': Decimal('1.0'),
                'display_order': 3
            },
            {
                'name': 'Clarity',
                'description': 'Is the abstract well-written, clear, and easy to understand?',
                'weight': Decimal('0.8'),  # Lower weight - less critical than content
                'display_order': 4
            },
            {
                'name': 'Impact',
                'description': 'What is the potential impact or significance of this work for the field?',
                'weight': Decimal('1.0'),
                'display_order': 5
            }
        ]

        # Insert criteria
        for criterion_data in criteria:
            criterion = ReviewCriteria(
                conference_id=icsr2026.id,
                **criterion_data
            )
            db.add(criterion)

        db.commit()

        print(f"\n✅ Successfully added {len(criteria)} review criteria for ICSR2026:")
        for criterion_data in criteria:
            print(f"   • {criterion_data['name']} (weight: {criterion_data['weight']})")

        print("\n📊 Weighted Score Calculation:")
        print("   weighted_score = (")
        print("       relevance_score * 1.2 +")
        print("       originality_score * 1.0 +")
        print("       methodology_score * 1.0 +")
        print("       clarity_score * 0.8 +")
        print("       impact_score * 1.0")
        print("   ) / 5.0")
        print("\n   Range: 1.0 (all 1s) to 5.0 (all 5s)")

        return True

    except Exception as e:
        print(f"❌ Error seeding review criteria: {e}")
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Seeding ICSR2026 Review Criteria...")
    print("=" * 50)

    success = seed_review_criteria()

    if success:
        print("\n" + "=" * 50)
        print("✅ Seed completed successfully!")
        sys.exit(0)
    else:
        print("\n" + "=" * 50)
        print("❌ Seed failed")
        sys.exit(1)
