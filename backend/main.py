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
from fastapi import FastAPI, HTTPException, UploadFile, File
import configparser
import io

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
    column_position: Optional[int] = None

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
    append_position: Optional[int] = None

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
        # FIXED: Ensure columns maintain their order
        columns_with_order = []
        for idx, col in enumerate(rule_file.columns):
            col_dict = col.dict()
            # Ensure we maintain the 1-based indexing that operands expect
            columns_with_order.append(col_dict)

        # Convert to dict format with limited records for preview
        config_dict = {
            "num_records": min(rule_file.num_records, 25),
            "mode": rule_file.mode,
            "columns": columns_with_order,  # Maintains order
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
        print(f"config_dict > {config_dict}")
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
            "shape": [0, 0],  # shape NOT REQUIRED?
            "error": str(e),
            "message": "Error generating preview",
        }


@app.post("/parse-ini")
async def parse_ini_file(file: UploadFile = File(...)):
    """Parse uploaded INI file and return structured data"""
    try:
        # Validate file type
        if not file.filename.endswith(".ini"):
            raise HTTPException(status_code=400, detail="File must be a .ini file")

        # Read file content
        content = await file.read()
        ini_content = content.decode("utf-8")

        # Parse INI content
        config = configparser.ConfigParser()
        config.read_string(ini_content)

        # Extract [rec] section
        if "rec" not in config.sections():
            raise HTTPException(
                status_code=400, detail="Invalid INI file: missing [rec] section"
            )

        rec_section = config["rec"]
        num_records = int(rec_section.get("num", 100))
        mode = int(rec_section.get("mode", 1))

        # Extract [cX] sections (columns) - PRESERVE ORDER WITH POSITION TRACKING
        columns = []

        # Get all column sections and sort them by column number to maintain order
        column_sections = []
        for section_name in config.sections():
            if section_name.startswith("c") and section_name[1:].isdigit():
                column_number = int(
                    section_name[1:]
                )  # Extract number from c1, c2, etc.
                column_sections.append((column_number, section_name))

        # Sort by column number to ensure proper order (c1, c2, c3, ...)
        column_sections.sort(key=lambda x: x[0])

        print(
            f"📋 Found {len(column_sections)} columns in order: {[f'{name} (pos {num})' for num, name in column_sections]}"
        )

        for column_number, section_name in column_sections:
            section = config[section_name]

            column = {
                "name": section.get("name", ""),
                "dtype": section.get("dtype", "str"),
                "data": section.get("data", "random"),
                "column_position": column_number,  # 🔥 ADD THIS: Preserve original position
                "options": (
                    section.get("options", "").split(",")
                    if section.get("options")
                    else []
                ),
                "weights": (
                    [int(w) for w in section.get("weights", "").split(",") if w.strip()]
                    if section.get("weights")
                    else []
                ),
                "faker_method": section.get("faker_method", "name"),
                "cols": (int(section.get("cols", 0)) if section.get("cols") else None),
                "value": (
                    section.get("value", "").split(",") if section.get("value") else []
                ),
                "range": (
                    section.get("range", "").split(",") if section.get("range") else []
                ),
                "condition": (
                    section.get("condition", "") if section.get("condition") else None
                ),
                "operation": (
                    section.get("operation", "") if section.get("operation") else None
                ),
                "operands": (
                    section.get("operands", "").split(",")
                    if section.get("operands")
                    else []
                ),
                "start": (
                    int(section.get("start", 0)) if section.get("start") else None
                ),
                "interval": (
                    int(section.get("interval", 1)) if section.get("interval") else None
                ),
            }

            # Clean up empty arrays
            if not column["options"]:
                column["options"] = []
            if not column["weights"]:
                column["weights"] = []
            if not column["value"]:
                column["value"] = []
            if not column["range"]:
                column["range"] = []
            if not column["operands"]:
                column["operands"] = []

            columns.append(column)
            print(
                f"✅ Parsed column {column_number}: {column['name']} (position {column['column_position']})"
            )

        # Extract [aX] sections (append rules) - ALSO PRESERVE ORDER
        append_rules = []

        # Get all append rule sections and sort them by number
        append_sections = []
        for section_name in config.sections():
            if section_name.startswith("a") and section_name[1:].isdigit():
                append_number = int(section_name[1:])
                append_sections.append((append_number, section_name))

        # Sort by append rule number
        append_sections.sort(key=lambda x: x[0])

        for append_number, section_name in append_sections:
            section = config[section_name]

            rule = {
                "operation": section.get("operation", "replace"),
                "append_position": append_number,  # 🔥 ADD THIS: Preserve append rule order
                "cols": (int(section.get("cols", 0)) if section.get("cols") else None),
                "col_name": (
                    section.get("col_name", "") if section.get("col_name") else None
                ),
                "find": section.get("find", "") if section.get("find") else None,
                "replace": (
                    section.get("replace", "") if section.get("replace") else None
                ),
                "new_col": (
                    section.get("new_col", "") if section.get("new_col") else None
                ),
                "data": section.get("data", "") if section.get("data") else None,
                "options": (
                    section.get("options", "").split(",")
                    if section.get("options")
                    else []
                ),
                "weights": (
                    [int(w) for w in section.get("weights", "").split(",") if w.strip()]
                    if section.get("weights")
                    else []
                ),
                "faker_method": section.get("faker_method", "name"),
                "nullable": (
                    float(section.get("nullable", 0.0))
                    if section.get("nullable")
                    else 0.0
                ),
            }

            append_rules.append(rule)

        # Extract [reorder] section
        reorder = []
        if "reorder" in config.sections():
            reorder_str = config["reorder"].get("order", "")
            if reorder_str:
                reorder = [int(x.strip()) for x in reorder_str.split(",") if x.strip()]

        # 🔍 Debug: Print final column order
        print(
            f"🎯 Final column order: {[(col['column_position'], col['name']) for col in columns]}"
        )

        return {
            "success": True,
            "data": {
                "num_records": num_records,
                "mode": mode,
                "columns": columns,
                "append_rules": append_rules,
                "reorder": reorder,
            },
            "message": f"Successfully parsed {len(columns)} columns and {len(append_rules)} append rules in correct order",
        }

    except configparser.Error as e:
        raise HTTPException(
            status_code=400, detail=f"Invalid INI file format: {str(e)}"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400, detail=f"Invalid data in INI file: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing INI file: {str(e)}")
