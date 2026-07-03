# Read the file
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add import
if "WhatsAppReminders" not in content:
    content = content.replace(
        "import { Reports }",
        'import { WhatsAppReminders } from "./pages/WhatsAppReminders";\nimport { Reports }'
    )
    
    # Add sidebar link
    content = content.replace(
        "{Icons.reports} Reports</Link>",
        '{Icons.reports} Reports</Link>\n        <Link to="/whatsapp" className={linkClass("/whatsapp")}>?? WhatsApp</Link>'
    )
    
    # Add route
    content = content.replace(
        '<Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />',
        '<Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />\n          <Route path="/whatsapp" element={<ProtectedRoute><Layout><WhatsAppReminders /></Layout></ProtectedRoute>} />'
    )

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("WhatsApp route added!")
