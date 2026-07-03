with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

if "ProfitDashboard" not in content:
    content = content.replace(
        "import { Reports } from './pages/Reports';",
        "import { Reports } from './pages/Reports';\nimport { ProfitDashboard } from './pages/ProfitDashboard';"
    )
    content = content.replace(
        "{ to: '/reports', icon: '\U0001f4c8', label: 'Reports' },",
        "{ to: '/reports', icon: '\U0001f4c8', label: 'Reports' },\n  { to: '/profit', icon: '\U0001f48e', label: 'Profit' },"
    )
    content = content.replace(
        '<Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />',
        '<Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />\n          <Route path="/profit" element={<ProtectedRoute><Layout><ProfitDashboard /></Layout></ProtectedRoute>} />'
    )
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Profit page added!")
else:
    print("Already exists")
