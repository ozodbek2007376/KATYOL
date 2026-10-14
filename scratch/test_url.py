import os
import django
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.urls import resolve, Resolver404

try:
    match = resolve('/api/v1/leads/')
    print("RESOLVED /api/v1/leads/:", match.func, match.url_name)
except Resolver404:
    print("FAILED /api/v1/leads/")

try:
    match = resolve('/api/v1/leads')
    print("RESOLVED /api/v1/leads:", match.func, match.url_name)
except Resolver404:
    print("FAILED /api/v1/leads")
