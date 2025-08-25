# 📄 Documind Analyzer

A premium document upload and processing web application built with Flask and PyMuPDF. Extract text from PDF and TXT files with a modern, responsive user interface.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)
![PyMuPDF](https://img.shields.io/badge/PyMuPDF-1.23.14-red.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

- **Premium UI/UX**: Modern, responsive design with smooth animations
- **Drag & Drop Upload**: Intuitive file upload with drag and drop support
- **PDF Text Extraction**: Advanced text extraction using PyMuPDF (fitz)
- **Real-time Processing**: AJAX-based file upload with live progress feedback
- **File Validation**: Comprehensive file type and size validation
- **Statistics Dashboard**: Live stats showing processed files and extracted content
- **Mobile Responsive**: Works perfectly on desktop and mobile devices
- **Error Handling**: Robust error handling with user-friendly messages
- **In-Memory Storage**: Fast text storage and retrieval

## 🛠️ Technology Stack

- **Backend**: Flask (Python web framework)
- **PDF Processing**: PyMuPDF (fitz) for text extraction
- **Frontend**: Vanilla JavaScript, Modern CSS3, HTML5
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Typography**: Inter font family for premium look

## 📁 Project Structure

```
documind_analyzer/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # Project documentation
├── static/
│   ├── css/
│   │   └── style.css     # Premium CSS styling
│   └── js/
│       └── app.js        # JavaScript functionality
└── templates/
    └── index.html        # Main HTML template
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Clone or download the project**:
   ```bash
   cd documind_analyzer
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   python app.py
   ```

4. **Open your browser**:
   Navigate to `http://localhost:5000`

## 📋 Detailed Setup Instructions

### Windows Setup

```powershell
# Navigate to the project directory
cd documind_analyzer

# Create a virtual environment (recommended)
python -m venv venv

# Activate the virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

### macOS/Linux Setup

```bash
# Navigate to the project directory
cd documind_analyzer

# Create a virtual environment (recommended)
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

## 🎯 Usage

1. **Start the Application**: Run `python app.py` and open `http://localhost:5000`

2. **Upload a Document**: 
   - Click the "Upload Document" button
   - Select a PDF or TXT file (max 16MB)
   - Or drag and drop a file into the upload area

3. **Process the File**: 
   - Click "Process Document" to extract text
   - Watch the loading animation during processing
   - See success confirmation and statistics

4. **View Statistics**: 
   - Check the stats dashboard for processing metrics
   - See total files processed, words, and characters extracted

## 🔧 Configuration

### File Upload Limits

- **Maximum file size**: 16MB
- **Supported formats**: PDF, TXT
- **Concurrent uploads**: Single file processing

### Server Configuration

The application runs on:
- **Host**: `0.0.0.0` (accessible from network)
- **Port**: `5000`
- **Debug mode**: Enabled (disable in production)

To change server settings, modify `app.py`:

```python
app.run(debug=False, host='127.0.0.1', port=8080)
```

## 🔍 API Endpoints

### Main Routes

- `GET /` - Serve the main application page
- `POST /upload` - Handle file upload and processing
- `GET /get-text` - Retrieve stored extracted text
- `GET /stats` - Get application statistics

### API Response Format

**Success Response**:
```json
{
    "success": true,
    "message": "File processed successfully!",
    "stats": {
        "filename": "document.pdf",
        "word_count": 1250,
        "char_count": 7830,
        "processed_files_total": 5
    }
}
```

**Error Response**:
```json
{
    "success": false,
    "message": "Invalid file type. Only PDF and TXT files are allowed."
}
```

## 🎨 UI Features

### Modern Design Elements

- **Gradient backgrounds** with subtle color transitions
- **Card-based layout** with elegant shadows
- **Modal dialogs** with backdrop blur effects
- **Smooth animations** and micro-interactions
- **Responsive grid system** for all screen sizes

### Interactive Elements

- **Hover effects** on buttons and cards
- **Loading animations** during processing
- **File drag-and-drop** visual feedback
- **Progress indicators** for user actions
- **Toast notifications** for status updates

## 🔒 Security Features

- **File type validation** on both client and server
- **File size limits** to prevent abuse
- **Secure filename handling** using Werkzeug
- **Input sanitization** for all user inputs
- **Error message sanitization** to prevent information leakage

## 🐛 Troubleshooting

### Common Issues

1. **ImportError: No module named 'fitz'**
   ```bash
   pip install PyMuPDF
   ```

2. **Permission denied errors**
   ```bash
   # Run with appropriate permissions or use virtual environment
   python -m venv venv
   ```

3. **Port already in use**
   ```bash
   # Change port in app.py or kill existing process
   netstat -ano | findstr :5000  # Windows
   lsof -ti:5000 | xargs kill   # macOS/Linux
   ```

4. **Large file processing timeout**
   - Reduce file size or increase server timeout
   - Files over 16MB are automatically rejected

### Debug Mode

Enable detailed error logging by setting:
```python
app.config['DEBUG'] = True
logging.basicConfig(level=logging.DEBUG)
```

## 🚀 Production Deployment

For production deployment:

1. **Disable debug mode**:
   ```python
   app.run(debug=False)
   ```

2. **Use a production WSGI server**:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

3. **Set environment variables**:
   ```bash
   export FLASK_ENV=production
   export FLASK_DEBUG=False
   ```

4. **Configure reverse proxy** (nginx/Apache)
5. **Set up SSL/HTTPS** for secure file uploads
6. **Implement proper logging** and monitoring

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

### Development Setup

1. Fork the repository
2. Create a virtual environment
3. Install dependencies: `pip install -r requirements.txt`
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Flask** - Lightweight and powerful web framework
- **PyMuPDF** - Excellent PDF processing library
- **Inter Font** - Beautiful typography
- **Modern CSS** - For responsive design patterns

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using Flask, PyMuPDF, and modern web technologies.**
