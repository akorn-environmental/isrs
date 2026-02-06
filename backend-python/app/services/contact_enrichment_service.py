"""
Contact Enrichment Service
Auto-creates and enriches Contact/Organization records from parsed email data
"""
import logging
import json
import re
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_
from nameparser import HumanName
from rapidfuzz import fuzz
from app.models.contact import Contact, Organization
from app.models.parsed_email import ParsedEmail

logger = logging.getLogger(__name__)


class ContactEnrichmentService:
    """
    Service for enriching contacts from email extraction data

    Features:
    - Auto-creates Contact records from extracted email participants
    - Auto-creates Organization records from email signatures
    - Intelligent primary contact detection
    - Fuzzy matching for duplicate prevention
    - Confidence-based auto-processing (60% threshold)
    """

    def __init__(self, confidence_threshold: float = 60.0):
        """
        Initialize Contact Enrichment Service

        Args:
            confidence_threshold: Minimum confidence (0-100) to auto-process contacts
        """
        self.confidence_threshold = confidence_threshold

    async def process_email_contacts(
        self,
        parsed_email: ParsedEmail,
        extracted_data: Dict[str, Any],
        db: Session
    ) -> Dict[str, Any]:
        """
        Main entry point: Process all contacts from a parsed email

        Args:
            parsed_email: ParsedEmail record
            extracted_data: AI-extracted data with 'contacts' array
            db: Database session

        Returns:
            {
                'contacts_created': int,
                'contacts_updated': int,
                'contacts_skipped': int,
                'organizations_created': int,
                'organizations_matched': int,
                'primary_contact': Optional[Dict],
                'errors': List[str]
            }
        """
        results = {
            'contacts_created': 0,
            'contacts_updated': 0,
            'contacts_skipped': 0,
            'organizations_created': 0,
            'organizations_matched': 0,
            'primary_contact': None,
            'errors': []
        }

        try:
            extracted_contacts = extracted_data.get('contacts', [])

            if not extracted_contacts:
                logger.info(f"[Contact Enrichment] No contacts to process for email {parsed_email.id}")
                return results

            logger.info(f"[Contact Enrichment] Processing {len(extracted_contacts)} contacts from email {parsed_email.id}")

            # Deduplicate contacts within same email (by email address)
            unique_contacts = self._deduplicate_contacts(extracted_contacts)
            logger.info(f"[Contact Enrichment] {len(unique_contacts)} unique contacts after deduplication")

            # Process each contact individually with error isolation
            processed_contacts = []

            for contact_data in unique_contacts:
                try:
                    # Check confidence threshold
                    confidence = contact_data.get('confidence', 0)
                    if confidence < self.confidence_threshold:
                        logger.info(
                            f"[Contact Enrichment] Skipping low-confidence contact: "
                            f"{contact_data.get('email')} ({confidence}%)"
                        )
                        results['contacts_skipped'] += 1
                        continue

                    # Process single contact
                    result = await self._process_single_contact(
                        contact_data,
                        parsed_email,
                        db
                    )

                    if result:
                        processed_contacts.append(result)
                        results['contacts_created'] += result.get('created', 0)
                        results['contacts_updated'] += result.get('updated', 0)
                        results['organizations_created'] += result.get('org_created', 0)
                        results['organizations_matched'] += result.get('org_matched', 0)

                except Exception as contact_error:
                    logger.warning(
                        f"[Contact Enrichment] Failed to process contact {contact_data.get('email')}: "
                        f"{str(contact_error)}"
                    )
                    results['errors'].append(f"Contact {contact_data.get('email')}: {str(contact_error)}")
                    results['contacts_skipped'] += 1
                    continue

            # Detect primary contact (isolated error handling)
            try:
                results['primary_contact'] = self._detect_primary_contact(
                    parsed_email,
                    processed_contacts,
                    db
                )
            except Exception as primary_error:
                logger.warning(f"[Contact Enrichment] Failed to detect primary contact: {str(primary_error)}")
                results['errors'].append(f"Primary detection failed: {str(primary_error)}")

            logger.info(
                f"[Contact Enrichment] Completed for email {parsed_email.id}. "
                f"Created={results['contacts_created']}, "
                f"Updated={results['contacts_updated']}, "
                f"Skipped={results['contacts_skipped']}, "
                f"Orgs Created={results['organizations_created']}, "
                f"Orgs Matched={results['organizations_matched']}"
            )

            return results

        except Exception as e:
            logger.error(f"[Contact Enrichment] Critical error: {str(e)}", exc_info=True)
            results['errors'].append(f"Critical error: {str(e)}")
            return results

    def _deduplicate_contacts(self, contacts: List[Dict]) -> List[Dict]:
        """
        Deduplicate contacts within the same email by email address
        Keeps the contact with highest confidence for each email
        """
        seen_emails = {}

        for contact in contacts:
            email = contact.get('email', '').lower().strip()
            if not email or '@' not in email:
                continue

            confidence = contact.get('confidence', 0)

            if email not in seen_emails or confidence > seen_emails[email].get('confidence', 0):
                seen_emails[email] = contact

        return list(seen_emails.values())

    async def _process_single_contact(
        self,
        contact_data: Dict[str, Any],
        parsed_email: ParsedEmail,
        db: Session
    ) -> Optional[Dict[str, Any]]:
        """
        Process a single contact: find or create organization, find or create contact

        Returns:
            {
                'contact_id': UUID,
                'email': str,
                'created': 0 or 1,
                'updated': 0 or 1,
                'org_created': 0 or 1,
                'org_matched': 0 or 1,
                'confidence': int
            }
        """
        email = contact_data.get('email', '').lower().strip()
        if not email or '@' not in email:
            logger.debug(f"[Contact Enrichment] Invalid email format: {email}")
            return None

        name = contact_data.get('name', '').strip()
        organization_name = contact_data.get('organization', '').strip()
        role = contact_data.get('role', '').strip()
        confidence = contact_data.get('confidence', 0)

        result = {
            'email': email,
            'created': 0,
            'updated': 0,
            'org_created': 0,
            'org_matched': 0,
            'confidence': confidence
        }

        # Step 1: Find or create organization
        organization_id = None
        if organization_name:
            org, org_created = await self._find_or_create_organization(
                organization_name,
                db
            )
            if org:
                organization_id = org.id
                result['org_created'] = 1 if org_created else 0
                result['org_matched'] = 0 if org_created else 1

        # Step 2: Find matching contact (email exact or fuzzy name)
        existing_contact = self._find_matching_contact(email, name, db)

        if existing_contact:
            # Update existing contact
            logger.info(f"[Contact Enrichment] Updating existing contact: {email} (ID: {existing_contact.id})")

            updated = self._merge_contact_data(
                existing_contact,
                {
                    'full_name': name,
                    'organization_id': organization_id,
                    'role': role,
                    'title': role,  # Store role in both fields
                },
                confidence,
                parsed_email
            )

            if updated:
                db.commit()
                db.refresh(existing_contact)
                result['updated'] = 1
                result['contact_id'] = existing_contact.id

        else:
            # Create new contact
            logger.info(f"[Contact Enrichment] Creating new contact: {email}")

            parsed_name = self._parse_name_intelligently(name) if name else {}

            new_contact = Contact(
                email=email,
                full_name=name or email,
                first_name=parsed_name.get('first', ''),
                last_name=parsed_name.get('last', ''),
                organization_id=organization_id,
                role=role,
                title=role,
                notes=self._create_enrichment_note(
                    source='email_parsing',
                    confidence=confidence,
                    email_id=parsed_email.id,
                    email_subject=parsed_email.subject
                )
            )

            db.add(new_contact)
            db.commit()
            db.refresh(new_contact)

            result['created'] = 1
            result['contact_id'] = new_contact.id

            logger.info(f"[Contact Enrichment] Created new contact ID: {new_contact.id}")

        return result

    def _find_matching_contact(
        self,
        email: str,
        name: Optional[str],
        db: Session
    ) -> Optional[Contact]:
        """
        Find existing contact using two-phase matching:
        Phase 1: Email exact match (100% accuracy)
        Phase 2: Fuzzy name match (85% threshold)
        """
        # Phase 1: Email exact match (indexed, fast)
        contact = db.query(Contact).filter(Contact.email == email).first()
        if contact:
            logger.debug(f"[Contact Enrichment] Found exact email match: {email}")
            return contact

        # Phase 2: Fuzzy name match (only if name provided)
        if name:
            fuzzy_match = self._fuzzy_name_match(name, db)
            if fuzzy_match:
                logger.debug(
                    f"[Contact Enrichment] Found fuzzy name match: {name} → {fuzzy_match.full_name}"
                )
                return fuzzy_match

        return None

    def _fuzzy_name_match(self, name: str, db: Session) -> Optional[Contact]:
        """
        Find contacts with similar names using fuzzy matching

        Algorithm:
        1. Parse name to extract first/last
        2. Pre-filter candidates using database ILIKE (fast)
        3. Calculate similarity scores with rapidfuzz (accurate)
        4. Return best match if score >= 85%
        """
        if not name:
            return None

        parsed_name = self._parse_name_intelligently(name)
        first_name = parsed_name.get('first', '')
        last_name = parsed_name.get('last', '')

        if not first_name and not last_name:
            return None

        # Pre-filter candidates with database query (limit to 50 for performance)
        query = db.query(Contact)

        if first_name and last_name:
            query = query.filter(
                or_(
                    Contact.first_name.ilike(f"%{first_name}%"),
                    Contact.last_name.ilike(f"%{last_name}%"),
                    Contact.full_name.ilike(f"%{name}%")
                )
            )
        elif first_name:
            query = query.filter(Contact.first_name.ilike(f"%{first_name}%"))
        else:
            query = query.filter(Contact.last_name.ilike(f"%{last_name}%"))

        candidates = query.limit(50).all()

        if not candidates:
            return None

        # Calculate fuzzy similarity scores
        best_match = None
        best_score = 0
        threshold = 85

        name_normalized = name.lower().strip()

        for candidate in candidates:
            candidate_name = (candidate.full_name or '').lower().strip()
            if not candidate_name:
                continue

            score = fuzz.ratio(name_normalized, candidate_name)

            if score >= threshold and score > best_score:
                best_match = candidate
                best_score = score

        if best_match:
            logger.debug(f"[Contact Enrichment] Fuzzy match score: {best_score}% for '{name}' → '{best_match.full_name}'")

        return best_match

    async def _find_or_create_organization(
        self,
        org_name: str,
        db: Session
    ) -> Tuple[Optional[Organization], bool]:
        """
        Find existing organization or create new one

        Matching Strategy:
        1. Normalize organization name
        2. Try exact match on normalized name
        3. Try fuzzy match (90% threshold)
        4. Create new if no match found

        Returns:
            (Organization, created: bool) or (None, False)
        """
        if not org_name:
            return None, False

        # Truncate if too long
        if len(org_name) > 255:
            org_name = org_name[:252] + '...'
            logger.warning(f"[Contact Enrichment] Truncated organization name to 255 chars")

        normalized_name = self._normalize_organization_name(org_name)

        # Try exact match on normalized name (case-insensitive)
        existing = db.query(Organization).filter(
            Organization.name.ilike(org_name)
        ).first()

        if existing:
            logger.debug(f"[Contact Enrichment] Found exact organization match: {org_name}")
            return existing, False

        # Try fuzzy match (90% threshold - higher than contacts)
        fuzzy_match = self._fuzzy_organization_match(normalized_name, org_name, db)
        if fuzzy_match:
            logger.debug(
                f"[Contact Enrichment] Found fuzzy organization match: "
                f"{org_name} → {fuzzy_match.name}"
            )
            return fuzzy_match, False

        # Create new organization
        logger.info(f"[Contact Enrichment] Creating new organization: {org_name}")

        new_org = Organization(
            name=org_name,
            notes=f"Auto-created from email parsing"
        )

        db.add(new_org)
        db.commit()
        db.refresh(new_org)

        logger.info(f"[Contact Enrichment] Created organization ID: {new_org.id}")

        return new_org, True

    def _fuzzy_organization_match(
        self,
        normalized_name: str,
        original_name: str,
        db: Session
    ) -> Optional[Organization]:
        """
        Fuzzy match organizations with 90% threshold
        """
        # Get all organizations for comparison
        all_orgs = db.query(Organization).limit(200).all()

        best_match = None
        best_score = 0
        threshold = 90  # Higher threshold for orgs

        for org in all_orgs:
            org_normalized = self._normalize_organization_name(org.name)

            # Compare normalized names
            score = fuzz.ratio(normalized_name, org_normalized)

            if score >= threshold and score > best_score:
                best_match = org
                best_score = score

        if best_match:
            logger.debug(
                f"[Contact Enrichment] Fuzzy org match score: {best_score}% "
                f"for '{original_name}' → '{best_match.name}'"
            )

        return best_match

    @staticmethod
    def _normalize_organization_name(name: str) -> str:
        """
        Normalize organization names for consistent matching

        Transformations:
        - Remove legal suffixes: LLC, Inc., Ltd., Corp, Corporation
        - Remove punctuation: commas, periods
        - Remove "The" prefix
        - Lowercase and strip whitespace
        - Remove extra spaces

        Examples:
        "The Microsoft Corporation, Inc." → "microsoft"
        "NOAA Fisheries" → "noaa fisheries"
        """
        if not name:
            return ""

        normalized = name.lower().strip()

        # Remove "The" prefix
        if normalized.startswith('the '):
            normalized = normalized[4:]

        # Remove legal suffixes (must be word boundaries)
        legal_suffixes = [
            r'\bllc\b', r'\binc\.?\b', r'\bltd\.?\b', r'\bcorp\.?\b',
            r'\bcorporation\b', r'\bcompany\b', r'\bco\.?\b', r'\blimited\b'
        ]
        for suffix in legal_suffixes:
            normalized = re.sub(suffix, '', normalized)

        # Remove punctuation
        normalized = re.sub(r'[,.\-()&]', ' ', normalized)

        # Remove extra whitespace
        normalized = ' '.join(normalized.split())

        return normalized.strip()

    @staticmethod
    def _parse_name_intelligently(full_name: str) -> Dict[str, str]:
        """
        Parse names intelligently using nameparser library

        Handles:
        - Prefixes: Dr., Prof., Mr., Ms.
        - Suffixes: Jr., Sr., III, PhD, MD
        - Middle names
        - Compound last names: van der Waals, O'Brien
        - Hyphenated names: Jean-Claude

        Returns:
            {
                'first': 'John',
                'middle': 'Patrick',
                'last': "O'Brien",
                'title': 'Dr.',
                'suffix': 'Jr.'
            }
        """
        if not full_name:
            return {}

        try:
            name = HumanName(full_name)

            return {
                'first': name.first,
                'middle': name.middle,
                'last': name.last,
                'title': name.title,
                'suffix': name.suffix,
                'nickname': name.nickname
            }
        except Exception as e:
            logger.warning(f"[Contact Enrichment] Name parsing failed for '{full_name}': {str(e)}")
            # Fallback to simple split
            parts = full_name.strip().split()
            return {
                'first': parts[0] if parts else '',
                'last': ' '.join(parts[1:]) if len(parts) > 1 else ''
            }

    def _merge_contact_data(
        self,
        existing_contact: Contact,
        new_data: Dict[str, Any],
        confidence: float,
        parsed_email: ParsedEmail
    ) -> bool:
        """
        Merge new data into existing contact

        Rules:
        1. NEVER overwrite non-null fields (preserve user data)
        2. Only fill empty/null fields
        3. Append enrichment metadata to notes

        Returns:
            True if any fields were updated, False otherwise
        """
        updated = False
        fields_enriched = []

        # Enrichable fields (only if currently empty)
        field_mapping = {
            'full_name': new_data.get('full_name'),
            'organization_id': new_data.get('organization_id'),
            'role': new_data.get('role'),
            'title': new_data.get('title'),
        }

        for field, value in field_mapping.items():
            if value and not getattr(existing_contact, field):
                setattr(existing_contact, field, value)
                fields_enriched.append(field)
                updated = True

        # Append enrichment note if fields were updated
        if fields_enriched:
            enrichment_note = self._create_enrichment_note(
                source='email_parsing',
                confidence=confidence,
                email_id=parsed_email.id,
                email_subject=parsed_email.subject,
                fields_enriched=fields_enriched
            )

            existing_notes = existing_contact.notes or ""
            existing_contact.notes = f"{existing_notes}\n{enrichment_note}".strip()

        return updated

    @staticmethod
    def _create_enrichment_note(
        source: str,
        confidence: float,
        email_id: int,
        email_subject: str,
        fields_enriched: Optional[List[str]] = None
    ) -> str:
        """Create enrichment metadata note"""
        metadata = {
            'source': source,
            'date': datetime.now().isoformat(),
            'confidence': confidence,
            'email_id': email_id,
            'email_subject': email_subject[:100]  # Truncate long subjects
        }

        if fields_enriched:
            metadata['fields_enriched'] = fields_enriched

        return f"[Enriched: {json.dumps(metadata, ensure_ascii=False)}]"

    def _detect_primary_contact(
        self,
        parsed_email: ParsedEmail,
        processed_contacts: List[Dict],
        db: Session
    ) -> Optional[Dict[str, Any]]:
        """
        Detect primary contact using multi-factor scoring algorithm

        Scoring Factors:
        1. Position in TO field: +40 points
        2. Position in FROM field: +30 points
        3. Has role/title in extraction: +15 points
        4. Has organization in extraction: +10 points
        5. Highest extraction confidence: +5 points

        Returns contact with highest score (if score >= 50)
        """
        if not processed_contacts:
            return None

        # Get TO and FROM email lists
        to_emails = [e.lower().strip() for e in (parsed_email.to_emails or [])]
        from_email = parsed_email.from_email.lower().strip() if parsed_email.from_email else None
        cc_emails = [e.lower().strip() for e in (parsed_email.cc_emails or [])]

        # Score each contact
        scored_contacts = []

        for contact in processed_contacts:
            email = contact.get('email', '').lower().strip()
            score = 0
            reasons = []

            # Factor 1: TO field (highest priority)
            if email in to_emails:
                score += 40
                reasons.append('recipient_in_to_field')

            # Factor 2: FROM field
            elif email == from_email:
                score += 30
                reasons.append('sender_in_from_field')

            # CC field (lower priority)
            elif email in cc_emails:
                score += 20
                reasons.append('recipient_in_cc_field')

            # Factor 3: Has role/title
            if contact.get('role') or contact.get('title'):
                score += 15
                reasons.append('has_role_title')

            # Factor 4: Has organization
            if contact.get('org_created') or contact.get('org_matched'):
                score += 10
                reasons.append('has_organization')

            # Factor 5: High confidence
            if contact.get('confidence', 0) >= 80:
                score += 5
                reasons.append('high_confidence')

            scored_contacts.append({
                'email': email,
                'contact_id': contact.get('contact_id'),
                'score': score,
                'confidence': contact.get('confidence', 0),
                'reasons': reasons
            })

        # Find highest scoring contact
        if not scored_contacts:
            return None

        best_contact = max(scored_contacts, key=lambda c: c['score'])

        # Only return if score meets minimum threshold
        if best_contact['score'] >= 50:
            logger.info(
                f"[Contact Enrichment] Primary contact detected: {best_contact['email']} "
                f"(score: {best_contact['score']}, reasons: {', '.join(best_contact['reasons'])})"
            )

            return {
                'email': best_contact['email'],
                'contact_id': str(best_contact['contact_id']),
                'score': best_contact['score'],
                'confidence': best_contact['confidence'],
                'detection_reason': ', '.join(best_contact['reasons'])
            }

        logger.info(
            f"[Contact Enrichment] No primary contact detected "
            f"(highest score: {best_contact['score']} < 50 threshold)"
        )

        return None
