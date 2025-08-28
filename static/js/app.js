/**
 * Documind Analyzer - JavaScript Application
 * Handles file upload, modal interactions, and user feedback
 */

class DocumentProcessor {
    constructor() {
        this.modal = document.getElementById('uploadModal');
        this.overlay = document.getElementById('overlay');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.closeModal = document.getElementById('closeModal');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.uploadForm = document.getElementById('uploadForm');
        this.fileInput = document.getElementById('fileInput');
        this.fileLabel = document.querySelector('.file-input-label');
        this.fileName = document.getElementById('fileName');
        this.processBtn = document.getElementById('processBtn');
        this.spinner = document.getElementById('spinner');
        this.btnText = document.getElementById('btnText');
        this.messageContainer = document.getElementById('messageContainer');
        this.statsSection = document.getElementById('statsSection');
        
        // Search elements
        this.searchSection = document.getElementById('searchSection');
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.searchResults = document.getElementById('searchResults');
        
        this.initializeEventListeners();
        this.loadStats();
    }

    initializeEventListeners() {
        // Modal controls
        this.uploadBtn.addEventListener('click', () => this.openModal());
        this.closeModal.addEventListener('click', () => this.closeModalHandler());
        this.cancelBtn.addEventListener('click', () => this.closeModalHandler());
        
        // File input handling
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop functionality
        this.fileLabel.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.fileLabel.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.fileLabel.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Form submission
        this.uploadForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Search functionality
        this.searchBtn.addEventListener('click', () => this.performSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        this.searchInput.addEventListener('input', (e) => {
            if (e.target.value.trim() === '') {
                this.clearSearchResults();
            }
        });
        
        // Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModalHandler();
            }
        });
        
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.open) {
                this.closeModalHandler();
            }
        });
    }

    openModal() {
        this.modal.showModal();
        this.resetForm();
        this.fileInput.focus();
    }

    closeModalHandler() {
        this.modal.close();
        this.resetForm();
    }

    resetForm() {
        this.uploadForm.reset();
        this.fileName.style.display = 'none';
        this.fileName.textContent = '';
        this.hideMessage();
        this.setProcessingState(false);
        this.fileLabel.classList.remove('drag-over');
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        this.displaySelectedFile(file);
    }

    handleDragOver(event) {
        event.preventDefault();
        this.fileLabel.classList.add('drag-over');
    }

    handleDragLeave(event) {
        event.preventDefault();
        this.fileLabel.classList.remove('drag-over');
    }

    handleDrop(event) {
        event.preventDefault();
        this.fileLabel.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            
            // Validate file type
            if (this.isValidFileType(file)) {
                this.fileInput.files = files;
                this.displaySelectedFile(file);
            } else {
                this.showMessage('Invalid file type. Only PDF and TXT files are allowed.', 'error');
            }
        }
    }

    displaySelectedFile(file) {
        if (file) {
            const fileSize = this.formatFileSize(file.size);
            this.fileName.textContent = `${file.name} (${fileSize})`;
            this.fileName.style.display = 'block';
        }
    }

    isValidFileType(file) {
        const allowedTypes = ['.pdf', '.txt'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        return allowedTypes.includes(fileExtension);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(this.uploadForm);
        const file = formData.get('file');
        
        if (!file || file.size === 0) {
            this.showMessage('Please select a file to process.', 'error');
            return;
        }

        // Validate file size (16MB limit)
        if (file.size > 16 * 1024 * 1024) {
            this.showMessage('File size exceeds 16MB limit.', 'error');
            return;
        }

        // Validate file type
        if (!this.isValidFileType(file)) {
            this.showMessage('Invalid file type. Only PDF and TXT files are allowed.', 'error');
            return;
        }

        this.setProcessingState(true);
        this.hideMessage();

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage('File processed successfully! Text has been extracted and stored.', 'success');
                this.updateStats(result.stats);
                
                // Enable search functionality after successful upload
                this.searchInput.disabled = false;
                this.searchBtn.disabled = false;
                this.searchInput.placeholder = "Search through extracted text...";
                
                // Auto-close modal after success
                setTimeout(() => {
                    this.closeModalHandler();
                }, 2000);
                
            } else {
                this.showMessage(result.message || 'An error occurred while processing the file.', 'error');
            }

        } catch (error) {
            console.error('Upload error:', error);
            this.showMessage('Network error. Please check your connection and try again.', 'error');
        } finally {
            this.setProcessingState(false);
        }
    }

    setProcessingState(processing) {
        if (processing) {
            this.processBtn.disabled = true;
            this.spinner.style.display = 'inline-block';
            this.btnText.textContent = 'Processing...';
        } else {
            this.processBtn.disabled = false;
            this.spinner.style.display = 'none';
            this.btnText.textContent = 'Process Document';
        }
    }

    showMessage(message, type) {
        this.messageContainer.textContent = message;
        this.messageContainer.className = `message-container ${type}`;
        this.messageContainer.style.display = 'block';
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                this.hideMessage();
            }, 5000);
        }
    }

    hideMessage() {
        this.messageContainer.style.display = 'none';
        this.messageContainer.className = 'message-container';
    }

    async loadStats() {
        try {
            const response = await fetch('/stats');
            const stats = await response.json();
            
            if (stats.processed_files_count > 0) {
                this.updateStatsDisplay(stats);
                this.statsSection.style.display = 'block';
            }
            
            // Update search section state based on available text
            if (stats.text_available) {
                this.searchInput.disabled = false;
                this.searchBtn.disabled = false;
                this.searchInput.placeholder = "Search through extracted text...";
            } else {
                this.searchInput.disabled = true;
                this.searchBtn.disabled = true;
                this.searchInput.placeholder = "Upload a document first to enable search...";
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    updateStats(stats) {
        if (stats) {
            const currentStats = {
                processed_files_count: stats.processed_files_total,
                current_text_length: stats.char_count,
                word_count: stats.word_count
            };
            
            this.updateStatsDisplay(currentStats);
            this.statsSection.style.display = 'block';
            
            // Search section is always visible now, no need to show/hide
            // Just scroll to stats section for user feedback
            this.statsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }
    }

    async performSearch() {
        const query = this.searchInput.value.trim();
        
        if (!query) {
            this.displaySearchError('Please enter a search term');
            return;
        }

        if (query.length < 2) {
            this.displaySearchError('Search term must be at least 2 characters');
            return;
        }

        // Check if search input is disabled (no text available)
        if (this.searchInput.disabled) {
            this.displaySearchError('Please upload a document first to enable search functionality');
            return;
        }

        this.setSearchLoading(true);
        this.clearSearchResults();

        try {
            const response = await fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query })
            });

            const result = await response.json();

            if (result.success) {
                this.displaySearchResults(result);
            } else {
                this.displaySearchError(result.message || 'Search failed');
            }

        } catch (error) {
            console.error('Search error:', error);
            this.displaySearchError('Network error. Please check your connection and try again.');
        } finally {
            this.setSearchLoading(false);
        }
    }

    setSearchLoading(loading) {
        if (loading) {
            this.searchBtn.disabled = true;
            this.searchBtn.querySelector('.search-text').textContent = 'Searching...';
            this.searchBtn.querySelector('.search-icon').textContent = '⏳';
        } else {
            this.searchBtn.disabled = false;
            this.searchBtn.querySelector('.search-text').textContent = 'Search';
            this.searchBtn.querySelector('.search-icon').textContent = '🔍';
        }
    }

    displaySearchResults(result) {
        const { query, total_matches, matches } = result;

        if (total_matches === 0) {
            this.searchResults.innerHTML = `
                <div class="search-no-results">
                    No matches found for "${query}"
                </div>
            `;
            return;
        }

        let html = `
            <div class="search-result-header">
                Found ${total_matches} match${total_matches !== 1 ? 'es' : ''} for "${query}"
                ${total_matches > 20 ? ' (showing first 20)' : ''}
            </div>
        `;

        matches.forEach((match, index) => {
            const context = this.highlightSearchTerm(match.context, query, match.match_start_in_context, match.match_length);
            html += `
                <div class="search-result-item">
                    <div class="search-result-position">#${index + 1}</div>
                    <div class="search-result-text">${context}</div>
                </div>
            `;
        });

        this.searchResults.innerHTML = html;
    }

    highlightSearchTerm(context, query, startPos, length) {
        const before = context.substring(0, startPos);
        const match = context.substring(startPos, startPos + length);
        const after = context.substring(startPos + length);
        
        return `${this.escapeHtml(before)}<span class="search-highlight">${this.escapeHtml(match)}</span>${this.escapeHtml(after)}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    displaySearchError(message) {
        this.searchResults.innerHTML = `
            <div class="search-error">
                ${message}
            </div>
        `;
    }

    clearSearchResults() {
        this.searchResults.innerHTML = '';
    }

    updateStatsDisplay(stats) {
        const filesProcessed = document.getElementById('filesProcessed');
        const wordsExtracted = document.getElementById('wordsExtracted');
        const charactersExtracted = document.getElementById('charactersExtracted');
        
        if (filesProcessed) {
            this.animateNumber(filesProcessed, parseInt(filesProcessed.textContent) || 0, stats.processed_files_count);
        }
        
        if (stats.word_count && wordsExtracted) {
            this.animateNumber(wordsExtracted, parseInt(wordsExtracted.textContent) || 0, stats.word_count);
        }
        
        if (charactersExtracted) {
            this.animateNumber(charactersExtracted, parseInt(charactersExtracted.textContent) || 0, stats.current_text_length);
        }
    }

    animateNumber(element, start, end, duration = 1000) {
        const range = end - start;
        const increment = range / (duration / 16); // 60fps
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }

    // Utility method to get extracted text (for potential future use)
    async getExtractedText() {
        try {
            const response = await fetch('/get-text');
            const result = await response.json();
            
            if (result.success) {
                return result.text;
            } else {
                console.warn('No text available:', result.message);
                return null;
            }
        } catch (error) {
            console.error('Error getting extracted text:', error);
            return null;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DocumentProcessor();
    
    // Add some visual flair - subtle animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    // Observe elements for animation
    document.querySelectorAll('.stat-card, .hero-section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add some Easter eggs and enhancements
document.addEventListener('keydown', (e) => {
    // Konami code or special shortcuts can be added here
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        console.log('🚀 Documind Analyzer Developer Console');
        console.log('Built with ❤️ using Flask, PyMuPDF, and modern web technologies');
    }
});

// Service Worker registration for potential PWA features (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker registration can be added here for offline functionality
        console.log('Documind Analyzer ready for enhanced features');
    });
}
