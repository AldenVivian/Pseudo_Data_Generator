import configparser
import csv
import datetime
import random
import pandas as pd
from faker import Faker
import numpy as np

fake = Faker()


def generate_data(config):
    # Read configuration
    num_records = int(config["rec"]["num"])
    mode = int(config["rec"]["mode"])

    # Initialize data
    data = []
    columns = []

    # Get all column sections and sort them
    column_sections = [
        section for section in config.sections() if section.startswith("c")
    ]
    column_sections.sort(key=lambda x: int(x[1:]))  # Sort by column number

    # Create column names first
    for section in column_sections:
        col_name = config[section].get("name", section)
        columns.append(col_name)

    # Generate data
    for i in range(num_records):
        row = []

        for section in column_sections:
            # Get column settings
            dtype = config[section].get("dtype", "str")
            data_source = config[section]["data"]

            # Generate data based on source
            if data_source == "random":
                options = config[section]["options"].split(",")
                weights = config[section].get("weights", None)
                if weights:
                    weights = [int(w) for w in weights.split(",")]
                    value = random.choices(options, weights=weights)[0]
                else:
                    value = random.choice(options)

            elif data_source == "company":
                # Generate company IDs
                value = i + 1

            elif data_source == "reference_range":
                # Reference based on range conditions
                ref_col = int(config[section]["cols"]) - 1
                if ref_col < len(row):
                    ref_value = int(row[ref_col])
                    values = config[section]["value"].split(",")
                    ranges = [int(x) for x in config[section]["range"].split(",")]

                    # Find appropriate value based on range
                    for j, range_val in enumerate(ranges):
                        if ref_value <= range_val:
                            value = values[j % len(values)]
                            break
                    else:
                        value = values[-1]
                else:
                    value = config[section]["value"].split(",")[0]

            elif data_source == "reference":
                ref_col = int(config[section]["cols"]) - 1
                if ref_col < len(row):
                    ref_value = str(row[ref_col])
                    keys = config[section]["value"].split(",")
                    values = config[section]["range"].split(",")

                    mapping = dict(zip(keys, values))
                    value = mapping.get(
                        ref_value, values[-1]
                    )  # default to last if not matched
                else:
                    value = config[section]["range"].split(",")[-1]

            elif data_source == "reference_boolean":
                # Boolean reference - return value based on condition
                ref_col = int(config[section]["cols"]) - 1
                if ref_col < len(row):
                    ref_value = int(row[ref_col])
                    condition = int(config[section]["condition"])
                    values = config[section]["value"].split(",")

                    if ref_value == condition:
                        value = values[0]  # True value
                    else:
                        value = values[1]  # False value
                else:
                    value = config[section]["value"].split(",")[1]

            elif data_source == "reference_boolean2":
                # Boolean reference with multiple possible values
                ref_col = int(config[section]["cols"]) - 1
                if ref_col < len(row):
                    ref_value = int(row[ref_col])
                    condition = int(config[section]["condition"])
                    values = config[section]["value"].split(",")

                    if ref_value == condition:
                        value = random.choice(values)
                    else:
                        value = 0
                else:
                    value = 0

            elif data_source == "total":
                # Calculate total from operands
                operands = config[section]["operands"].split(",")
                operation = config[section]["operation"]

                operand_values = []
                for op in operands:
                    op_col = int(op[1:]) - 1  # Remove 'c' and convert to index
                    if op_col < len(row):
                        operand_values.append(float(row[op_col]))
                    else:
                        operand_values.append(0.0)

                if operation == "+":
                    value = sum(operand_values)
                elif operation == "-":
                    value = operand_values[0] - sum(operand_values[1:])
                elif operation == "*":
                    value = 1
                    for val in operand_values:
                        value *= val
                elif operation == "/":
                    value = operand_values[0]
                    for val in operand_values[1:]:
                        if val != 0:
                            value /= val
                else:
                    value = 0

            elif data_source == "discount":
                # Apply discount/markup to referenced column
                ref_col = int(config[section]["cols"]) - 1
                if ref_col < len(row):
                    ref_value = float(row[ref_col])
                    discount_value = float(config[section]["value"])
                    operation = config[section]["operation"]

                    if operation == "-":
                        value = ref_value * (1 - discount_value / 100)
                    elif operation == "+":
                        value = ref_value * (1 + discount_value / 100)
                    else:
                        value = ref_value
                else:
                    value = 0

            elif data_source == "increment":
                # Increment from starting value
                start_value = int(config[section].get("start", 1))
                interval = int(config[section].get("interval", 1))
                value = start_value + (i * interval)

            elif data_source == "faker":
                # Use Faker to generate realistic data
                faker_method = config[section].get("faker_method", "name")
                if hasattr(fake, faker_method):
                    value = getattr(fake, faker_method)()
                else:
                    value = fake.name()

            else:
                value = None

            # Convert to appropriate data type
            if dtype == "int":
                try:
                    value = int(float(value))
                except (ValueError, TypeError):
                    value = 0
            elif dtype == "float" or dtype == "decimal":
                try:
                    value = round(float(value), 2)
                except (ValueError, TypeError):
                    value = 0.0
            elif dtype == "str":
                value = str(value) if value is not None else ""

            # Append data to row
            row.append(value)

        data.append(row)

    return pd.DataFrame(data, columns=columns)


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
    # Reorder columns if specified
    if "reorder" in config:
        order = config["reorder"]["order"].split(",")
        order_indices = [int(x) - 1 for x in order]  # Convert to 0-based indexing

        # Reorder columns
        if all(0 <= idx < len(df.columns) for idx in order_indices):
            df = df.iloc[:, order_indices]

    return df


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
