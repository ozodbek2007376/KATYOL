import os
import django
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from apps.master_data.models import Company

user = User.objects.get(username='+998931524984')
company = Company.objects.first()

print("BEFORE - name:", company.name, "phone:", company.phone)

modified = False
if (company.name == "UZS Korxona" or not company.name) and user.organization_name:
    company.name = user.organization_name
    modified = True
if (company.phone == "+99898546757" or not company.phone) and user.phone:
    company.phone = user.phone
    modified = True
if modified:
    company.save()

company = Company.objects.first()
print("AFTER - name:", company.name, "phone:", company.phone)
