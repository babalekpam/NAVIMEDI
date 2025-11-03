#!/bin/bash
# Fix ALL uuid references to users.id (which is varchar)

cd /var/www/vhosts/navimedi.org/httpdocs/NaviMed

echo "🔧 Fixing all user_id type mismatches..."

# Backup
cp shared/schema.ts shared/schema.ts.backup2

# Fix all uuid references to users.id - change them to varchar
sed -i 's/sharedByUserId: uuid("shared_by_user_id")\.references(() => users\.id)/sharedByUserId: varchar("shared_by_user_id").references(() => users.id)/g' shared/schema.ts
sed -i 's/userId: uuid("user_id")\.references(() => users\.id)/userId: varchar("user_id").references(() => users.id)/g' shared/schema.ts
sed -i 's/approvedUserId: uuid("approved_user_id")\.references(() => users\.id)/approvedUserId: varchar("approved_user_id").references(() => users.id)/g' shared/schema.ts
sed -i 's/viewerUserId: uuid("viewer_user_id")\.references(() => users\.id)/viewerUserId: varchar("viewer_user_id").references(() => users.id)/g' shared/schema.ts
sed -i 's/inquirerUserId: uuid("inquirer_user_id")\.references(() => users\.id)/inquirerUserId: varchar("inquirer_user_id").references(() => users.id)/g' shared/schema.ts
sed -i 's/buyerUserId: uuid("buyer_user_id")\.references(() => users\.id)/buyerUserId: varchar("buyer_user_id").references(() => users.id)/g' shared/schema.ts
sed -i 's/reviewerUserId: uuid("reviewer_user_id")\.references(() => users\.id)/reviewerUserId: varchar("reviewer_user_id").references(() => users.id)/g' shared/schema.ts

echo "✅ All user references fixed!"
echo "Backup saved to shared/schema.ts.backup2"
