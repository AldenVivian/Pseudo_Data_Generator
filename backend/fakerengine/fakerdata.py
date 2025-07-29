import configparser
import csv
import datetime
import random
import pandas as pd
from faker import Faker
import numpy as np
import tempfile
import os
import io
import json

fake = Faker()


def parse_column_definitions(config):
    defs = []
    for section in config.sections():
        if section.startswith("c"):
            col = config[section]
            col_def = {
                "name": col.get("name", section),
                "dtype": col.get("dtype", "str"),
                "data": col.get("data", "random"),
                "options": (
                    col.get("options", "").split(",") if "options" in col else None
                ),
                "weights": (
                    [int(w) for w in col.get("weights", "1").split(",")]
                    if "weights" in col
                    else None
                ),
                "range": (col.get("range", "").split(",") if "range" in col else None),
                "value": col.get("value", "").split(",") if "value" in col else None,
                "cols": int(col.get("cols", "0")),
                "operation": col.get("operation"),
                "operands": (
                    col.get("operands", "").split(",") if "operands" in col else None
                ),
                "faker_method": col.get("faker_method", "name"),
                "condition": col.get("condition"),
                "start": col.get("start"),
                "interval": col.get("interval"),
            }
            defs.append(col_def)
    return defs


def generate_data(config):
    num_records = int(config["rec"]["num"])
    column_defs = parse_column_definitions(config)
    df = pd.DataFrame()

    for col_def in column_defs:
        name = col_def["name"]
        dtype = col_def["dtype"]
        data_source = col_def["data"]

        if data_source == "company":
            data = np.arange(1, num_records + 1)

        elif data_source == "random":
            options = col_def["options"]
            weights = col_def["weights"]
            if weights:
                data = np.random.choice(
                    options, size=num_records, p=np.array(weights) / sum(weights)
                )
            else:
                data = np.random.choice(options, size=num_records)

        elif data_source == "faker":
            method = col_def["faker_method"]
            if hasattr(fake, method):
                data = [getattr(fake, method)() for _ in range(num_records)]
            else:
                data = [fake.name() for _ in range(num_records)]

        elif data_source == "increment":
            start = int(col_def["start"]) if col_def["start"] else 1
            interval = int(col_def["interval"]) if col_def["interval"] else 1
            data = np.arange(start, start + interval * num_records, interval)

        elif data_source in [
            "reference",
            "reference_range",
            "reference_boolean",
            "reference_boolean2",
        ]:
            # Placeholder, process after base columns are filled
            data = [None] * num_records

        elif data_source in ["total", "discount"]:
            data = [None] * num_records

        else:
            data = [None] * num_records

        df[name] = data

    # Post-process dependent columns
    for col_def in column_defs:
        name = col_def["name"]
        data_source = col_def["data"]

        if data_source == "reference_range":
            ref_col = column_defs[col_def["cols"] - 1]["name"]
            values = col_def["value"]
            ranges = col_def["range"]
            ref_vals = df[ref_col].astype(int)
            df[name] = ref_vals.apply(
                lambda val: next(
                    (v for r, v in zip(ranges, values) if val <= int(r)), values[-1]
                )
            )

        elif data_source == "reference":
            ref_col = column_defs[col_def["cols"] - 1]["name"]
            keys = col_def["value"]
            values = col_def["range"]
            mapping = dict(zip(keys, values))
            df[name] = df[ref_col].astype(str).map(lambda v: mapping.get(v, values[-1]))

        elif data_source == "reference_boolean":
            ref_col = column_defs[col_def["cols"] - 1]["name"]
            condition = int(col_def["condition"])
            val_true, val_false = col_def["value"]
            df[name] = np.where(df[ref_col] == condition, val_true, val_false)

        elif data_source == "reference_boolean2":
            ref_col = column_defs[col_def["cols"] - 1]["name"]
            condition = int(col_def["condition"])
            values = col_def["value"]
            df[name] = df[ref_col].apply(
                lambda v: random.choice(values) if int(v) == condition else 0
            )

        elif data_source == "total":
            op = col_def["operation"]
            operands = [
                column_defs[int(o[1:]) - 1]["name"] for o in col_def["operands"]
            ]
            if op == "+":
                df[name] = df[operands].astype(float).sum(axis=1)
            elif op == "*":
                df[name] = df[operands[0]].astype(float)
                for operand in operands[1:]:
                    df[name] *= df[operand].astype(float)

        elif data_source == "discount":
            ref_col = column_defs[col_def["cols"] - 1]["name"]
            operation = col_def["operation"]
            percent = float(col_def["value"][0])
            if operation == "-":
                df[name] = df[ref_col].astype(float) * (1 - percent / 100)
            elif operation == "+":
                df[name] = df[ref_col].astype(float) * (1 + percent / 100)

        # Convert dtype
        if col_def["dtype"] == "int":
            df[name] = df[name].fillna(0).astype(int)
        elif col_def["dtype"] in ["float", "decimal"]:
            df[name] = df[name].fillna(0).astype(float).round(2)
        else:
            df[name] = df[name].fillna("").astype(str)

    return df


def append_data(config, df):
    for section in config.sections():
        if section.startswith("a"):
            operation = config[section]["operation"]

            if operation == "replace":
                col_index = int(config[section]["cols"]) - 1
                if col_index < len(df.columns):
                    col_name = config[section].get("col_name", df.columns[col_index])
                    find_val = config[section]["find"]
                    replace_val = config[section]["replace"]

                    if col_name != df.columns[col_index]:
                        cols_list = df.columns.tolist()
                        cols_list[col_index] = col_name
                        df.columns = cols_list

                    df.iloc[:, col_index] = df.iloc[:, col_index].replace(
                        find_val, replace_val
                    )

            elif operation == "generate":
                new_col = config[section].get("new_col", f"generated_{section}")
                data_type = config[section].get("data", "random")
                nullable = float(config[section].get("nullable", 0))

                if data_type == "random":
                    options = config[section]["options"].split(",")
                    weights = config[section].get("weights", None)
                    if weights:
                        weights = [int(w) for w in weights.split(",")]
                        data = [
                            random.choices(options, weights=weights)[0]
                            for _ in range(len(df))
                        ]
                    else:
                        data = [random.choice(options) for _ in range(len(df))]

                elif data_type == "faker":
                    faker_method = config[section].get("faker_method", "name")
                    if hasattr(fake, faker_method):
                        data = [getattr(fake, faker_method)() for _ in range(len(df))]
                    else:
                        data = [fake.name() for _ in range(len(df))]

                else:
                    data = [None for _ in range(len(df))]

                # Apply nullability
                if nullable > 0:
                    for i in range(len(data)):
                        if random.random() < nullable:
                            data[i] = None

                df[new_col] = data

    return df


def reorder_columns(config, df):
    if "reorder" in config:
        order = config["reorder"]["order"].split(",")
        order_indices = [int(x) - 1 for x in order]

        if all(0 <= idx < len(df.columns) for idx in order_indices):
            df = df.iloc[:, order_indices]

    return df


def build_from_config_path(config_path):
    """
    Build DataFrame from config file path
    """
    config = configparser.ConfigParser()
    config.read(config_path)
    mode = int(config["rec"].get("mode", 1))

    df = generate_data(config)

    if mode >= 2:
        df = append_data(config, df)
    if mode == 3:
        df = reorder_columns(config, df)

    return df


def build_from_config_object(config):
    print(f"Config sections: {config.sections()}")
    for section in config.sections():
        print(f"[{section}]: {dict(config[section])}")   
    """
    Build DataFrame from config object directly
    """
    mode = int(config["rec"].get("mode", 1))

    df = generate_data(config)

    if mode == 2:
        df = append_data(config, df)
    if mode == 3:
        df = reorder_columns(config, df)

    return df


def build_from_config_string(config_string):
    """
    Build DataFrame from config string
    """
    config = configparser.ConfigParser()
    config.read_string(config_string)

    return build_from_config_object(config)


def create_config_from_dict(config_dict):
    """
    Create configparser object from dictionary
    """
    config = configparser.ConfigParser()

    # Add [rec] section
    config["rec"] = {
        "num": str(config_dict.get("num_records", 100)),
        "mode": str(config_dict.get("mode", 1)),
        "cols": str(len(config_dict.get("columns", []))),
    }

    # Add [cX] sections
    for idx, col in enumerate(config_dict.get("columns", [])):
        section_name = f"c{idx + 1}"
        config[section_name] = {}

        # Required fields
        config[section_name]["name"] = col.get("name", f"col_{idx + 1}")
        config[section_name]["dtype"] = col.get("dtype", "str")
        config[section_name]["data"] = col.get("data", "random")

        # Optional fields
        if col.get("options"):
            config[section_name]["options"] = ",".join(col["options"])
        if col.get("weights"):
            config[section_name]["weights"] = ",".join(map(str, col["weights"]))
        if col.get("cols"):
            config[section_name]["cols"] = str(col["cols"])
        if col.get("value"):
            config[section_name]["value"] = ",".join(col["value"])
        if col.get("range"):
            config[section_name]["range"] = ",".join(col["range"])
        if col.get("condition"):
            config[section_name]["condition"] = str(col["condition"])
        if col.get("operation"):
            config[section_name]["operation"] = col["operation"]
        if col.get("operands"):
            config[section_name]["operands"] = ",".join(col["operands"])
        if col.get("faker_method"):
            config[section_name]["faker_method"] = col["faker_method"]
        if col.get("start"):
            config[section_name]["start"] = str(col["start"])
        if col.get("interval"):
            config[section_name]["interval"] = str(col["interval"])

    # Add [aX] sections if present
    for idx, append_rule in enumerate(config_dict.get("append_rules", [])):
        section_name = f"a{idx + 1}"
        config[section_name] = {}

        config[section_name]["operation"] = append_rule.get("operation", "replace")

        if append_rule.get("cols"):
            config[section_name]["cols"] = str(append_rule["cols"])
        if append_rule.get("col_name"):
            config[section_name]["col_name"] = append_rule["col_name"]
        if append_rule.get("find"):
            config[section_name]["find"] = append_rule["find"]
        if append_rule.get("replace"):
            config[section_name]["replace"] = append_rule["replace"]
        if append_rule.get("new_col"):
            config[section_name]["new_col"] = append_rule["new_col"]
        if append_rule.get("data"):
            config[section_name]["data"] = append_rule["data"]
        if append_rule.get("options"):
            config[section_name]["options"] = ",".join(append_rule["options"])
        if append_rule.get("weights"):
            config[section_name]["weights"] = ",".join(map(str, append_rule["weights"]))
        if append_rule.get("faker_method"):
            config[section_name]["faker_method"] = append_rule["faker_method"]
        if append_rule.get("nullable"):
            config[section_name]["nullable"] = str(append_rule["nullable"])

    # Add [reorder] section if present
    if config_dict.get("reorder"):
        config["reorder"] = {"order": ",".join(map(str, config_dict["reorder"]))}

    return config


def save_config_to_file(config, filepath):
    """
    Save configparser object to file
    """
    with open(filepath, "w") as f:
        config.write(f)


def create_optimized_sample_config():
    """Create an optimized sample configuration file"""
    config_content = """[rec]
num = 150
mode = 2
cols = 17
; mode = 1 for generating records
; mode = 2 for appending column  
; mode = 3 for reordering columns

[c1]
name = Company_ID
dtype = int
data = company

[c2]
name = Lead_Source
dtype = str
data = random
options = Website,Call,Tradeshow,Social Media,Conference
weights = 25,25,25,20,30

[c3]
name = Sales_Rep
dtype = str
data = random
options = Rep_1,Rep_2,Rep_3,Rep_4,Rep_5,Rep_6,Rep_7,Rep_8,Rep_9,Rep_10,Rep_11,Rep_12
weights = 8,8,8,8,8,8,8,8,8,8,8,8

[c4]
name = Region_Manager
dtype = int
data = reference_range
cols = 3
value = 1,2,3,4
range = 3,6,9,12

[c5]
name = Project_Selection
dtype = int
data = random
options = 1,0
weights = 50,50

[c6]
name = Offer_Selection
dtype = int
data = reference_boolean
cols = 5
value = 1,0
condition = 1

[c7]
name = Product_ID
dtype = int
data = random
options = 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20
weights = 5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5

[c8]
name = Unit_Cost
dtype = int
data = reference
cols = 7
value = 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20
range = 300,400,530,420,300,400,330,420,300,200,330,420,300,400,530,420,300,400,330,420

[c9]
name = Quantity
dtype = int
data = reference_boolean2
cols = 6
value = 1,2,3,4,5
condition = 1

[c10]
name = Total_Cost
dtype = decimal
data = total
operation = *
operands = c8,c9

[c11]
name = Offer_Submission
dtype = int
data = reference_boolean
cols = 6
value = 1,0
condition = 1

[c12]
name = Submission_Price
dtype = decimal
data = discount
operation = -
value = 10
cols = 10

[c13]
name = Negotiation_Price
dtype = decimal
data = discount
operation = +
value = 5
cols = 12

[c14]
name = Win_Loss
dtype = int
data = reference_boolean
cols = 11
value = 1,0
condition = 1

[c15]
name = Final_Sales_Value
dtype = decimal
data = total
operation = *
operands = c13,c14

[c16]
name = Country
dtype = str
data = random
options = India,Germany,Spain,Italy
weights = 25,25,25,25

[c17]
name = Year
dtype = str
data = random
options = 2022,2023,2024
weights = 33,33,34

[a1]
operation = replace
cols = 7
col_name = Product_Name
find = 20
replace = Pendrive

[reorder]
order = 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17
"""

    with open("rules_optimized.ini", "w") as f:
        f.write(config_content)

    print("Optimized configuration file 'rules_optimized.ini' created!")


def main():
    """Original main function for standalone execution"""
    try:
        config = configparser.ConfigParser()

        # Try to read existing config, create optimized version if not found
        if not config.read("rules.ini"):
            print("Configuration file 'rules.ini' not found.")
            print("Creating optimized configuration file...")
            create_optimized_sample_config()
            config.read("rules_optimized.ini")

        # Get mode from config
        mode = int(config["rec"].get("mode", 1))
        declared_cols = int(config["rec"].get("cols", 0))

        # Step 1: Generate data
        df = generate_data(config)

        # Validate column count
        if declared_cols and len(df.columns) < declared_cols:
            print(
                f"Warning: Only {len(df.columns)} columns generated, expected {declared_cols}."
            )

        # Step 2: Append data if mode >= 2
        if mode >= 2:
            df = append_data(config, df)

        # Step 3: Reorder if mode == 3
        if mode == 3:
            df = reorder_columns(config, df)

        # Save with timestamp
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"output_{timestamp}.csv"
        df.to_csv(output_file, index=False)

        # Logs
        print(f"Generated {len(df)} records and saved to '{output_file}'")
        print(f"Columns: {list(df.columns)}")
        print(f"Data shape: {df.shape}")
        print("\nFirst 5 rows:")
        print(df.head())
        print("\nData types:")
        print(df.dtypes)

    except Exception as e:
        print(f"Error: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    main()
