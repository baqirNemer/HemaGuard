# chatbot_api.py (Blueprint File)
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from Chatbot import chain  # Import your chatbot chain

chatbot_api = Blueprint('chatbot_api', __name__)

@chatbot_api.route('/chat', methods=['POST', 'OPTIONS'])
@cross_origin()  # Enable CORS for this specific route
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    try:
        response = chain.invoke(user_message)
        return jsonify({'response': str(response)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
