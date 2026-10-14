import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import RequestFactory
from apps.sales.lead_views import leads_list_create_view
from apps.accounts.models import User

# Mock request
factory = RequestFactory()
request = factory.get('/api/v1/leads')

# Mock authenticated user
admin_user = User.objects.filter(role='ADMIN').first()
if not admin_user:
    # Create temp user for test
    admin_user = User.objects.create(
        id='test-admin-id',
        username='+998991112233',
        phone='+998991112233',
        full_name='Test Admin',
        role='ADMIN',
        status='ACTIVE'
    )
request.user = admin_user

try:
    response = leads_list_create_view(request)
    print("STATUS:", response.status_code)
    print("DATA:", response.data)
except Exception as e:
    print("ERROR:", e)
