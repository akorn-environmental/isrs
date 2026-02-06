#!/usr/bin/env python3
"""
Test script to simulate email parsing and contact enrichment
with the example 9-person email thread
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import asyncio
from datetime import datetime
from app.database import SessionLocal
from app.models.parsed_email import ParsedEmail
from app.models.contact import Contact, Organization
from app.services.contact_enrichment_service import ContactEnrichmentService


async def test_contact_enrichment():
    """Test with the example email data"""

    # Create database session
    db = SessionLocal()

    try:
        print("=" * 80)
        print("CONTACT ENRICHMENT SERVICE TEST")
        print("=" * 80)
        print()

        # Simulate the AI-extracted data from your example email
        extracted_data = {
            "email_type": "general",
            "overall_confidence": 85,
            "contacts": [
                {
                    "name": "Tracy Rouleau",
                    "email": "tracy@tbdeconomics.com",
                    "organization": "TBD Economics, LLC",
                    "role": "Founder",
                    "confidence": 92
                },
                {
                    "name": "Francine Kershaw",
                    "email": "fkershaw@nrdc.org",
                    "organization": "NRDC",
                    "role": None,
                    "confidence": 88
                },
                {
                    "name": "Kim Kirchberg-Sawicki",
                    "email": "admin@sustainableseastechnology.org",
                    "organization": "Sustainable Seas Technology",
                    "role": "President",
                    "confidence": 90
                },
                {
                    "name": "Dan Silver",
                    "email": "dsilverla@me.com",
                    "organization": "Endangered Habitats League",
                    "role": "Executive Director",
                    "confidence": 95
                },
                {
                    "name": "Michael Beck",
                    "email": "beckehl@icloud.com",
                    "organization": None,
                    "role": None,
                    "confidence": 75
                },
                {
                    "name": "Kurt Lieber",
                    "email": "kurt@oceandefenders.org",
                    "organization": "Ocean Defenders",
                    "role": None,
                    "confidence": 82
                },
                {
                    "name": "Aaron Kornbluth",
                    "email": "aaron.kornbluth@gmail.com",
                    "organization": None,
                    "role": None,
                    "confidence": 90
                },
                {
                    "name": "Brooke Wibberley",
                    "email": "brooke@tbdeconomics.com",
                    "organization": "TBD Economics, LLC",
                    "role": None,
                    "confidence": 85
                },
                {
                    "name": "Cathy Chadwick",
                    "email": "chadgroup@outlook.com",
                    "organization": None,
                    "role": None,
                    "confidence": 78
                }
            ]
        }

        # Create a mock ParsedEmail record
        parsed_email = ParsedEmail(
            message_id="test-message-2026-02-06",
            s3_key="test/example-email.eml",
            from_email="tracy@tbdeconomics.com",
            to_emails=["cathy@chadgroup.com", "dan@ehleague.org"],
            cc_emails=[
                "fkershaw@nrdc.org",
                "admin@sustainableseastechnology.org",
                "beckehl@icloud.com",
                "kurt@oceandefenders.org",
                "aaron.kornbluth@gmail.com",
                "brooke@tbdeconomics.com"
            ],
            subject="Re: Final Draft for Friday's check-in",
            date=datetime.now(),
            body_text="Test email body...",
            extracted_contacts=extracted_data["contacts"],
            overall_confidence=85,
            status="processed",
            requires_review=False
        )

        db.add(parsed_email)
        db.commit()
        db.refresh(parsed_email)

        print(f"✅ Created test ParsedEmail record (ID: {parsed_email.id})")
        print()

        # Run contact enrichment
        print("🚀 Running Contact Enrichment Service...")
        print()

        service = ContactEnrichmentService(confidence_threshold=60.0)

        result = await service.process_email_contacts(
            parsed_email=parsed_email,
            extracted_data=extracted_data,
            db=db
        )

        print()
        print("=" * 80)
        print("ENRICHMENT RESULTS")
        print("=" * 80)
        print(f"✅ Contacts Created:      {result['contacts_created']}")
        print(f"✅ Contacts Updated:      {result['contacts_updated']}")
        print(f"⏭️  Contacts Skipped:      {result['contacts_skipped']}")
        print(f"✅ Organizations Created: {result['organizations_created']}")
        print(f"🔗 Organizations Matched: {result['organizations_matched']}")
        print()

        if result.get('primary_contact'):
            pc = result['primary_contact']
            print("🎯 PRIMARY CONTACT DETECTED:")
            print(f"   Email:      {pc['email']}")
            print(f"   Contact ID: {pc['contact_id']}")
            print(f"   Score:      {pc['score']} points")
            print(f"   Confidence: {pc['confidence']}%")
            print(f"   Reason:     {pc['detection_reason']}")
        else:
            print("⚠️  No primary contact detected (threshold not met)")

        print()

        if result.get('errors'):
            print("❌ ERRORS:")
            for error in result['errors']:
                print(f"   - {error}")
            print()

        # Query and display created contacts
        print("=" * 80)
        print("CREATED CONTACTS")
        print("=" * 80)

        contacts = db.query(Contact).order_by(Contact.created_at.desc()).limit(10).all()

        for contact in contacts:
            org_name = ""
            if contact.organization_id:
                org = db.query(Organization).filter(Organization.id == contact.organization_id).first()
                org_name = f" @ {org.name}" if org else ""

            print(f"📧 {contact.email}")
            print(f"   Name: {contact.full_name or '(no name)'}{org_name}")
            print(f"   Role: {contact.role or contact.title or '(no role)'}")
            print(f"   ID:   {contact.id}")
            print()

        # Query and display created organizations
        print("=" * 80)
        print("CREATED ORGANIZATIONS")
        print("=" * 80)

        orgs = db.query(Organization).order_by(Organization.created_at.desc()).limit(10).all()

        for org in orgs:
            contact_count = db.query(Contact).filter(Contact.organization_id == org.id).count()
            print(f"🏢 {org.name}")
            print(f"   Type:     {org.type or '(not specified)'}")
            print(f"   Contacts: {contact_count}")
            print(f"   ID:       {org.id}")
            print()

        print("=" * 80)
        print("✅ TEST COMPLETED SUCCESSFULLY!")
        print("=" * 80)

    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(test_contact_enrichment())
