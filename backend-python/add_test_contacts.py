#!/usr/bin/env python3
"""
Directly add test contacts and organizations to database
Bypasses email parsing to test the models directly
"""
import os
import sys

# Set required env vars to avoid validation errors
os.environ['AWS_ACCESS_KEY_ID'] = 'test'
os.environ['AWS_SECRET_ACCESS_KEY'] = 'test'

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models.contact import Contact, Organization
from nameparser import HumanName


def add_test_data():
    """Add the 9 contacts and their organizations from the example email"""

    db = SessionLocal()

    try:
        print("=" * 80)
        print("ADDING TEST CONTACTS AND ORGANIZATIONS")
        print("=" * 80)
        print()

        # Define organizations
        orgs_data = [
            {"name": "TBD Economics, LLC", "type": "Private"},
            {"name": "NRDC", "type": "NGO"},
            {"name": "Sustainable Seas Technology", "type": "Private"},
            {"name": "Endangered Habitats League", "type": "NGO"},
            {"name": "Ocean Defenders", "type": "NGO"},
        ]

        # Define contacts with their organizations
        contacts_data = [
            {
                "name": "Tracy Rouleau",
                "email": "tracy@tbdeconomics.com",
                "organization": "TBD Economics, LLC",
                "role": "Founder"
            },
            {
                "name": "Francine Kershaw",
                "email": "fkershaw@nrdc.org",
                "organization": "NRDC",
                "role": None
            },
            {
                "name": "Kim Kirchberg-Sawicki",
                "email": "admin@sustainableseastechnology.org",
                "organization": "Sustainable Seas Technology",
                "role": "President"
            },
            {
                "name": "Dan Silver",
                "email": "dsilverla@me.com",
                "organization": "Endangered Habitats League",
                "role": "Executive Director"
            },
            {
                "name": "Michael Beck",
                "email": "beckehl@icloud.com",
                "organization": None,
                "role": None
            },
            {
                "name": "Kurt Lieber",
                "email": "kurt@oceandefenders.org",
                "organization": "Ocean Defenders",
                "role": None
            },
            {
                "name": "Aaron Kornbluth",
                "email": "aaron.kornbluth@gmail.com",
                "organization": None,
                "role": None
            },
            {
                "name": "Brooke Wibberley",
                "email": "brooke@tbdeconomics.com",
                "organization": "TBD Economics, LLC",
                "role": None
            },
            {
                "name": "Cathy Chadwick",
                "email": "chadgroup@outlook.com",
                "organization": None,
                "role": None
            }
        ]

        # Create organizations
        org_map = {}
        orgs_created = 0

        print("📁 Creating Organizations...")
        print()

        for org_data in orgs_data:
            # Check if exists
            existing = db.query(Organization).filter(
                Organization.name == org_data["name"]
            ).first()

            if existing:
                print(f"   ⏭️  {org_data['name']} (already exists)")
                org_map[org_data["name"]] = existing
            else:
                new_org = Organization(
                    name=org_data["name"],
                    type=org_data["type"],
                    notes="Added from test email example"
                )
                db.add(new_org)
                db.commit()
                db.refresh(new_org)
                org_map[org_data["name"]] = new_org
                orgs_created += 1
                print(f"   ✅ {org_data['name']} (ID: {new_org.id})")

        print()
        print(f"✅ Organizations: {orgs_created} created, {len(orgs_data) - orgs_created} already existed")
        print()

        # Create contacts
        contacts_created = 0
        contacts_updated = 0

        print("👥 Creating Contacts...")
        print()

        for contact_data in contacts_data:
            email = contact_data["email"].lower().strip()

            # Check if exists
            existing = db.query(Contact).filter(Contact.email == email).first()

            if existing:
                print(f"   ⏭️  {contact_data['name']} ({email}) - already exists")
                contacts_updated += 1
                continue

            # Parse name
            parsed_name = HumanName(contact_data["name"])

            # Get organization ID
            org_id = None
            if contact_data["organization"]:
                org = org_map.get(contact_data["organization"])
                if org:
                    org_id = org.id

            # Create contact
            new_contact = Contact(
                email=email,
                full_name=contact_data["name"],
                first_name=parsed_name.first,
                last_name=parsed_name.last,
                organization_id=org_id,
                role=contact_data["role"],
                title=contact_data["role"],
                notes="Added from test email example"
            )

            db.add(new_contact)
            db.commit()
            db.refresh(new_contact)

            org_name = f" @ {contact_data['organization']}" if contact_data['organization'] else ""
            role_name = f" ({contact_data['role']})" if contact_data['role'] else ""

            print(f"   ✅ {contact_data['name']}{org_name}{role_name}")
            print(f"      Email: {email}")
            print(f"      ID: {new_contact.id}")
            print()

            contacts_created += 1

        print("=" * 80)
        print("SUMMARY")
        print("=" * 80)
        print(f"✅ Organizations: {orgs_created} created")
        print(f"✅ Contacts:      {contacts_created} created, {contacts_updated} already existed")
        print()

        # Display final counts
        total_orgs = db.query(Organization).count()
        total_contacts = db.query(Contact).count()

        print(f"📊 Total in Database:")
        print(f"   Organizations: {total_orgs}")
        print(f"   Contacts:      {total_contacts}")
        print()

        print("=" * 80)
        print("✅ TEST DATA ADDED SUCCESSFULLY!")
        print("=" * 80)

    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    add_test_data()
