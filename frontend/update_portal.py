with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

if "CustomerPortal" not in content:
    content = content.replace(
        "import { ProfitDashboard } from './pages/ProfitDashboard';",
        "import { ProfitDashboard } from './pages/ProfitDashboard';\nimport { CustomerPortal } from './pages/CustomerPortal';"
    )
    content = content.replace(
        '<Route path="/login"',
        '<Route path="/portal" element={<CustomerPortal />} />\n          <Route path="/login"'
    )
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Portal route added!")
else:
    print("Already exists")
