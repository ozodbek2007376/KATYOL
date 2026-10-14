import os
import django
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.master_data.models import ServiceType
from apps.master_data.serializers import MasterDataResponseSerializer

items = ServiceType.objects.all()
serializer = MasterDataResponseSerializer(items, many=True)
print(serializer.data[:3])
