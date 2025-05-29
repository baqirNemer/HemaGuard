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
Only use the response structure specified below when analyzing a CBC blood test record. Otherwise, feel free to structure the response according to the user query.
Always wish the patient a speedy recovery or a healthy life at the end of your response depending on the context of his query.

**Guidelines:**
1. For general questions: Provide concise, accurate information (3-5 sentences)
2. For CBC analysis requests:
   - Cross-reference patient data with normal ranges
   - Highlight significant abnormalities
   - Consider doctor's notes, and expand upon them where needed
   - Suggest possible interpretations and diagnoses, without going against the official test results
3. Should you require additional information in either scenario, always check authoritative sources and websites
4. Always tell the patient to refer to his doctor for any next steps
5. Cite your sources when using external information

**Patient Database:**
{patient_data}

**Units and Ranges Database:**
{units_ranges_data}

**Medical Context from Authoritative Sources:**
{context}

**User Query:**
{text}

**Response Structure:**
[Summary of findings]
[Key abnormalities]
[Possible considerations]
[Doctor's note explanation]
[Recommended next steps]
[Sources if applicable]"""

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

def get_patient_data(text: str) -> str:
    """Extract patient data if the query is about CBC analysis"""
    cbc_keywords = ['cbc', 'blood test', 'blood results', 'complete blood count']
    if any(keyword in text.lower() for keyword in cbc_keywords):
        # Get absolute path to ensure file is found
        current_dir = os.path.dirname(os.path.abspath(__file__))
        patient_file = os.path.join(current_dir, 'patient_data.json')
        
        patient_data = read_patient_data(patient_file)
        if not patient_data:
            return "Patient data currently unavailable"
            
        # Format the data for display
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
    if any(keyword in text.lower() for keyword in cbc_keywords):
        # Get absolute path to ensure file is found
        current_dir = os.path.dirname(os.path.abspath(__file__))
        ranges_file = os.path.join(current_dir, 'units_ranges.json')
        
        units_ranges = read_units_ranges(ranges_file)
        if not units_ranges:
            return "Reference ranges currently unavailable"
            
        # Format the data for display
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
            "patient_data": RunnablePassthrough() | get_patient_data,
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
        test_queries = [
            "Hello! Can you help me analyze my latest CBC blood test results and give me recommendations?",
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