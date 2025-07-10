Pseudo Data Generator - Configuration Guide (rules.ini)

This guide explains how to set up the rules.ini file used by the Pseudo Data Generator to create synthetic datasets. You can define base columns, apply rules for dependencies between them, add additional columns, and reorder them before exporting to CSV.

[rec] — Record Generation Settings
Controls how many records to generate and what processing steps to apply.

Keys:

num: Number of records (e.g., 150)

mode:

1: Generate only the base records

2: Generate + apply post-generation column edits

3: Generate + post edits + reorder columns

cols: Total number of core columns, typically the count of [cX] sections.

Example:

ini
Copy
Edit
[rec]
num = 100
mode = 2
cols = 5
[cX] — Core Column Definitions
Each [cX] block creates one column in the dataset. X is a number starting from 1.

Common Keys:

name: Final column name in the CSV.

dtype: int, str, float, or decimal.

data: Data source type (see list below).

description: Optional comment to describe the field.

Optional Keys:

options: Values to randomly pick from (e.g., A,B,C).

weights: Matching weights for options (e.g., 50,30,20).

cols: Column number to reference for logic.

value, range, condition, operation, operands, faker_method: All control how data is derived.

Supported data Types
random
Selects one value from a list, optionally with weights.

ini
Copy
Edit
data = random
options = Red,Green,Blue
weights = 30,50,20
company
Auto-generates a unique ID (e.g., 1, 2, 3, ...).

reference
Uses a referenced column’s value to look up a match in range and return a corresponding value.

ini
Copy
Edit
data = reference
cols = 2
value = 100,200,300
range = 1,2,3
reference_range
Uses thresholds to map a value range to a label.

ini
Copy
Edit
data = reference_range
cols = 3
value = Low,Medium,High
range = 3,6,9
reference_boolean
Checks if a value equals a specific condition, and returns value A or B.

ini
Copy
Edit
data = reference_boolean
cols = 5
value = Yes,No
condition = 1
reference_boolean2
Returns one of multiple values if a condition matches; otherwise returns 0.

ini
Copy
Edit
data = reference_boolean2
cols = 4
value = 1,2,3
condition = 1
total
Performs a calculation on other columns.

ini
Copy
Edit
data = total
operation = *
operands = c2,c3
discount
Applies a percentage increase or decrease.

ini
Copy
Edit
data = discount
cols = 6
value = 10
operation = -
increment
Increments by a step from a start value.

ini
Copy
Edit
data = increment
start = 100
interval = 5
faker
Uses Faker to generate realistic values.

ini
Copy
Edit
data = faker
faker_method = name
[aX] — Append or Modify Columns
Used after base data generation. You can replace values or create new columns.

For Replacing Values:

ini
Copy
Edit
[a1]
operation = replace
cols = 3
col_name = Category
find = 20
replace = Premium
For Generating a New Column:

ini
Copy
Edit
[a2]
operation = generate
data = random
new_col = Customer_Type
options = Enterprise,SMB,Individual
weights = 40,40,20
nullable = 0.1
With Faker:

ini
Copy
Edit
[a3]
operation = generate
data = faker
new_col = Company_Name
faker_method = company
nullable = 0.05
Field Explanations:

operation: Either generate or replace

new_col: Name of column to add (for generate)

data: Data type to generate (random or faker)

nullable: Fraction (e.g., 0.1) of records that should be left empty

cols: Column to act upon (for replace)

col_name: Renames the column

find / replace: Target value and what to replace it with

[reorder] — Final Column Order
Sets the final column order for the output file.

Example:

ini
Copy
Edit
[reorder]
order = 1,2,3,6,7,4,5
Each number refers to the original column number defined via [cX] or added later.

How It Works in Code
The script reads rules.ini using configparser.

If mode >= 1, it generates base records using [cX] rules.

If mode >= 2, it applies any [aX] append operations.

If mode == 3, it reorders columns based on the [reorder] block.

The result is saved as a CSV file with column names and sample data.

Example Output Flow
You want to generate 100 sales records with:

Product name and quantity

Offer price and discounted total

Customer type (some rows null)

Company name via Faker

Your config would include:

[c1] to [c10] for base columns

[a1] to [a3] for renaming and extra columns

[reorder] to organize final output

The result is a clean, realistic-looking dataset for analytics, testing, or demos.