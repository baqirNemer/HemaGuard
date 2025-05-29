import re
import os
import json
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import GoogleGenerativeAI
import google.generativeai as genai
import joblib
import numpy as np

api_key = os.environ["GEMINI_API_KEY"]
genai.configure(api_key=api_key)

llm = GoogleGenerativeAI(model="models/gemini-2.0-flash", google_api_key=api_key)

system_template = """Extract all CBC blood test values as valid JSON:
{text}

Return EXACTLY this format with float values:
{{{{
    "numeric_param": float_value,
    "non_numeric_param": "string_value"
}}}}
If any value is missing, return null for that field."""

prompt_template = ChatPromptTemplate.from_messages(
    [("system", system_template), ("user", "{text}")]
)
chain = prompt_template | llm

# Load ML models
infection_type_model = joblib.load("./models/infection_type_model.joblib")
anemia_type_model = joblib.load("./models/anemia_type_model.joblib")
deficiency_type_model = joblib.load("./models/deficiency_type_model.joblib")
anemia_name_model = joblib.load("./models/anemia_name_model.joblib")

INFECTIONS_TYPES = [
    'BACTERIAL INFECTION',
    'VIRAL INFECTION',
    'CHRONIC INFLAMMATION',
    'PARASTIC INFECTION'
]
ANEMIA_TYPES = [
    'NORMOCHROMIC ANEMIA',
    'HYPOCHROMIC ANEMIA',
    'NORMOCYTIC ANEMIA',
    'MICROCYTIC ANEMIA',
    'MACROCYTIC ANEMIA'
]
DEFICIENCY_TYPES = [
    'FOLATE DEFICIENCY',
    'VITAMIN B12 DEFICIENCY'
]
ANEMIA_NAMES = [
    'IRON DEFICIENCY ANEMIA',
    'THALASSEMIA',
    'ANEMIA OF CHRONIC DISEASE'
]

def predict_infection_type(WBC, NE, LY, MO, EO):
    features = [
        float(WBC) if WBC is not None else 0,
        float(NE) if NE is not None else 0,
        float(LY) if LY is not None else 0,
        float(MO) if MO is not None else 0,
        float(EO) if EO is not None else 0
    ]
    prediction = infection_type_model.predict([features])[0]
    return {name: bool(value) for name, value in zip(INFECTIONS_TYPES, prediction)}

def predict_anemia_type(MCV, MCH, MCHC):
    features = [
        float(MCV) if MCV is not None else 0,
        float(MCH) if MCH is not None else 0,
        float(MCHC) if MCHC is not None else 0
    ]
    prediction = anemia_type_model.predict([features])[0]
    return {name: bool(value) for name, value in zip(ANEMIA_TYPES, prediction)}

def predict_deficiency_type(FOLATE, B12):
    features = [
        float(FOLATE) if FOLATE is not None else 0,
        float(B12) if B12 is not None else 0
    ]
    prediction = deficiency_type_model.predict([features])[0]
    return {name: bool(value) for name, value in zip(DEFICIENCY_TYPES, prediction)}

def predict_anemia_name(GENDER, HGB, FERRITTE, MENTZER_INDEX, NORMOCHROMIC_ANEMIA,
          HYPOCHROMIC_ANEMIA, NORMOCYTIC_ANEMIA, MICROCYTIC_ANEMIA, MACROCYTIC_ANEMIA):
    features = [
        int(GENDER) if GENDER is not None else -1,
        float(HGB) if HGB is not None else 0,
        float(FERRITTE) if FERRITTE is not None else 0,
        float(MENTZER_INDEX) if MENTZER_INDEX is not None else 0,
        int(NORMOCHROMIC_ANEMIA) if NORMOCHROMIC_ANEMIA is not None else 0,
        int(HYPOCHROMIC_ANEMIA) if HYPOCHROMIC_ANEMIA is not None else 0,
        int(NORMOCYTIC_ANEMIA) if NORMOCYTIC_ANEMIA is not None else 0,
        int(MICROCYTIC_ANEMIA) if MICROCYTIC_ANEMIA is not None else 0,
        int(MACROCYTIC_ANEMIA) if MACROCYTIC_ANEMIA is not None else 0
    ]
    prediction = anemia_name_model.predict([features])[0]
    return {name: bool(value) for name, value in zip(ANEMIA_NAMES, prediction)}

def process_pdf(pdf_path):
    try:
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        
        pages = PyPDFLoader(pdf_path).load()
        text = "\n".join([p.page_content for p in pages])
        
        result = chain.invoke({"text": text})
        
        json_match = re.search(r'\{[\s\S]*\}', result)
        if not json_match:
            raise ValueError(f"No JSON found in response: {result}")
        
        values = json.loads(json_match.group())

        # Calculate Mentzer Index if possible
        if "MCV" in values and "RBC" in values:
            try:
                mcv = float(values["MCV"])
                rbc = float(values["RBC"])
                values["MENTZER_INDEX"] = round(mcv / rbc, 2) if rbc != 0 else None
            except (ValueError, TypeError):
                values["MENTZER_INDEX"] = None

        if "GENDER" in values:
            values["GENDER"] = 0 if str(values["GENDER"]).strip().lower() == "male" else 1
        else:
            values["GENDER"] = None

        results = {
            "values": values,
            "infection_type": None,
            "anemia_type": None,
            "deficiency_type": None,
            "anemia_name": None
        }

        infection_params = ["WBC", "NE", "LY", "MO", "EO"]
        if all(param in values for param in infection_params):
            results["infection_type"] = predict_infection_type(
                values["WBC"],
                values["NE"],
                values["LY"],
                values["MO"],
                values["EO"]
            )

        anemia_type_params = ["MCV", "MCH", "MCHC"]
        if all(param in values for param in anemia_type_params):
            results["anemia_type"] = predict_anemia_type(
                values["MCV"],
                values["MCH"],
                values["MCHC"]
            )

        deficiency_params = ["FOLATE", "B12"]
        if all(param in values for param in deficiency_params):
            results["deficiency_type"] = predict_deficiency_type(
                values["FOLATE"],
                values["B12"]
            )

        anemia_name_params = ["GENDER", "HGB", "FERRITTE", "MENTZER_INDEX"]
        anemia_flags = {
            "NORMOCHROMIC": int(bool(results["anemia_type"]["NORMOCHROMIC ANEMIA"])) if results["anemia_type"] else 0,
            "HYPOCHROMIC": int(bool(results["anemia_type"]["HYPOCHROMIC ANEMIA"])) if results["anemia_type"] else 0,
            "NORMOCYTIC": int(bool(results["anemia_type"]["NORMOCYTIC ANEMIA"])) if results["anemia_type"] else 0,
            "MICROCYTIC": int(bool(results["anemia_type"]["MICROCYTIC ANEMIA"])) if results["anemia_type"] else 0,
            "MACROCYTIC": int(bool(results["anemia_type"]["MACROCYTIC ANEMIA"])) if results["anemia_type"] else 0
        }
        
        if (all(param in values for param in anemia_name_params) and results["anemia_type"]):
            results["anemia_name"] = predict_anemia_name(
                values["GENDER"],
                values["HGB"],
                values["FERRITTE"],
                values["MENTZER_INDEX"],
                NORMOCHROMIC_ANEMIA=anemia_flags["NORMOCHROMIC"],
                HYPOCHROMIC_ANEMIA=anemia_flags["HYPOCHROMIC"],
                NORMOCYTIC_ANEMIA=anemia_flags["NORMOCYTIC"],
                MICROCYTIC_ANEMIA=anemia_flags["MICROCYTIC"],
                MACROCYTIC_ANEMIA=anemia_flags["MACROCYTIC"]
            )
        
        return results

    except Exception as e:
        print(f"❌ Error processing PDF: {str(e)}")
        return None