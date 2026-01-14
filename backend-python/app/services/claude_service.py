"""
Claude AI (Anthropic) integration service.
Provides AI-powered document analysis, summarization, and Q&A capabilities.
"""
import logging
from typing import Dict, List, Optional, Any
import anthropic
from app.config import settings

logger = logging.getLogger(__name__)


class ClaudeAIError(Exception):
    """Custom exception for Claude AI errors."""
    pass


class ClaudeService:
    """Service for interacting with Claude AI (Anthropic API)."""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Claude service.

        Args:
            api_key: Anthropic API key (defaults to settings.ANTHROPIC_API_KEY)
        """
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        if not self.api_key:
            logger.warning("Anthropic API key not configured")
        else:
            self.client = anthropic.Anthropic(api_key=self.api_key)

    async def analyze_document(
        self,
        document_text: str,
        document_type: str = "general",
        max_tokens: int = 4096,
    ) -> Dict[str, Any]:
        """
        Analyze a document and extract key information.

        Args:
            document_text: The document text to analyze
            document_type: Type of document (governance, research, meeting, funding, etc.)
            max_tokens: Maximum tokens in response

        Returns:
            Dict with analysis results
        """
        if not self.api_key:
            raise ClaudeAIError("Anthropic API key not configured")

        try:
            # Build prompt based on document type
            prompts = {
                "governance": """Analyze this governance document and extract:
1. Key decisions made
2. Voting results and outcomes
3. Action items and responsibilities
4. Important dates and deadlines
5. Key stakeholders mentioned
6. Main topics discussed

Please provide a structured summary.""",

                "research": """Analyze this research document and extract:
1. Main research question/hypothesis
2. Key findings and conclusions
3. Methodology used
4. Important data and statistics
5. Authors and affiliations
6. Implications and future work

Please provide a structured summary.""",

                "meeting": """Analyze these meeting notes and extract:
1. Meeting date, time, and attendees
2. Key discussion points
3. Decisions made
4. Action items with owners and deadlines
5. Follow-up items
6. Next meeting date (if mentioned)

Please provide a structured summary.""",

                "funding": """Analyze this funding-related document and extract:
1. Funding opportunity details
2. Amount and deadlines
3. Eligibility requirements
4. Application process
5. Key dates
6. Contact information

Please provide a structured summary.""",

                "general": """Analyze this document and provide:
1. Main topic and purpose
2. Key points and takeaways
3. Important dates, names, and entities
4. Action items (if any)
5. Overall summary

Please provide a structured analysis.""",
            }

            prompt = prompts.get(document_type, prompts["general"])

            # Call Claude API
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=max_tokens,
                messages=[
                    {
                        "role": "user",
                        "content": f"{prompt}\n\nDocument:\n\n{document_text[:100000]}"  # Limit to 100k chars
                    }
                ]
            )

            analysis = message.content[0].text

            return {
                'success': True,
                'analysis': analysis,
                'document_type': document_type,
                'model': message.model,
                'usage': {
                    'input_tokens': message.usage.input_tokens,
                    'output_tokens': message.usage.output_tokens,
                }
            }

        except Exception as e:
            logger.error(f"Error analyzing document with Claude: {e}")
            raise ClaudeAIError(f"Failed to analyze document: {str(e)}")

    async def summarize_text(
        self,
        text: str,
        max_length: str = "medium",
        style: str = "professional",
    ) -> Dict[str, Any]:
        """
        Summarize text using Claude.

        Args:
            text: Text to summarize
            max_length: Summary length (short, medium, long)
            style: Summary style (professional, casual, technical)

        Returns:
            Dict with summary
        """
        if not self.api_key:
            raise ClaudeAIError("Anthropic API key not configured")

        try:
            length_instructions = {
                "short": "in 2-3 sentences",
                "medium": "in 1-2 paragraphs",
                "long": "in 3-4 paragraphs with detailed points",
            }

            style_instructions = {
                "professional": "using professional business language",
                "casual": "using casual, easy-to-understand language",
                "technical": "using technical and precise language",
            }

            prompt = f"""Please provide a {max_length} summary of the following text {style_instructions.get(style, '')}.

Text to summarize:

{text[:100000]}"""

            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2048,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            summary = message.content[0].text

            return {
                'success': True,
                'summary': summary,
                'original_length': len(text),
                'summary_length': len(summary),
                'compression_ratio': round(len(summary) / len(text), 2),
                'usage': {
                    'input_tokens': message.usage.input_tokens,
                    'output_tokens': message.usage.output_tokens,
                }
            }

        except Exception as e:
            logger.error(f"Error summarizing text with Claude: {e}")
            raise ClaudeAIError(f"Failed to summarize text: {str(e)}")

    async def extract_structured_data(
        self,
        text: str,
        data_type: str = "contacts",
    ) -> Dict[str, Any]:
        """
        Extract structured data from unstructured text.

        Args:
            text: Text to extract from
            data_type: Type of data to extract (contacts, dates, organizations, funding, etc.)

        Returns:
            Dict with extracted structured data
        """
        if not self.api_key:
            raise ClaudeAIError("Anthropic API key not configured")

        try:
            prompts = {
                "contacts": """Extract all contact information from this text and format as JSON array with fields:
- name (full name)
- email
- title (job title)
- organization
- phone (if available)
- location (if available)

Return only the JSON array, no other text.""",

                "dates": """Extract all dates and associated events from this text and format as JSON array with fields:
- date (ISO format YYYY-MM-DD)
- event (description of what happens on this date)
- type (meeting, deadline, conference, etc.)

Return only the JSON array, no other text.""",

                "organizations": """Extract all organizations/institutions mentioned and format as JSON array with fields:
- name
- type (university, company, nonprofit, government, etc.)
- location (if mentioned)
- context (how they're mentioned)

Return only the JSON array, no other text.""",

                "funding": """Extract all funding-related information and format as JSON with fields:
- opportunities: array of {name, amount, deadline, source}
- committed_funding: array of {source, amount, date}
- budget_items: array of {item, amount}

Return only the JSON object, no other text.""",
            }

            prompt = prompts.get(data_type, prompts["contacts"])

            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=4096,
                messages=[
                    {
                        "role": "user",
                        "content": f"{prompt}\n\nText:\n\n{text[:100000]}"
                    }
                ]
            )

            extracted = message.content[0].text

            # Try to parse as JSON
            import json
            try:
                structured_data = json.loads(extracted)
            except json.JSONDecodeError:
                # If not valid JSON, return as text
                structured_data = extracted

            return {
                'success': True,
                'data': structured_data,
                'data_type': data_type,
                'usage': {
                    'input_tokens': message.usage.input_tokens,
                    'output_tokens': message.usage.output_tokens,
                }
            }

        except Exception as e:
            logger.error(f"Error extracting structured data with Claude: {e}")
            raise ClaudeAIError(f"Failed to extract data: {str(e)}")

    async def answer_question(
        self,
        question: str,
        context: str,
        max_tokens: int = 1024,
    ) -> Dict[str, Any]:
        """
        Answer a question about provided context using Claude.

        Args:
            question: Question to answer
            context: Context/document to base answer on
            max_tokens: Maximum tokens in response

        Returns:
            Dict with answer
        """
        if not self.api_key:
            raise ClaudeAIError("Anthropic API key not configured")

        try:
            prompt = f"""Based on the following context, please answer this question:

Question: {question}

Context:
{context[:100000]}

Please provide a clear, concise answer based only on the information in the context. If the answer is not in the context, please say so."""

            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=max_tokens,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            answer = message.content[0].text

            return {
                'success': True,
                'question': question,
                'answer': answer,
                'usage': {
                    'input_tokens': message.usage.input_tokens,
                    'output_tokens': message.usage.output_tokens,
                }
            }

        except Exception as e:
            logger.error(f"Error answering question with Claude: {e}")
            raise ClaudeAIError(f"Failed to answer question: {str(e)}")

    async def generate_report(
        self,
        data: Dict[str, Any],
        report_type: str = "summary",
    ) -> Dict[str, Any]:
        """
        Generate a formatted report from structured data.

        Args:
            data: Structured data to create report from
            report_type: Type of report (summary, detailed, executive, etc.)

        Returns:
            Dict with generated report
        """
        if not self.api_key:
            raise ClaudeAIError("Anthropic API key not configured")

        try:
            import json

            prompts = {
                "summary": "Create a concise executive summary report",
                "detailed": "Create a detailed comprehensive report",
                "executive": "Create an executive-level overview suitable for leadership",
                "technical": "Create a technical report with detailed analysis",
            }

            instruction = prompts.get(report_type, prompts["summary"])

            prompt = f"""{instruction} from the following data. Format it professionally with appropriate sections, headings, and bullet points.

Data:
{json.dumps(data, indent=2)}

Please generate a well-structured report."""

            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=4096,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            report = message.content[0].text

            return {
                'success': True,
                'report': report,
                'report_type': report_type,
                'usage': {
                    'input_tokens': message.usage.input_tokens,
                    'output_tokens': message.usage.output_tokens,
                }
            }

        except Exception as e:
            logger.error(f"Error generating report with Claude: {e}")
            raise ClaudeAIError(f"Failed to generate report: {str(e)}")

    async def compare_documents(
        self,
        doc1_text: str,
        doc2_text: str,
        comparison_type: str = "general",
    ) -> Dict[str, Any]:
        """
        Compare two documents and highlight differences/similarities.

        Args:
            doc1_text: First document text
            doc2_text: Second document text
            comparison_type: Type of comparison (general, changes, versions, etc.)

        Returns:
            Dict with comparison results
        """
        if not self.api_key:
            raise ClaudeAIError("Anthropic API key not configured")

        try:
            prompt = f"""Compare these two documents and provide:
1. Key differences between them
2. Important similarities
3. Changes or updates (if applicable)
4. Summary of what changed

Document 1:
{doc1_text[:50000]}

Document 2:
{doc2_text[:50000]}

Please provide a structured comparison."""

            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=4096,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            comparison = message.content[0].text

            return {
                'success': True,
                'comparison': comparison,
                'usage': {
                    'input_tokens': message.usage.input_tokens,
                    'output_tokens': message.usage.output_tokens,
                }
            }

        except Exception as e:
            logger.error(f"Error comparing documents with Claude: {e}")
            raise ClaudeAIError(f"Failed to compare documents: {str(e)}")
