from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from Chatbot import chain
import json
import os
from pathlib import Path

chatbot_api = Blueprint('chatbot_api', __name__)

def ensure_records_file():
    """Ensure the records file exists and is valid JSON"""
    records_file = Path(__file__).parent / 'user_records.json'
    try:
        if not records_file.exists():
            records_file.write_text('{}')
        # Verify valid JSON
        with open(records_file, 'r') as f:
            json.load(f)
    except Exception as e:
        print(f"Error ensuring records file: {e}")
        # Try to recreate if corrupted
        try:
            records_file.write_text('{}')
        except Exception as e:
            print(f"Failed to recreate records file: {e}")
            raise

@chatbot_api.route('/chat', methods=['POST', 'OPTIONS'])
@cross_origin()
def chat():
    try:
        ensure_records_file()
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        user_message = data.get('message', '').strip()
        user_email = data.get('email', '').strip()
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        # Load user records if email is provided
        user_records = ""
        if user_email:
            try:
                records_file = Path(__file__).parent / 'user_records.json'
                with open(records_file, 'r') as f:
                    all_records = json.load(f)
                    user_records = all_records.get(user_email, "").strip()
            except Exception as e:
                print(f"Error loading records: {e}")
                # Continue without records
        
        # Prepare the input
        if user_records:
            input_text = f"User Records:\n{user_records}\n\nUser Query: {user_message}"
        else:
            input_text = user_message
        
        try:
            response = chain.invoke(input_text)
            return jsonify({
                'response': str(response),
                'status': 'success'
            })
        except Exception as e:
            print(f"Chain invocation error: {e}")
            return jsonify({
                'error': 'Failed to process message',
                'details': str(e)
            }), 500
            
    except Exception as e:
        print(f"Unexpected error in chat endpoint: {e}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@chatbot_api.route('/update-records', methods=['POST'])
@cross_origin()
def update_records():
    try:
        ensure_records_file()
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        user_email = data.get('email', '').strip()
        records = data.get('records', '').strip()
        
        if not user_email or not records:
            return jsonify({'error': 'Email and records are required'}), 400
            
        records_file = Path(__file__).parent / 'user_records.json'
        
        # Load existing records
        try:
            with open(records_file, 'r') as f:
                existing_records = json.load(f)
        except Exception as e:
            print(f"Error loading existing records: {e}")
            existing_records = {}
        
        # Update records
        existing_records[user_email] = records
        
        # Save back to file
        try:
            with open(records_file, 'w') as f:
                json.dump(existing_records, f, indent=2)
        except Exception as e:
            print(f"Error saving records: {e}")
            return jsonify({'error': 'Failed to save records'}), 500
            
        return jsonify({
            'message': 'Records updated successfully',
            'status': 'success'
        }), 200
        
    except Exception as e:
        print(f"Unexpected error in update-records: {e}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500