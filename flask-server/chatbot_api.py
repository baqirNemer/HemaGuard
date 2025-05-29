from flask import Blueprint, request, jsonify
import os
import sys

# Ensure the chatbot code is importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import your chatbot chain
from Chatbot import chain  

chatbot_api = Blueprint('chatbot_api', __name__)

@chatbot_api.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    try:
        response = chain.invoke(user_message)
        # If response is a dict or object, convert to string
        if isinstance(response, dict):
            response_text = response.get("output", str(response))
        else:
            response_text = str(response)
        return jsonify({'response': response_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
