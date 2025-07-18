import sys
import os

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

print("Current directory:", os.getcwd())
print("Python path:", sys.path)
print("Files in current directory:", os.listdir('.'))

if os.path.exists('fakerengine'):
    print("fakerengine folder exists")
    print("Files in fakerengine:", os.listdir('fakerengine'))
    
    try:
        from fakerengine.fakerdata import create_config_from_dict
        print("✅ Import successful!")
    except ImportError as e:
        print(f"❌ Import failed: {e}")
else:
    print("❌ fakerengine folder does not exist")
