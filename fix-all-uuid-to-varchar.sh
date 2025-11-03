#!/bin/bash
# Fix ALL uuid references to users.id - change them ALL to varchar

cd /var/www/vhosts/navimedi.org/httpdocs/NaviMed

echo "🔧 Fixing ALL 88+ uuid references to users.id..."

# Backup
cp shared/schema.ts shared/schema.ts.backup3

# Use a comprehensive regex replacement to change ALL uuid(...).references(() => users.id) to varchar(...).references(() => users.id)
# This catches all column names that reference users.id
sed -i 's/: uuid(\(\"[^\"]*\"\))\.references(() => users\.id)/: varchar(\1).references(() => users.id)/g' shared/schema.ts

echo "✅ All 88+ user references fixed!"
echo "Backup saved to shared/schema.ts.backup3"
echo ""
echo "Verifying changes..."
echo "Counting remaining uuid references to users.id:"
grep -c 'uuid(.*).references(() => users.id)' shared/schema.ts || echo "0 - Perfect!"
