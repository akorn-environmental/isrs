#!/usr/bin/env python3
"""
Import ICSR2026 Status Report Data (Feb 2, 2026)
- Planning Committee Members
- Program Team Members
- Sponsorships
"""
import sys
import os
import asyncio
from datetime import datetime
from uuid import uuid4

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import text
from app.database import SessionLocal

# Planning Committee Members from Status Report
PLANNING_COMMITTEE = [
    {
        "first_name": "Betsy",
        "last_name": "Peabody",
        "email": "betsy@restorationfund.org",
        "organization": "Puget Sound Restoration Fund",
        "title": "Chair, ICSR 2026",
        "role": "Planning Committee Chair"
    },
    {
        "first_name": "Aaron",
        "last_name": "Kornbluth",
        "email": "aaron.kornbluth@gmail.com",
        "organization": "ISRS",
        "title": "ISRS Staff",
        "role": "Planning Committee Member"
    },
    {
        "first_name": "Lisa",
        "last_name": "Paton",
        "email": "lisa.paton@gmail.com",
        "organization": "ISRS",
        "title": "ISRS Staff",
        "role": "Planning Committee Member"
    },
    {
        "first_name": "Bill",
        "last_name": "Taylor",
        "email": "bill@taylorshellfish.com",
        "organization": "Taylor Shellfish",
        "title": "Owner",
        "role": "Planning Committee Member"
    },
    {
        "first_name": "Viviane",
        "last_name": "Barry",
        "email": "viviane@suquamish.nsn.us",
        "organization": "Suquamish Tribe",
        "title": "Restoration Coordinator",
        "role": "Planning Committee Member"
    },
    {
        "first_name": "Ryan",
        "last_name": "Crim",
        "email": "ryan@restorationfund.org",
        "organization": "Puget Sound Restoration Fund",
        "title": "Restoration Scientist",
        "role": "Planning Committee Member"
    },
    {
        "first_name": "Elsa",
        "last_name": "Schwartz",
        "email": "elsa@restorationfund.org",
        "organization": "Puget Sound Restoration Fund",
        "title": "Staff (formerly RAE)",
        "role": "Planning Committee Member"
    },
    {
        "first_name": "Julieta",
        "last_name": "Martinelli",
        "email": "julieta.martinelli@dfw.wa.gov",
        "organization": "Washington Department of Fish & Wildlife",
        "title": "Research Scientist",
        "role": "Planning Committee Member"
    },
    {
        "first_name": "Phoebe",
        "last_name": "Racine",
        "email": "pracine@tnc.org",
        "organization": "The Nature Conservancy - California",
        "title": "Marine Scientist",
        "role": "Planning Committee Member"
    },
    {
        "first_name": "Kerstin",
        "last_name": "Wasson",
        "email": "kerstin.wasson@noaa.gov",
        "organization": "Elkhorn Slough National Research Reserve",
        "title": "Lead, NOOC",
        "role": "Planning Committee Member"
    }
]

# Program Team Members from Status Report
PROGRAM_TEAM = [
    {
        "first_name": "Julieta",
        "last_name": "Martinelli",
        "email": "julieta.martinelli@dfw.wa.gov",
        "organization": "Washington Department of Fish & Wildlife",
        "title": "Chair, ICSR Program Team",
        "role": "Program Team Chair"
    },
    {
        "first_name": "Michael",
        "last_name": "Doall",
        "email": "michael.doall@sunnybrook.edu",
        "organization": "Sunnybrook University",
        "title": "Professor",
        "role": "Program Team Member"
    },
    {
        "first_name": "Jeff",
        "last_name": "Hetrick",
        "email": "jeff@alutiiqpride.com",
        "organization": "Alutiiq Pride Marine Center",
        "title": "Director",
        "role": "Program Team Member"
    },
    {
        "first_name": "Philine",
        "last_name": "zu Ermgassen",
        "email": "philine@nativeoysterrestoration.org",
        "organization": "NORA",
        "title": "Research Coordinator",
        "role": "Program Team Member"
    },
    {
        "first_name": "Ryan",
        "last_name": "Crim",
        "email": "ryan@restorationfund.org",
        "organization": "Puget Sound Restoration Fund",
        "title": "Restoration Scientist",
        "role": "Program Team Member"
    },
    {
        "first_name": "Betsy",
        "last_name": "Peabody",
        "email": "betsy@restorationfund.org",
        "organization": "Puget Sound Restoration Fund",
        "title": "Executive Director",
        "role": "Program Team Member"
    }
]

# Sponsorships from Status Report
SPONSORSHIPS = [
    {
        "organization": "The Nature Conservancy - California",
        "amount": 5000.00,
        "level": "Sustaining Sponsor",
        "status": "received",
        "contact_name": "Phoebe Racine"
    },
    {
        "organization": "The Nature Conservancy - Washington",
        "amount": 2000.00,
        "level": "Supporting Sponsor",
        "status": "committed",
        "contact_name": None
    },
    {
        "organization": "TNC Business Units",
        "amount": None,
        "level": "Pending",
        "status": "invited",
        "contact_name": "Boze Hancock"
    },
    {
        "organization": "Suquamish Tribe",
        "amount": None,
        "level": "Pending",
        "status": "invited",
        "contact_name": "Viviane Barry"
    },
    {
        "organization": "Taylor Shellfish",
        "amount": None,
        "level": "Pending",
        "status": "invited",
        "contact_name": "Bill Taylor"
    },
    {
        "organization": "Alutiiq Pride Marine Center",
        "amount": None,
        "level": "Pending",
        "status": "invited",
        "contact_name": "Jeff Hetrick"
    },
    {
        "organization": "Washington Sea Grant",
        "amount": None,
        "level": "Pending",
        "status": "invited",
        "contact_name": None
    },
    {
        "organization": "Washington Department of Fish & Wildlife",
        "amount": None,
        "level": "Pending",
        "status": "invited",
        "contact_name": "Julieta Martinelli"
    },
    {
        "organization": "Elkhorn Slough Foundation",
        "amount": None,
        "level": "Pending",
        "status": "invited",
        "contact_name": "Kerstin Wasson"
    },
    {
        "organization": "PCSGA",
        "amount": None,
        "level": "In-Kind (Raw Bar)",
        "status": "invited",
        "contact_name": None
    },
    {
        "organization": "NOAA/NWFSC",
        "amount": None,
        "level": "Pending",
        "status": "invited",
        "contact_name": None
    }
]


async def import_contacts_and_organizations(db):
    """Import planning committee and program team as contacts"""

    print("=" * 80)
    print("IMPORTING PLANNING COMMITTEE & PROGRAM TEAM")
    print("=" * 80)

    # Combine all unique people
    all_people = {}

    # Add planning committee
    for person in PLANNING_COMMITTEE:
        email = person['email']
        if email not in all_people:
            all_people[email] = person.copy()
            all_people[email]['tags'] = ['ICSR2026', 'Planning Committee']
        else:
            all_people[email]['tags'].append('Planning Committee')

    # Add program team
    for person in PROGRAM_TEAM:
        email = person['email']
        if email not in all_people:
            all_people[email] = person.copy()
            all_people[email]['tags'] = ['ICSR2026', 'Program Team']
        else:
            all_people[email]['tags'].append('Program Team')

    # First, create organizations
    organizations = {}
    for person in all_people.values():
        org_name = person['organization']
        if org_name and org_name not in organizations:
            # Check if org already exists
            result = db.execute(
                text("SELECT id FROM organizations WHERE name = :name"),
                {"name": org_name}
            )
            existing = result.fetchone()

            if existing:
                organizations[org_name] = existing[0]
                print(f"  ✓ Organization exists: {org_name}")
            else:
                org_id = str(uuid4())
                db.execute(
                    text("""
                        INSERT INTO organizations (id, name, created_at, updated_at)
                        VALUES (:id, :name, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    """),
                    {"id": org_id, "name": org_name}
                )
                organizations[org_name] = org_id
                print(f"  ✓ Created organization: {org_name}")

    db.commit()

    # Now create/update contacts
    contacts_created = 0
    contacts_updated = 0

    for email, person in all_people.items():
        # Check if contact already exists
        result = db.execute(
            text("SELECT id FROM contacts WHERE email = :email"),
            {"email": email}
        )
        existing = result.fetchone()

        org_id = organizations.get(person['organization'])
        # Format tags as PostgreSQL array literal
        tags_array = '{' + ','.join(f'"{tag}"' for tag in person['tags']) + '}'

        if existing:
            # Update existing contact with new tags
            db.execute(
                text("""
                    UPDATE contacts
                    SET organization_id = :org_id,
                        title = :title,
                        tags = CAST(:tags AS text[]),
                        updated_at = CURRENT_TIMESTAMP
                    WHERE email = :email
                """),
                {
                    "org_id": org_id,
                    "title": person.get('title'),
                    "tags": tags_array,
                    "email": email
                }
            )
            contacts_updated += 1
            print(f"  ✓ Updated: {person['first_name']} {person['last_name']} ({', '.join(person['tags'])})")
        else:
            # Create new contact
            contact_id = str(uuid4())
            db.execute(
                text("""
                    INSERT INTO contacts (
                        id, email, first_name, last_name, organization_id,
                        title, tags, created_at, updated_at
                    ) VALUES (
                        :id, :email, :first_name, :last_name, :org_id,
                        :title, CAST(:tags AS text[]), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                """),
                {
                    "id": contact_id,
                    "email": email,
                    "first_name": person['first_name'],
                    "last_name": person['last_name'],
                    "org_id": org_id,
                    "title": person.get('title'),
                    "tags": tags_array
                }
            )
            contacts_created += 1
            print(f"  ✓ Created: {person['first_name']} {person['last_name']} ({', '.join(person['tags'])})")

    db.commit()

    print()
    print(f"Summary: {contacts_created} created, {contacts_updated} updated")
    print()


async def import_sponsorships(db):
    """Import ICSR2026 sponsorships"""

    print("=" * 80)
    print("IMPORTING SPONSORSHIPS")
    print("=" * 80)

    # Get ICSR 2026 conference ID
    result = db.execute(
        text("SELECT id FROM conferences WHERE name = 'ICSR 2026' OR year = 2026 LIMIT 1")
    )
    conference = result.fetchone()

    if not conference:
        print("  ⚠️  ICSR 2026 conference not found in database")
        print("  Creating ICSR 2026 conference record...")
        conference_id = str(uuid4())
        db.execute(
            text("""
                INSERT INTO conferences (
                    id, name, year, location, start_date, end_date, created_at, updated_at
                ) VALUES (
                    :id, 'ICSR 2026', 2026, 'Little Creek Resort, Shelton, WA',
                    '2026-10-04', '2026-10-08', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
            """),
            {"id": conference_id}
        )
        db.commit()
        print(f"  ✓ Created conference: ICSR 2026")
    else:
        conference_id = conference[0]
        print(f"  ✓ Found conference: ICSR 2026 (ID: {conference_id})")

    print()

    sponsors_created = 0
    sponsors_updated = 0

    for sponsor in SPONSORSHIPS:
        # Get organization ID
        result = db.execute(
            text("SELECT id FROM organizations WHERE name = :name"),
            {"name": sponsor['organization']}
        )
        org = result.fetchone()

        if not org:
            # Create organization
            org_id = str(uuid4())
            db.execute(
                text("""
                    INSERT INTO organizations (id, name, created_at, updated_at)
                    VALUES (:id, :name, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """),
                {"id": org_id, "name": sponsor['organization']}
            )
            print(f"  ✓ Created org: {sponsor['organization']}")
        else:
            org_id = org[0]

        # Check if sponsorship already exists
        result = db.execute(
            text("""
                SELECT id FROM conference_sponsors
                WHERE conference_id = :conf_id AND organization_id = :org_id
            """),
            {"conf_id": conference_id, "org_id": org_id}
        )
        existing = result.fetchone()

        if existing:
            # Update existing sponsorship
            db.execute(
                text("""
                    UPDATE conference_sponsors
                    SET amount = :amount,
                        sponsor_level = :level,
                        status = :status,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id
                """),
                {
                    "amount": sponsor['amount'],
                    "level": sponsor['level'],
                    "status": sponsor['status'],
                    "id": existing[0]
                }
            )
            sponsors_updated += 1
            status_icon = "✅" if sponsor['status'] == 'received' else "⏳" if sponsor['status'] == 'committed' else "📧"
            print(f"  {status_icon} Updated: {sponsor['organization']} - {sponsor['status'].upper()}")
        else:
            # Create new sponsorship
            sponsor_id = str(uuid4())
            db.execute(
                text("""
                    INSERT INTO conference_sponsors (
                        id, conference_id, organization_id, amount,
                        sponsor_level, status, created_at, updated_at
                    ) VALUES (
                        :id, :conf_id, :org_id, :amount,
                        :level, :status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                """),
                {
                    "id": sponsor_id,
                    "conf_id": conference_id,
                    "org_id": org_id,
                    "amount": sponsor['amount'],
                    "level": sponsor['level'],
                    "status": sponsor['status']
                }
            )
            sponsors_created += 1
            status_icon = "✅" if sponsor['status'] == 'received' else "⏳" if sponsor['status'] == 'committed' else "📧"
            amount_str = f"${sponsor['amount']:,.2f}" if sponsor['amount'] else "TBD"
            print(f"  {status_icon} Created: {sponsor['organization']} - {amount_str} ({sponsor['status'].upper()})")

    db.commit()

    print()
    print(f"Summary: {sponsors_created} created, {sponsors_updated} updated")

    # Show totals
    print()
    print("=" * 80)
    print("SPONSORSHIP TOTALS")
    print("=" * 80)

    result = db.execute(
        text("""
            SELECT
                status,
                COUNT(*) as count,
                COALESCE(SUM(amount), 0) as total
            FROM conference_sponsors
            WHERE conference_id = :conf_id
            GROUP BY status
            ORDER BY
                CASE status
                    WHEN 'received' THEN 1
                    WHEN 'committed' THEN 2
                    WHEN 'invited' THEN 3
                    ELSE 4
                END
        """),
        {"conf_id": conference_id}
    )

    for row in result:
        status, count, total = row
        if total > 0:
            print(f"  {status.upper()}: {count} sponsors, ${total:,.2f}")
        else:
            print(f"  {status.upper()}: {count} sponsors")

    print()


async def main():
    """Main import function"""
    db = SessionLocal()

    try:
        print()
        print("╔" + "=" * 78 + "╗")
        print("║" + " " * 20 + "ICSR 2026 STATUS REPORT IMPORT" + " " * 27 + "║")
        print("║" + " " * 25 + "February 2, 2026" + " " * 36 + "║")
        print("╚" + "=" * 78 + "╝")
        print()

        # Import contacts
        await import_contacts_and_organizations(db)

        # Import sponsorships
        await import_sponsorships(db)

        print("=" * 80)
        print("✅ IMPORT COMPLETE")
        print("=" * 80)
        print()

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())
