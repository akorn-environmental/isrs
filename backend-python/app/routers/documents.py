"""
Document processing API endpoints.
Handles PDF/DOCX upload, parsing, OCR, and AI analysis.
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Optional
import logging
from io import BytesIO

from app.database import get_db
from app.models.conference import AttendeeProfile
from app.routers.auth import get_current_user
from app.services.document_service import DocumentService, DocumentProcessingError
from app.services.claude_service import ClaudeService, ClaudeAIError

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/upload")
async def process_uploaded_document(
    file: UploadFile = File(...),
    extract_tables: bool = Form(True),
    use_ocr: bool = Form(False),
    analyze_with_ai: bool = Form(False),
    document_type: str = Form("general"),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Upload and process a document (PDF or DOCX).
    Supports text extraction, table extraction, OCR, and AI analysis.

    Requires authentication.
    """
    try:
        # Validate file type
        file_extension = file.filename.split('.')[-1].lower()
        if file_extension not in ['pdf', 'docx', 'doc']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {file_extension}. Supported: PDF, DOCX"
            )

        # Read file content
        content = await file.read()
        file_obj = BytesIO(content)

        # Process document
        doc_service = DocumentService()
        result = doc_service.process_document(
            file_path=file_obj,
            file_type=file_extension,
            extract_tables=extract_tables,
            use_ocr=use_ocr,
        )

        # Add file metadata
        result['filename'] = file.filename
        result['file_size'] = len(content)

        # AI analysis if requested
        if analyze_with_ai and result.get('text'):
            try:
                claude_service = ClaudeService()
                analysis = await claude_service.analyze_document(
                    document_text=result['text'],
                    document_type=document_type,
                )
                result['ai_analysis'] = analysis
            except ClaudeAIError as e:
                logger.warning(f"AI analysis failed: {e}")
                result['ai_analysis'] = {
                    'success': False,
                    'error': str(e)
                }

        logger.info(f"Document processed: {file.filename} ({file_extension})")

        return result

    except DocumentProcessingError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error processing document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process document: {str(e)}"
        )


@router.post("/extract-contacts")
async def extract_contacts_from_document(
    file: UploadFile = File(...),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Extract contact information from uploaded document.
    Uses AI to identify names, emails, phone numbers, organizations.

    Requires authentication.
    """
    try:
        # Read and process document
        content = await file.read()
        file_obj = BytesIO(content)
        file_extension = file.filename.split('.')[-1].lower()

        doc_service = DocumentService()
        result = doc_service.process_document(
            file_path=file_obj,
            file_type=file_extension,
            extract_tables=False,
        )

        if not result.get('text'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No text content found in document"
            )

        # Extract key information
        extracted_info = doc_service.extract_key_information(result['text'])

        # Use Claude AI for better contact extraction
        try:
            claude_service = ClaudeService()
            ai_contacts = await claude_service.extract_structured_data(
                text=result['text'],
                data_type='contacts'
            )
            extracted_info['ai_extracted_contacts'] = ai_contacts.get('data', [])
        except ClaudeAIError as e:
            logger.warning(f"AI contact extraction failed: {e}")

        return {
            'success': True,
            'filename': file.filename,
            'contacts': extracted_info,
        }

    except Exception as e:
        logger.error(f"Error extracting contacts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract contacts: {str(e)}"
        )


@router.post("/analyze")
async def analyze_document_with_ai(
    file: UploadFile = File(...),
    document_type: str = Form("general"),
    max_tokens: int = Form(4096),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Analyze document using Claude AI.
    Provides intelligent analysis based on document type.

    Requires authentication.
    """
    try:
        # Read and process document
        content = await file.read()
        file_obj = BytesIO(content)
        file_extension = file.filename.split('.')[-1].lower()

        doc_service = DocumentService()
        result = doc_service.process_document(
            file_path=file_obj,
            file_type=file_extension,
            extract_tables=True,
        )

        if not result.get('text'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No text content found in document"
            )

        # Analyze with Claude
        claude_service = ClaudeService()
        analysis = await claude_service.analyze_document(
            document_text=result['text'],
            document_type=document_type,
            max_tokens=max_tokens,
        )

        return {
            'success': True,
            'filename': file.filename,
            'document_info': {
                'file_type': result.get('file_type'),
                'page_count': result.get('page_count'),
                'processing_time': result.get('processing_time_seconds'),
            },
            'analysis': analysis,
        }

    except ClaudeAIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error analyzing document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze document: {str(e)}"
        )


@router.post("/summarize")
async def summarize_document(
    file: UploadFile = File(...),
    max_length: str = Form("medium"),
    style: str = Form("professional"),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Summarize document content using Claude AI.

    Requires authentication.
    """
    try:
        # Read and process document
        content = await file.read()
        file_obj = BytesIO(content)
        file_extension = file.filename.split('.')[-1].lower()

        doc_service = DocumentService()
        result = doc_service.process_document(
            file_path=file_obj,
            file_type=file_extension,
        )

        if not result.get('text'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No text content found in document"
            )

        # Summarize with Claude
        claude_service = ClaudeService()
        summary = await claude_service.summarize_text(
            text=result['text'],
            max_length=max_length,
            style=style,
        )

        return {
            'success': True,
            'filename': file.filename,
            'summary': summary,
        }

    except ClaudeAIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error summarizing document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to summarize document: {str(e)}"
        )
