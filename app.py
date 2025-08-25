"""
Documind Analyzer - Document Upload and Processing Web Application
A Flask-based web application for uploading and processing PDF and TXT files.
"""

import os
import fitz  # PyMuPDF
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'pdf', 'txt'}

# Global variable to store extracted text (in-memory storage)
global_extracted_text = ""
processed_files_count = 0


def allowed_file(filename):
    """Check if the uploaded file has an allowed extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_text_from_pdf(file_stream):
    """Extract text from PDF file using PyMuPDF."""
    try:
        # Open PDF from file stream
        pdf_document = fitz.open(stream=file_stream.read(), filetype="pdf")
        text = ""
        
        # Extract text from all pages
        for page_num in range(len(pdf_document)):
            page = pdf_document.load_page(page_num)
            text += page.get_text()
            text += "\n\n"  # Add spacing between pages
        
        pdf_document.close()
        return text.strip()
    
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        raise Exception(f"Failed to process PDF file: {str(e)}")


def extract_text_from_txt(file_stream):
    """Extract text from TXT file."""
    try:
        # Try different encodings
        encodings = ['utf-8', 'latin-1', 'cp1252']
        
        for encoding in encodings:
            try:
                file_stream.seek(0)  # Reset file pointer
                text = file_stream.read().decode(encoding)
                return text
            except UnicodeDecodeError:
                continue
        
        # If all encodings fail
        raise Exception("Unable to decode text file with supported encodings")
    
    except Exception as e:
        logger.error(f"Error extracting text from TXT: {str(e)}")
        raise Exception(f"Failed to process TXT file: {str(e)}")


@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload and processing."""
    global global_extracted_text, processed_files_count
    
    try:
        # Check if file was provided
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No file provided'
            }), 400
        
        file = request.files['file']
        
        # Check if file was selected
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No file selected'
            }), 400
        
        # Validate file type
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'message': 'Invalid file type. Only PDF and TXT files are allowed.'
            }), 400
        
        # Get file extension
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        
        logger.info(f"Processing file: {filename}")
        
        # Extract text based on file type
        if file_extension == 'pdf':
            extracted_text = extract_text_from_pdf(file)
        elif file_extension == 'txt':
            extracted_text = extract_text_from_txt(file)
        else:
            return jsonify({
                'success': False,
                'message': 'Unsupported file type'
            }), 400
        
        # Check if text was extracted
        if not extracted_text.strip():
            return jsonify({
                'success': False,
                'message': 'No text could be extracted from the file'
            }), 400
        
        # Store extracted text in global variable
        global_extracted_text = extracted_text
        processed_files_count += 1
        
        # Calculate some statistics
        word_count = len(extracted_text.split())
        char_count = len(extracted_text)
        
        logger.info(f"Successfully processed {filename}: {word_count} words, {char_count} characters")
        
        return jsonify({
            'success': True,
            'message': 'File processed successfully!',
            'stats': {
                'filename': filename,
                'word_count': word_count,
                'char_count': char_count,
                'processed_files_total': processed_files_count
            }
        }), 200
    
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@app.route('/get-text')
def get_text():
    """API endpoint to retrieve the stored extracted text."""
    global global_extracted_text
    
    if not global_extracted_text:
        return jsonify({
            'success': False,
            'message': 'No text available. Please upload a file first.'
        }), 404
    
    return jsonify({
        'success': True,
        'text': global_extracted_text,
        'length': len(global_extracted_text)
    })


@app.route('/search', methods=['POST'])
def search_text():
    """API endpoint to search through extracted text."""
    global global_extracted_text
    
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({
                'success': False,
                'message': 'Search query is required'
            }), 400
        
        if not global_extracted_text:
            return jsonify({
                'success': False,
                'message': 'No text available to search. Please upload a document first.'
            }), 404
        
        # Perform case-insensitive search
        text_lower = global_extracted_text.lower()
        query_lower = query.lower()
        
        # Find all occurrences
        matches = []
        start = 0
        while True:
            pos = text_lower.find(query_lower, start)
            if pos == -1:
                break
            
            # Extract context around the match (50 characters before and after)
            context_start = max(0, pos - 50)
            context_end = min(len(global_extracted_text), pos + len(query) + 50)
            context = global_extracted_text[context_start:context_end]
            
            matches.append({
                'position': pos,
                'context': context,
                'match_start_in_context': pos - context_start,
                'match_length': len(query)
            })
            
            start = pos + 1
        
        return jsonify({
            'success': True,
            'query': query,
            'total_matches': len(matches),
            'matches': matches[:20],  # Limit to first 20 matches
            'text_length': len(global_extracted_text)
        })
    
    except Exception as e:
        logger.error(f"Error searching text: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred while searching'
        }), 500


@app.route('/stats')
def get_stats():
    """API endpoint to get application statistics."""
    global global_extracted_text, processed_files_count
    
    return jsonify({
        'processed_files_count': processed_files_count,
        'current_text_length': len(global_extracted_text),
        'text_available': bool(global_extracted_text.strip())
    })


@app.errorhandler(413)
def too_large(e):
    """Handle file too large error."""
    return jsonify({
        'success': False,
        'message': 'File too large. Maximum size is 16MB.'
    }), 413


@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors."""
    return render_template('index.html'), 404


@app.errorhandler(500)
def internal_error(e):
    """Handle internal server errors."""
    logger.error(f"Internal server error: {str(e)}")
    return jsonify({
        'success': False,
        'message': 'Internal server error occurred'
    }), 500


if __name__ == '__main__':
    print("Starting Documind Analyzer...")
    print("Open your browser and navigate to: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
