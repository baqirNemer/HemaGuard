from flask import Flask, request, jsonify, send_from_directory
import os
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)

# Enable CORS
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def home():
    """Home page with instructions."""
    return "<h1>Welcome to the File Upload Service</h1><p>Use POST /upload to upload files, or visit /uploads/<filename> to view uploaded files.</p>", 200

@app.route('/upload', methods=['GET', 'POST'])
def upload_image():
    """Handle file uploads and provide feedback for GET requests."""
    if request.method == 'GET':
        return jsonify({'message': 'Use POST to upload an image'}), 200
    elif request.method == 'POST':
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        # Save the uploaded file
        file = request.files['file']
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)  # Ensure the uploads directory exists
        file.save(file_path)

        # Return success response with image URL
        return jsonify({'message': 'File uploaded successfully', 'imageUrl': f'/uploads/{file.filename}'}), 200

@app.route('/uploads/<filename>')
def serve_uploaded_file(filename):
    """Serve uploaded files."""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Main function to run the Flask app
if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)  # Ensure the uploads directory exists
    app.run(debug=True, host='0.0.0.0', port=5001)
