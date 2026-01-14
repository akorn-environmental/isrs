"""
Apollo.io API integration service for contact enrichment.
Enriches contact data with professional information, social profiles, and more.
"""
import logging
from typing import Dict, List, Optional, Any
import httpx
from app.config import settings

logger = logging.getLogger(__name__)


class ApolloAPIError(Exception):
    """Custom exception for Apollo API errors."""
    pass


class ApolloService:
    """Service for interacting with Apollo.io API."""

    BASE_URL = "https://api.apollo.io/v1"

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Apollo service.

        Args:
            api_key: Apollo API key (defaults to settings.APOLLO_API_KEY)
        """
        self.api_key = api_key or settings.APOLLO_API_KEY
        if not self.api_key:
            logger.warning("Apollo API key not configured")

    async def enrich_person(
        self,
        email: Optional[str] = None,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        organization_name: Optional[str] = None,
        domain: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Enrich a person's contact information using Apollo API.

        Args:
            email: Person's email address (most accurate identifier)
            first_name: Person's first name
            last_name: Person's last name
            organization_name: Person's organization
            domain: Organization's website domain

        Returns:
            Dict with enriched contact data
        """
        if not self.api_key:
            raise ApolloAPIError("Apollo API key not configured")

        try:
            url = f"{self.BASE_URL}/people/match"

            # Build request payload
            payload = {}
            if email:
                payload['email'] = email
            if first_name:
                payload['first_name'] = first_name
            if last_name:
                payload['last_name'] = last_name
            if organization_name:
                payload['organization_name'] = organization_name
            if domain:
                payload['domain'] = domain

            if not payload:
                raise ApolloAPIError("At least one search parameter required")

            headers = {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers,
                    params={'api_key': self.api_key},
                    timeout=30.0
                )

                if response.status_code == 200:
                    data = response.json()
                    person = data.get('person', {})

                    # Extract and structure the enriched data
                    enriched_data = {
                        'success': True,
                        'email': person.get('email'),
                        'first_name': person.get('first_name'),
                        'last_name': person.get('last_name'),
                        'name': person.get('name'),
                        'title': person.get('title'),
                        'organization_name': person.get('organization_name'),
                        'linkedin_url': person.get('linkedin_url'),
                        'twitter_url': person.get('twitter_url'),
                        'facebook_url': person.get('facebook_url'),
                        'phone_numbers': person.get('phone_numbers', []),
                        'city': person.get('city'),
                        'state': person.get('state'),
                        'country': person.get('country'),
                        'headline': person.get('headline'),
                        'photo_url': person.get('photo_url'),
                        'employment_history': person.get('employment_history', []),
                        'organization': self._extract_organization_data(person.get('organization', {})),
                        'source': 'apollo.io',
                    }

                    logger.info(f"Successfully enriched contact: {email or f'{first_name} {last_name}'}")
                    return enriched_data

                elif response.status_code == 404:
                    return {
                        'success': False,
                        'error': 'Contact not found in Apollo database',
                        'source': 'apollo.io',
                    }

                elif response.status_code == 401:
                    raise ApolloAPIError("Invalid API key")

                elif response.status_code == 429:
                    raise ApolloAPIError("Apollo API rate limit exceeded")

                else:
                    error_msg = response.json().get('error', response.text)
                    raise ApolloAPIError(f"Apollo API error ({response.status_code}): {error_msg}")

        except httpx.TimeoutException:
            logger.error("Apollo API request timed out")
            raise ApolloAPIError("Request to Apollo API timed out")
        except Exception as e:
            logger.error(f"Error enriching contact with Apollo: {e}")
            raise ApolloAPIError(f"Failed to enrich contact: {str(e)}")

    def _extract_organization_data(self, org_data: Dict) -> Dict[str, Any]:
        """Extract and structure organization data from Apollo response."""
        if not org_data:
            return {}

        return {
            'name': org_data.get('name'),
            'website_url': org_data.get('website_url'),
            'linkedin_url': org_data.get('linkedin_url'),
            'twitter_url': org_data.get('twitter_url'),
            'facebook_url': org_data.get('facebook_url'),
            'industry': org_data.get('industry'),
            'industry_tag_id': org_data.get('industry_tag_id'),
            'retail_location_count': org_data.get('retail_location_count'),
            'raw_address': org_data.get('raw_address'),
            'city': org_data.get('city'),
            'state': org_data.get('state'),
            'country': org_data.get('country'),
            'founded_year': org_data.get('founded_year'),
            'employee_count': org_data.get('employee_count'),
            'short_description': org_data.get('short_description'),
        }

    async def search_people(
        self,
        person_titles: Optional[List[str]] = None,
        person_locations: Optional[List[str]] = None,
        organization_domains: Optional[List[str]] = None,
        organization_names: Optional[List[str]] = None,
        page: int = 1,
        per_page: int = 25,
    ) -> Dict[str, Any]:
        """
        Search for people using Apollo's search API.

        Args:
            person_titles: List of job titles to search for
            person_locations: List of locations (cities/countries)
            organization_domains: List of organization domains
            organization_names: List of organization names
            page: Page number for pagination
            per_page: Results per page (max 100)

        Returns:
            Dict with search results
        """
        if not self.api_key:
            raise ApolloAPIError("Apollo API key not configured")

        try:
            url = f"{self.BASE_URL}/mixed_people/search"

            payload = {
                'page': page,
                'per_page': min(per_page, 100),
            }

            if person_titles:
                payload['person_titles'] = person_titles
            if person_locations:
                payload['person_locations'] = person_locations
            if organization_domains:
                payload['organization_domains'] = organization_domains
            if organization_names:
                payload['q_organization_name'] = ' OR '.join(organization_names)

            headers = {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers,
                    params={'api_key': self.api_key},
                    timeout=30.0
                )

                if response.status_code == 200:
                    data = response.json()
                    return {
                        'success': True,
                        'people': data.get('people', []),
                        'pagination': data.get('pagination', {}),
                        'total_entries': data.get('pagination', {}).get('total_entries', 0),
                    }
                else:
                    error_msg = response.json().get('error', response.text)
                    raise ApolloAPIError(f"Apollo API error ({response.status_code}): {error_msg}")

        except Exception as e:
            logger.error(f"Error searching people with Apollo: {e}")
            raise ApolloAPIError(f"Failed to search people: {str(e)}")

    async def enrich_organization(
        self,
        domain: Optional[str] = None,
        organization_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Enrich organization information using Apollo API.

        Args:
            domain: Organization's website domain
            organization_name: Organization's name

        Returns:
            Dict with enriched organization data
        """
        if not self.api_key:
            raise ApolloAPIError("Apollo API key not configured")

        if not domain and not organization_name:
            raise ApolloAPIError("Either domain or organization_name required")

        try:
            url = f"{self.BASE_URL}/organizations/enrich"

            payload = {}
            if domain:
                payload['domain'] = domain
            if organization_name:
                payload['name'] = organization_name

            headers = {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers,
                    params={'api_key': self.api_key},
                    timeout=30.0
                )

                if response.status_code == 200:
                    data = response.json()
                    org = data.get('organization', {})

                    enriched_data = {
                        'success': True,
                        'name': org.get('name'),
                        'website_url': org.get('website_url'),
                        'domain': org.get('primary_domain'),
                        'linkedin_url': org.get('linkedin_url'),
                        'twitter_url': org.get('twitter_url'),
                        'facebook_url': org.get('facebook_url'),
                        'industry': org.get('industry'),
                        'keywords': org.get('keywords', []),
                        'estimated_num_employees': org.get('estimated_num_employees'),
                        'retail_location_count': org.get('retail_location_count'),
                        'city': org.get('city'),
                        'state': org.get('state'),
                        'country': org.get('country'),
                        'street_address': org.get('street_address'),
                        'postal_code': org.get('postal_code'),
                        'founded_year': org.get('founded_year'),
                        'phone': org.get('phone'),
                        'publicly_traded_symbol': org.get('publicly_traded_symbol'),
                        'publicly_traded_exchange': org.get('publicly_traded_exchange'),
                        'logo_url': org.get('logo_url'),
                        'short_description': org.get('short_description'),
                        'annual_revenue': org.get('annual_revenue'),
                        'total_funding': org.get('total_funding'),
                        'technologies': org.get('technologies', []),
                        'source': 'apollo.io',
                    }

                    logger.info(f"Successfully enriched organization: {domain or organization_name}")
                    return enriched_data

                elif response.status_code == 404:
                    return {
                        'success': False,
                        'error': 'Organization not found in Apollo database',
                        'source': 'apollo.io',
                    }
                else:
                    error_msg = response.json().get('error', response.text)
                    raise ApolloAPIError(f"Apollo API error ({response.status_code}): {error_msg}")

        except Exception as e:
            logger.error(f"Error enriching organization with Apollo: {e}")
            raise ApolloAPIError(f"Failed to enrich organization: {str(e)}")

    async def bulk_enrich_people(self, contacts: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        """
        Enrich multiple contacts in bulk.

        Args:
            contacts: List of contact dicts with 'email' or 'first_name'/'last_name'

        Returns:
            List of enriched contact data
        """
        results = []

        for contact in contacts:
            try:
                enriched = await self.enrich_person(
                    email=contact.get('email'),
                    first_name=contact.get('first_name'),
                    last_name=contact.get('last_name'),
                    organization_name=contact.get('organization_name'),
                    domain=contact.get('domain'),
                )
                results.append({
                    'original': contact,
                    'enriched': enriched,
                })
            except Exception as e:
                logger.warning(f"Failed to enrich contact {contact.get('email')}: {e}")
                results.append({
                    'original': contact,
                    'enriched': {
                        'success': False,
                        'error': str(e),
                    },
                })

        return results
