import os
import numpy as np
import cv2
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.resnet_v2 import ResNet152V2, preprocess_input
from ultralytics import YOLO

# Parameters
img_width, img_height = 224, 224
img_labels = ['blood', 'non-blood']
classification_model_path = 'models/BloodTest_Classification_model_ResNet152V2.keras'
detection_model_path = "models/best.pt"
UPLOAD_FOLDER = 'uploads'
DETECTION_OUTPUT_FOLDER = 'detection_outputs'

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DETECTION_OUTPUT_FOLDER, exist_ok=True)

# Load models
keras_model = load_model(classification_model_path)
conv_base = ResNet152V2(include_top=False, weights='imagenet', input_shape=(224, 224, 3))
detection_model = YOLO(detection_model_path)

# Routes
@app.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    try:
        # Preprocess and classify image
        img = preprocess_image(file_path)
        if img is None:
            return jsonify({'error': 'Failed to process image'}), 400

        features = extract_features(img)
        features = features.reshape(-1, 7, 7, 2048)
        keras_prediction = keras_model.predict(features)[0]
        keras_predicted_index = np.argmax(keras_prediction)
        keras_predicted_label = img_labels[keras_predicted_index]
        keras_predicted_confidence = keras_prediction[keras_predicted_index] * 100

        # If classification is "blood", perform detection
        detection_results = None
        if keras_predicted_label == 'blood':
            detection_results = perform_detection(file_path)

        return jsonify({
            'uploaded_image_url': f"http://127.0.0.1:5001/uploads/{file.filename}",
            'result': keras_predicted_label,
            'confidence': keras_predicted_confidence,
            'detection': detection_results
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

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

    # Save annotated image
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
