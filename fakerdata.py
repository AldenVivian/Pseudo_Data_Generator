import configparser
import csv
import datetime
import random
import pandas as pd
from faker import Faker

fake = Faker()


def generate_data(config):
    # Read configuration
    num_records = int(config["rec"]["num"])
    mode = int(config["rec"]["mode"])

    # Initialize data
    data = []

    # Generate data
    for i in range(num_records):
        row = []

        for section in config.sections():
            if section.startswith("c"):
                # Get column settings
                dtype = config[section]["dtype"]
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

                elif data_source == "reference":
                    # Reference another column or external data
                    ref_column = config[section].get("ref_column", None)
                    if ref_column and len(data) > 0:
                        # Reference previous row's column
                        col_index = int(ref_column.replace("c", "")) - 1
                        if col_index < len(row):
                            value = row[col_index]
                        else:
                            value = None
                    else:
                        value = None

                elif data_source == "increment":
                    # Increment from a starting value
                    start_value = int(config[section].get("start", 1))
                    value = start_value + i

                elif data_source == "faker":
                    # Use Faker to generate realistic data
                    faker_method = config[section].get("faker_method", "name")
                    if hasattr(fake, faker_method):
                        value = getattr(fake, faker_method)()
                    else:
                        value = fake.name()

                elif data_source == "datetime":
                    # Generate datetime values
                    start_date = config[section].get("start_date", "2020-01-01")
                    end_date = config[section].get("end_date", "2024-12-31")
                    start_dt = datetime.datetime.strptime(start_date, "%Y-%m-%d")
                    end_dt = datetime.datetime.strptime(end_date, "%Y-%m-%d")
                    time_between = end_dt - start_dt
                    days_between = time_between.days
                    random_days = random.randrange(days_between)
                    value = start_dt + datetime.timedelta(days=random_days)
                    value = value.strftime("%Y-%m-%d")

                else:
                    value = None

                # Convert to appropriate data type
                if dtype == "int":
                    try:
                        value = int(value)
                    except (ValueError, TypeError):
                        value = 0
                elif dtype == "float":
                    try:
                        value = float(value)
                    except (ValueError, TypeError):
                        value = 0.0
                elif dtype == "str":
                    value = str(value) if value is not None else ""

                # Append data to row
                row.append(value)

        data.append(row)

    # Create column names
    columns = []
    for section in config.sections():
        if section.startswith("c"):
            col_name = config[section].get("name", section)
            columns.append(col_name)

    return pd.DataFrame(data, columns=columns)


def append_data(config, df):
    # Read configuration for appending columns
    for section in config.sections():
        if section.startswith("a"):
            # Get appending column settings
            operation = config[section]["operation"]
            col_name = config[section].get("name", section)

            # Perform operation
            if operation == "generate":
                # Generate new column based on existing data
                formula = config[section].get("formula", "")
                if formula:
                    # Simple formula evaluation (be careful with eval in production)
                    try:
                        df[col_name] = df.eval(formula)
                    except:
                        df[col_name] = None
                else:
                    df[col_name] = None

            elif operation == "reference":
                # Reference another column
                ref_column = config[section].get("ref_column", "")
                if ref_column in df.columns:
                    df[col_name] = df[ref_column]
                else:
                    df[col_name] = None

            elif operation == "aggregate":
                # Aggregate operation
                agg_columns = config[section].get("columns", "").split(",")
                agg_function = config[section].get("function", "sum")

                if all(col.strip() in df.columns for col in agg_columns):
                    if agg_function == "sum":
                        df[col_name] = df[agg_columns].sum(axis=1)
                    elif agg_function == "mean":
                        df[col_name] = df[agg_columns].mean(axis=1)
                    elif agg_function == "max":
                        df[col_name] = df[agg_columns].max(axis=1)
                    elif agg_function == "min":
                        df[col_name] = df[agg_columns].min(axis=1)
                    else:
                        df[col_name] = None
                else:
                    df[col_name] = None

    return df


def create_sample_config():
    """Create a sample configuration file for testing"""
    config_content = """[rec]
num = 100
mode = 1

[c1]
name = id
dtype = int
data = increment
start = 1

[c2]
name = first_name
dtype = str
data = faker
faker_method = first_name

[c3]
name = last_name
dtype = str
data = faker
faker_method = last_name

[c4]
name = department
dtype = str
data = random
options = Sales,Marketing,Engineering,HR,Finance
weights = 2,2,3,1,2

[c5]
name = salary
dtype = int
data = random
options = 40000,50000,60000,70000,80000,90000,100000

[c6]
name = hire_date
dtype = str
data = datetime
start_date = 2020-01-01
end_date = 2024-12-31

[a1]
name = full_name
operation = generate
formula = first_name + ' ' + last_name

[a2]
name = annual_bonus
operation = generate
formula = salary * 0.1
"""

    with open("rules.ini", "w") as f:
        f.write(config_content)

    print("Sample configuration file 'rules.ini' created!")


def main():
    try:
        config = configparser.ConfigParser()
        config.read("rules.ini")

        # Check if config file exists and has content
        if not config.sections():
            print("Configuration file 'rules.ini' not found or empty.")
            print("Creating sample configuration file...")
            create_sample_config()
            config.read("rules.ini")

        # Generate and process data
        df = generate_data(config)
        df = append_data(config, df)

        # Save to CSV
        df.to_csv("output.csv", index=False)
        print(f"Generated {len(df)} records and saved to 'output.csv'")
        print(f"Columns: {list(df.columns)}")
        print("\nFirst 5 rows:")
        print(df.head())

    except Exception as e:
        print(f"Error: {e}")
        print("Make sure you have the required packages installed:")
        print("pip install pandas faker configparser")


if __name__ == "__main__":
    main()
