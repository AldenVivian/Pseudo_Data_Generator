from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import tempfile
import os
import uuid
import sys
import pandas as pd
import numpy as np
from typing import List, Optional

# Add the current directory to Python path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class Column(BaseModel):
    name: str
    dtype: str = "str"
    data: str = "random"
    options: List[str] = []
    weights: List[int] = []
    faker_method: str = "name"
    cols: Optional[int] = None
    value: List[str] = []
    range: List[str] = []
    condition: Optional[str] = None
    operation: Optional[str] = None
    operands: List[str] = []
    start: Optional[int] = None
    interval: Optional[int] = None


class AppendRule(BaseModel):
    operation: str
    cols: Optional[int] = None
    col_name: Optional[str] = None
    find: Optional[str] = None
    replace: Optional[str] = None
    new_col: Optional[str] = None
    data: Optional[str] = None
    options: List[str] = []
    weights: List[int] = []
    faker_method: str = "name"
    nullable: float = 0.0


class RuleFile(BaseModel):
    num_records: int = 100
    mode: int = 1
    columns: List[Column] = []
    append_rules: List[AppendRule] = []
    reorder: List[int] = []


# Import the fakerengine after setting up the path
try:
    from fakerengine.fakerdata import (
        create_config_from_dict,
        save_config_to_file,
        build_from_config_object,
    )

    print("✅ Successfully imported fakerengine")
except ImportError as e:
    print(f"❌ Failed to import fakerengine: {e}")
    print("Current directory:", os.getcwd())
    print("Python path:", sys.path)
    print("Files in current directory:", os.listdir("."))
    if os.path.exists("fakerengine"):
        print("Files in fakerengine:", os.listdir("fakerengine"))


@app.get("/")
def root():
    return {"message": "Pseudo Data Generator API"}


@app.post("/generate-ini")
def generate_ini_file(rule_file: RuleFile):
    """Generate and return rules.ini file"""
    try:
        print(f"Received request with {len(rule_file.columns)} columns")

        # Convert to dict format
        config_dict = {
            "num_records": rule_file.num_records,
            "mode": rule_file.mode,
            "columns": [col.dict() for col in rule_file.columns],
            "append_rules": [rule.dict() for rule in rule_file.append_rules],
            "reorder": rule_file.reorder,
        }

        # Create config object
        config = create_config_from_dict(config_dict)

        # Save to temporary file
        uid = str(uuid.uuid4())[:8]
        filename = f"rules_{uid}.ini"
        filepath = os.path.join(tempfile.gettempdir(), filename)

        save_config_to_file(config, filepath)

        print(f"Generated file at: {filepath}")

        return FileResponse(filepath, media_type="text/plain", filename="rules.ini")

    except Exception as e:
        print(f"Error: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/preview-data")
def preview_data(rule_file: RuleFile):
    """Generate preview data using the existing fakerdata logic"""
    try:
        # Convert to dict format with limited records for preview
        config_dict = {
            "num_records": min(rule_file.num_records, 25),  # Limit to 25 rows max
            "mode": rule_file.mode,
            "columns": [col.dict() for col in rule_file.columns],
            "append_rules": [rule.dict() for rule in rule_file.append_rules],
            "reorder": rule_file.reorder,
        }

        # If no columns, return empty preview
        if not rule_file.columns:
            return {
                "preview_data": [],
                "columns": [],
                "shape": [0, 0],
                "message": "Add columns to see preview",
            }

        # Create config object
        config = create_config_from_dict(config_dict)

        # Generate data using existing logic
        df = build_from_config_object(config)

        # Convert to serializable format
        preview_data = df.head(15).to_dict(orient="records")  # Show first 15 rows

        # Handle NaN values and convert to JSON-serializable format
        for row in preview_data:
            for key, value in row.items():
                if pd.isna(value):
                    row[key] = None
                elif isinstance(value, (np.integer, np.floating)):
                    row[key] = value.item()

        return {
            "preview_data": preview_data,
            "columns": df.columns.tolist(),
            "shape": df.shape,
            "message": f"Preview of {len(preview_data)} rows",
        }

    except Exception as e:
        print(f"Preview error: {e}")
        import traceback

        traceback.print_exc()
        return {
            "preview_data": [],
            "columns": [],
            "shape": [0, 0],
            "error": str(e),
            "message": "Error generating preview",
        }
