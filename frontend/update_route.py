with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

if "PaymentDue" not in content:
    content = content.replace(
        "import { WhatsAppReminders } from './pages/WhatsAppReminders';",
        "import { WhatsAppReminders } from './pages/WhatsAppReminders';\nimport { PaymentDue } from './pages/PaymentDue';"
    )
    content = content.replace(
        "{Icons.reports} Reports</Link>",
        '{Icons.reports} Reports</Link>\n        <Link to="/due" className={linkClass("/due")}>?? Due Alerts</Link>'
    )
    content = content.replace(
        '<Route path="/whatsapp" element={<ProtectedRoute><Layout><WhatsAppReminders /></Layout></ProtectedRoute>} />',
        '<Route path="/whatsapp" element={<ProtectedRoute><Layout><WhatsAppReminders /></Layout></ProtectedRoute>} />\n          <Route path="/due" element={<ProtectedRoute><Layout><PaymentDue /></Layout></ProtectedRoute>} />'
    )
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Route added!")
else:
    print("Already exists")
