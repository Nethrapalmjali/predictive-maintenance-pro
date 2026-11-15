import os
import sys

# Allow `from ml...` / `from models...` imports when running pytest from backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
