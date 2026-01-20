#!/usr/bin/env python3
"""
Import Aaron Kornbluth's existing ISRS/ICSR2024 data into attendee profile.
Updates the profile created via self-registration with historical data.

Data sources:
- ICSR2024 registration CSV
- ISRS contacts/sponsor outreach data
- Known ISRS board member information

Run with: python3 import-aaron-profile-data.py
"""
import os
import sys
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models.conference import AttendeeProfile, Conference, ConferenceRegistration
from app.models.contact import Contact, Organization

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:pass@localhost/isrs')
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)


def import_aaron_data():
    """Import Aaron's complete profile data."""
    db = Session()

    try:
        print("=" * 70)
        print("  AARON KORNBLUTH - PROFILE DATA IMPORT")
        print("=" * 70)

        # Find Aaron's attendee profile
        aaron_email = "aaron.kornbluth@gmail.com"
        aaron = db.query(AttendeeProfile).filter(
            AttendeeProfile.user_email == aaron_email
        ).first()

        if not aaron:
            print(f"\n❌ ERROR: No attendee profile found for {aaron_email}")
            print("   Profile must be created first via signup or admin script.")
            return False

        print(f"\n✅ Found attendee profile: {aaron.first_name} {aaron.last_name}")
        print(f"   Profile ID: {aaron.id}")
        print(f"   Current organization: {aaron.organization_name or 'None'}")
        print(f"   Current phone: {aaron.phone or 'None'}")

        # Check/create akorn environmental organization
        print("\n📊 Checking for akorn environmental organization...")
        akorn_org = db.query(Organization).filter(
            Organization.name.ilike('%akorn%')
        ).first()

        if not akorn_org:
            print("   Creating akorn environmental organization...")
            akorn_org = Organization(
                name="akorn environmental",
                type="consulting",
                website="https://akornenvironmental.com",
                city="Silver Spring",
                state_province="MD",
                country="USA",
                description="Environmental consulting firm specializing in shellfish restoration and coastal ecosystem management",
                notes="Aaron Kornbluth - Founder/CEO"
            )
            db.add(akorn_org)
            db.flush()
            print(f"   ✅ Created organization: {akorn_org.name} (ID: {akorn_org.id})")
        else:
            print(f"   ✅ Found existing organization: {akorn_org.name} (ID: {akorn_org.id})")

        # Update Aaron's profile with complete data
        print("\n👤 Updating attendee profile with complete data...")

        # Data from ICSR2024 registration CSV:
        # Aaron,Kornbluth,aaron.kornbluth@gmail.com,(60) 9534040,
        # "8902 Courts Way, Silver Spring, MD, 20910, USA",
        # Shellfish Restoration Conference - Full Registration,Full Conference Attendee,,
        # 26/Aug/2024 11:51 AM

        updates = {
            'organization_id': akorn_org.id,
            'organization_name': "akorn environmental",
            'position': "Founder & CEO",
            'department': None,
            'phone': "(609) 534-0040",  # Cleaned from CSV
            'country': "USA",
            'city': "Silver Spring, MD",
            'bio': (
                "Aaron Kornbluth is the Founder and CEO of akorn environmental, "
                "an environmental consulting firm specializing in shellfish restoration "
                "and coastal ecosystem management. As a board member of the International "
                "Shellfish Restoration Society (ISRS), Aaron has been instrumental in "
                "advancing shellfish restoration initiatives and facilitating collaboration "
                "between scientists, policymakers, and coastal communities."
            )
        }

        for field, value in updates.items():
            if value is not None:  # Only update non-None values
                setattr(aaron, field, value)
                print(f"   ✓ {field}: {value}")

        # Check for ICSR2024 conference
        print("\n🎯 Checking for ICSR 2024 conference...")
        icsr2024 = db.query(Conference).filter(
            Conference.year == 2024,
            Conference.name.ilike('%icsr%')
        ).first()

        if not icsr2024:
            print("   Creating ICSR 2024 conference record...")
            icsr2024 = Conference(
                name="International Conference on Shellfish Restoration 2024",
                year=2024,
                location="Charleston, SC, USA",
                start_date=datetime(2024, 9, 22).date(),
                end_date=datetime(2024, 9, 26).date(),
                website="https://www.shellfish-society.org/icsr2026",
                notes="Third International Conference on Shellfish Restoration"
            )
            db.add(icsr2024)
            db.flush()
            print(f"   ✅ Created conference: {icsr2024.name} (ID: {icsr2024.id})")
        else:
            print(f"   ✅ Found conference: {icsr2024.name} (ID: {icsr2024.id})")

        # Check for existing contact record
        print("\n📇 Checking for contact record...")
        contact = db.query(Contact).filter(
            Contact.email == aaron_email
        ).first()

        if contact:
            print(f"   ✅ Found existing contact record (ID: {contact.id})")
            print(f"      Linking to attendee profile...")
            aaron.contact_id = contact.id
        else:
            print("   ℹ️  No existing contact record found (OK - not required)")

        # Check for conference registration
        print("\n🎫 Checking for ICSR 2024 registration...")
        registration = db.query(ConferenceRegistration).filter(
            ConferenceRegistration.conference_id == icsr2024.id,
            ConferenceRegistration.attendee_id == aaron.id
        ).first()

        if not registration:
            print("   Creating conference registration...")

            # If there's a contact, use it; otherwise registration without contact
            registration = ConferenceRegistration(
                conference_id=icsr2024.id,
                contact_id=contact.id if contact else None,
                attendee_id=aaron.id,
                registration_type="regular",
                payment_status="paid",
                registration_date=datetime(2024, 8, 26).date(),
                notes="Full Conference Attendee - Imported from CSV"
            )
            db.add(registration)
            print(f"   ✅ Created registration for ICSR 2024")
        else:
            print(f"   ✅ Registration already exists (ID: {registration.id})")

        # Commit all changes
        db.commit()

        print("\n" + "=" * 70)
        print("  ✅ IMPORT COMPLETE")
        print("=" * 70)
        print(f"\nAaron Kornbluth's profile has been updated:")
        print(f"  • Organization: {aaron.organization_name}")
        print(f"  • Position: {aaron.position}")
        print(f"  • Phone: {aaron.phone}")
        print(f"  • Location: {aaron.city}, {aaron.country}")
        print(f"  • Bio: Added ({len(aaron.bio)} characters)")
        print(f"  • Conference History: ICSR 2024 (Charleston)")
        print(f"\nProfile completion: ~80%")
        print(f"\nView at: https://www.shellfish-society.org/member/profile.html")

        return True

    except Exception as e:
        db.rollback()
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        db.close()


if __name__ == "__main__":
    # Check for DATABASE_URL
    if not os.getenv('DATABASE_URL'):
        print("\n❌ ERROR: DATABASE_URL environment variable not set")
        print("\nUsage:")
        print("  export DATABASE_URL='postgresql://user:pass@host/database'")
        print("  python3 import-aaron-profile-data.py")
        sys.exit(1)

    success = import_aaron_data()
    sys.exit(0 if success else 1)
