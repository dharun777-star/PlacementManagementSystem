import sys
import os
from pathlib import Path

# Add backend directory to sys.path so placement_project and placements_app are discoverable
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / 'backend'
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement_project.settings')

from django.core.wsgi import get_wsgi_application

app = get_wsgi_application()
