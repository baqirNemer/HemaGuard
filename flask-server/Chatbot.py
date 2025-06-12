import os
import google.generativeai as genai
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_google_genai import GoogleGenerativeAI
from langchain import hub
from langchain.agents import Tool, AgentExecutor, create_react_agent
from langchain_community.tools import DuckDuckGoSearchRun
from typing import Dict, Any
import json
import re

# Initialize API key and LLM
try:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    
    genai.configure(api_key=api_key)
    llm = GoogleGenerativeAI(model="models/gemini-2.0-flash", google_api_key=api_key)
    print("✅ Gemini API initialized successfully")
except Exception as e:
    print(f"❌ Error initializing Gemini API: {e}")
    # Fallback: create a dummy LLM for testing
    class DummyLLM:
        def invoke(self, prompt):
            return "I'm a medical assistant. Due to API configuration issues, I'm currently in demo mode. Please consult with a healthcare professional for medical advice."
    llm = DummyLLM()

# Initialize search tools
try:
    search = DuckDuckGoSearchRun(max_results=5)
    tools = [
        Tool(
            name="Web Search",
            func=search.run,
            description="""Useful for searching authoritative medical websites to find current information about:
    - Blood diseases and disorders
    - Laboratory test interpretations
    - Medical guidelines and recommendations
    - Differential diagnoses"""
        )
    ]
    
    prompt = hub.pull("hwchase17/react")
    agent = create_react_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    print("✅ Search tools initialized successfully")
except Exception as e:
    print(f"❌ Error initializing search tools: {e}")
    # Fallback: create dummy search function
    def dummy_search(query):
        return "Search functionality temporarily unavailable. Please consult medical websites directly."
    
    class DummyAgentExecutor:
        def invoke(self, input_dict):
            return {"output": dummy_search(input_dict.get("input", ""))}
    
    agent_executor = DummyAgentExecutor()

MEDICAL_ASSISTANT_PROMPT = """You are HemaguardGPT, an AI medical assistant specializing in blood diseases and hematology. 
Your role is to help patients understand their blood test results while emphasizing the importance of professional medical advice.

**Patient Records:**
{patient_records}

**Guidelines for Record Analysis:**
1. Extract and analyze all available medical information from the records
2. Pay special attention to:
   - Doctor's notes (marked with [DoctorNote:])
   - Blood test results (marked with {{Bloodtest}})
   - Infection types
   - Anemia types and names
   - Deficiency types
3. Cross-reference patient data with normal ranges
4. Highlight significant abnormalities
5. Consider doctor's notes and expand upon them where needed
6. Suggest possible interpretations and diagnoses, without going against the official test results
7. Always tell the patient to refer to their doctor for any next steps

**For general questions:** Provide concise, accurate information (3-5 sentences)

**For record analysis requests:**
[Summary of findings from records]
[Key abnormalities and their significance]
[Possible considerations based on records]
[Explanation of doctor's notes]
[Recommended next steps based on records]
[Sources if applicable]

**Units and Ranges Database:**
{units_ranges_data}

**Medical Context from Authoritative Sources:**
{context}

**User Query:**
{text}

**Always wish the patient a speedy recovery or a healthy life at the end of your response depending on the context.**"""

prompt = ChatPromptTemplate.from_messages(
    [("system", MEDICAL_ASSISTANT_PROMPT), ("user", "{text}")]
)

# Medical Website Focus
MEDICAL_SITES = [
    "mayoclinic.org",
    "webmd.com",
    "hematology.org",
    "cdc.gov",
    "nih.gov",
    "hopkinsmedicine.org",
    "clevelandclinic.org",
    "medlineplus.gov",
    "who.int",
    "ashpublications.org",
    "ncbi.nlm.nih.gov"
]

def search_for_context(query: str) -> str:
    """Search authoritative medical websites for information"""
    try:
        sites = " OR site:".join(MEDICAL_SITES)
        search_query = f"site:{sites} {query}"
        results = agent_executor.invoke({"input": search_query})
        return results.get("output", "No search results available")
    except Exception as e:
        print(f"Search error: {e}")
        return f"Search temporarily unavailable. Please consult medical websites directly for: {query}"
    
def read_patient_data(file_path: str) -> Dict[str, Any]:
    """Read and parse the patient data JSON file"""
    try:
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as file:
                return json.load(file)
        else:
            print(f"Patient data file not found at {file_path}")
            return {}
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in patient data file at {file_path}")
        return {}
    except Exception as e:
        print(f"Error reading patient data: {str(e)}")
        return {}

def read_units_ranges(file_path: str) -> Dict[str, Dict[str, Any]]:
    """Read and parse the units and ranges JSON file"""
    try:
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as file:
                return json.load(file)
        else:
            print(f"Units/ranges file not found at {file_path}")
            return {}
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in units/ranges file at {file_path}")
        return {}
    except Exception as e:
        print(f"Error reading units/ranges: {str(e)}")
        return {}

def extract_patient_records(text: str) -> str:
    """Extract patient records from the input text if present"""
    if "User Records:" in text:
        records_part = text.split("User Records:")[1].split("User Query:")[0].strip()
        return records_part
    return ""

def get_patient_data(text: str) -> str:
    """Extract patient data if the query is about CBC analysis or records are present"""
    records = extract_patient_records(text)
    if records:
        return records
        
    cbc_keywords = ['cbc', 'blood test', 'blood results', 'complete blood count']
    if any(keyword in text.lower() for keyword in cbc_keywords):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        patient_file = os.path.join(current_dir, 'patient_data.json')
        
        patient_data = read_patient_data(patient_file)
        if not patient_data:
            return "Patient data currently unavailable"
            
        formatted_data = []
        for key, value in patient_data.items():
            if isinstance(value, bool):
                value = 'YES' if value else 'NO'
            formatted_data.append(f"{key}: {value}")
        return "\n".join(formatted_data)
    return "No patient data available for this query."

def get_units_ranges_data(text: str) -> str:
    """Extract units and ranges if the query is about CBC analysis"""
    cbc_keywords = ['cbc', 'blood test', 'blood results', 'complete blood count']
    if any(keyword in text.lower() for keyword in cbc_keywords) or extract_patient_records(text):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        ranges_file = os.path.join(current_dir, 'units_ranges.json')
        
        units_ranges = read_units_ranges(ranges_file)
        if not units_ranges:
            return "Reference ranges currently unavailable"
            
        formatted_data = []
        for test, info in units_ranges.items():
            units = info.get('units', 'N/A')
            ranges = info.get('normal_range', {})
            
            range_str = ""
            if 'Males' in ranges and 'Females' in ranges:
                range_str = f"Males: {ranges['Males']}, Females: {ranges['Females']}"
            elif 'All' in ranges:
                range_str = ranges['All']
            elif 'Interpretation' in ranges:
                range_str = ranges['Interpretation']
            
            formatted_data.append(f"{test}: {units}; Normal Range: {range_str}")
        return "\n".join(formatted_data)
    return "No units/ranges data available for this query."

# Create the chain
try:
    chain = (
        {
            "patient_records": RunnablePassthrough() | get_patient_data,
            "units_ranges_data": RunnablePassthrough() | get_units_ranges_data,
            "context": RunnablePassthrough() | search_for_context,
            "text": RunnablePassthrough()
        }
        | prompt
        | llm
    )
    print("✅ Chatbot chain created successfully")
except Exception as e:
    print(f"❌ Error creating chatbot chain: {e}")
    # Create a fallback chain
    def simple_chain_invoke(text):
        return "Hello! I'm HemaguardGPT, your medical assistant. Due to technical issues, I'm currently in limited mode. Please consult with a healthcare professional for medical advice. Stay healthy!"
    
    class SimpleChain:
        def invoke(self, text):
            return simple_chain_invoke(text)
    
    chain = SimpleChain()

# Test the chain if this file is run directly
if __name__ == "__main__":
    try:
        test_records = """[DoctorNote:"Patient shows signs of iron deficiency"]
[{{Bloodtest}}GENDER:"0"/WBC:"20.87"/NE:"18.43"/LY:"1.56"/MO:"0.8"/EO:"0.08"/RBC:"5.2"/HGB:"8.62"/MCV:"70.11"/MCH:"19.23"/MCHC:"29.67"/FERRITIN:"40.56"/FOLATE:"9.75"/B12:"175.89"]
[InfectionType:{"BACTERIAL INFECTION":true}]
[AnemiaType:{"HYPOCHROMIC ANEMIA":true,"MICROCYTIC ANEMIA":true}]
[DeficiencyType:{"VITAMIN B12 DEFICIENCY":true}]
[AnemiaName:{"ANEMIA OF CHRONIC DISEASE":true}]"""
        
        test_queries = [
            f"User Records:\n{test_records}\n\nUser Query: Can you analyze my records?",
            f"User Records:\n{test_records}\n\nUser Query: What do my blood test results mean?",
            "Hello! What are your top 5 recommendations for a male patient suffering from SCD?",
            "Hi, how are you?"
        ]
        
        for query in test_queries:
            print(f"\n🔹 Testing query: {query}")
            try:
                response = chain.invoke(query)
                print(f"✅ Response: {response}\n")
            except Exception as e:
                print(f"❌ Error with query '{query}': {e}\n")
                
    except Exception as e:
        print(f"❌ Error in testing: {e}")