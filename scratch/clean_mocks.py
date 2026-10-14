import os
import re

mock_files = [
    "src/features/products/constants/products.mock.js",
    "src/features/suppliers/constants/suppliers.mock.js",
    "src/features/notifications/constants/notifications.mock.js",
    "src/features/production/constants/production.mock.js",
    "src/features/finance/constants/finance.mock.js",
    "src/features/reports/constants/reports.mock.js",
    "src/features/boilers/constants/boilers.mock.js",
    "src/features/services/constants/services.mock.js",
    "src/features/employees/constants/employees.mock.js",
    "src/features/orders/constants/orders.mock.js",
    "src/features/customers/constants/customers.mock.js",
    "src/features/warehouse/constants/warehouse.mock.js",
    "src/features/sales/constants/sales.mock.js",
    "src/features/settings/constants/settings.mock.js",
    "src/features/activities/constants/activities.mock.js",
    "src/features/recipes/constants/recipes.mock.js",
    "src/features/dashboard/constants/dashboard.mock.js",
    "src/features/auth/constants/auth.mock.js",
    "src/features/audit/constants/audit.mock.js",
    "src/features/purchasing/constants/purchasing.mock.js"
]

for rel_path in mock_files:
    abs_path = os.path.join("/home/lite/Documents/projects/FrontendProjects/kotyol", rel_path)
    if not os.path.exists(abs_path):
        continue
    
    with open(abs_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all export const X = ...
    # We can match export const [A-Za-z0-9_]+
    exports = re.findall(r'export\s+const\s+([A-Za-z0-9_]+)', content)
    
    new_lines = []
    for var_name in exports:
        # If it's a stats or metrics object, default to {}
        if "STATS" in var_name or "METRICS" in var_name or "CHART" in var_name or "PROFILE" in var_name or "MATRIX" in var_name or "SETTINGS" in var_name:
            new_lines.append(f"export const {var_name} = {{}};")
        else:
            new_lines.append(f"export const {var_name} = [];")
            
    with open(abs_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(new_lines) + "\n")
    print(f"Cleaned {rel_path}")
