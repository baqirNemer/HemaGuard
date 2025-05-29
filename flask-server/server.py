import os
import numpy as np
import cv2
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.resnet_v2 import ResNet152V2, preprocess_input
from ultralytics import YOLO
import tempfile
from werkzeug.utils import secure_filename

from dotenv import load_dotenv
load_dotenv()

from pdf_extraction_prediction import process_pdf

img_width, img_height = 224, 224
img_labels = ['blood', 'non-blood']
classification_model_path = 'models/BloodTest_Classification_model_ResNet152V2.keras'
detection_model_path = "models/best.pt"
UPLOAD_FOLDER = 'uploads'
DETECTION_OUTPUT_FOLDER = 'detection_outputs'
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg'}
ALLOWED_PDF_EXTENSIONS = {'pdf'}

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DETECTION_OUTPUT_FOLDER, exist_ok=True)

keras_model = load_model(classification_model_path)
conv_base = ResNet152V2(include_top=False, weights='imagenet', input_shape=(224, 224, 3))
detection_model = YOLO(detection_model_path)

def allowed_file(filename, file_type='image'):
    extensions = ALLOWED_IMAGE_EXTENSIONS if file_type == 'image' else ALLOWED_PDF_EXTENSIONS
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in extensions

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if allowed_file(file.filename, 'image'):
        return process_image(file)
    elif allowed_file(file.filename, 'pdf'):
        return process_pdf_file(file)
    else:
        return jsonify({'error': 'Unsupported file type'}), 400

@app.route('/process-pdf', methods=['POST'])
def process_pdf_api():
    if 'pdf' not in request.files:
        return jsonify({'error': 'No PDF uploaded'}), 400
    
    file = request.files['pdf']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Check if it's a PDF file
    if not allowed_file(file.filename, 'pdf'):
        return jsonify({'error': 'File must be a PDF'}), 400
    
    filepath = None
    try:
        # Save to temporary file
        filename = secure_filename(file.filename)
        filepath = os.path.join(tempfile.gettempdir(), filename)
        file.save(filepath)
        
        print(f"✅ PDF saved to: {filepath}")
        
        # Process the PDF using your existing function
        results = process_pdf(filepath)
        
        if results is None:
            return jsonify({'error': 'Failed to process PDF - no results returned'}), 500
        
        print(f"✅ PDF processed successfully: {results}")
        
        return jsonify({
            'message': 'PDF processed successfully',
            'values': results.get('values', {}),
            'infection_type': results.get('infection_type'),
            'anemia_type': results.get('anemia_type'),
            'deficiency_type': results.get('deficiency_type'),
            'anemia_name': results.get('anemia_name')
        }), 200
        
    except Exception as e:
        error_message = str(e)
        print(f"❌ Error processing PDF: {error_message}")
        
        # Check if it's a LangChain template error
        if "ChatPromptTemplate" in error_message or "missing variables" in error_message:
            return jsonify({
                'error': 'PDF processing temporarily unavailable due to template configuration. Please try again later or contact support.',
                'technical_error': error_message
            }), 500
        
        return jsonify({'error': f'Failed to process PDF: {error_message}'}), 500
        
    finally:
        # Clean up the temporary file
        if filepath and os.path.exists(filepath):
            try:
                os.remove(filepath)
                print(f"✅ Cleaned up temp file: {filepath}")
            except Exception as cleanup_error:
                print(f"Warning: Could not clean up temp file {filepath}: {cleanup_error}")

def process_image(file):
    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        img = preprocess_image(file_path)
        if img is None:
            return jsonify({'error': 'Failed to process image'}), 400
        features = extract_features(img)
        features = features.reshape(-1, 7, 7, 2048)
        keras_prediction = keras_model.predict(features)[0]
        keras_predicted_index = np.argmax(keras_prediction)
        keras_predicted_label = img_labels[keras_predicted_index]
        keras_predicted_confidence = keras_prediction[keras_predicted_index] * 100
        detection_results = None
        if keras_predicted_label == 'blood':
            detection_results = perform_detection(file_path)
        return jsonify({
            'type': 'image',
            'uploaded_file_url': f"http://127.0.0.1:5001/uploads/{file.filename}",
            'result': keras_predicted_label,
            'confidence': keras_predicted_confidence,
            'detection': detection_results
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def process_pdf_file(file):
    try:
        filename = secure_filename(file.filename)
        filepath = os.path.join(tempfile.gettempdir(), filename)
        file.save(filepath)
        results = process_pdf(filepath)
        if results is None:
            return jsonify({'error': 'Failed to process PDF'}), 500
        return jsonify({
            'type': 'pdf',
            'results': results
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        try:
            os.remove(filepath)
        except Exception:
            pass

def preprocess_image(img_path):
    img = cv2.imread(img_path)
    if img is not None:
        img = cv2.resize(img, (img_width, img_height))
        img = img.astype('float32') / 255.0
        img = np.expand_dims(img, axis=0)
        return img
    else:
        return None

def extract_features(img):
    features = conv_base.predict(img)
    return features

def perform_detection(image_path):
    results = detection_model(image_path)
    annotated_image_path = os.path.join(DETECTION_OUTPUT_FOLDER, os.path.basename(image_path))
    annotated_image_url = f"http://127.0.0.1:5001/detection/{os.path.basename(annotated_image_path)}"
    detections = []
    for box in results[0].boxes:
        detections.append({
            'class_id': int(box.cls.item()),
            'confidence': float(box.conf.item()),
            'bbox': [float(coord) for coord in box.xyxy[0].tolist()]
        })
    cv2.imwrite(annotated_image_path, results[0].plot())
    return {
        'annotated_image_url': annotated_image_url,
        'detections': detections
    }

@app.route('/uploads/<filename>')
def serve_upload_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/detection/<filename>')
def serve_detection_file(filename):
    return send_from_directory(DETECTION_OUTPUT_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)