# Lightweight .env loader for Enterprise GenAI
import os
from pathlib import Path

def load_dotenv(env_path: Path = None):
    if env_path is None:
        env_path = Path(__file__).parent / ".env"
    if not env_path.exists():
        return
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k and k not in os.environ:
                    os.environ[k] = v
    except Exception as e:
        print(f"Warning loading .env: {e}")

# Automatically invoke on import
load_dotenv()
