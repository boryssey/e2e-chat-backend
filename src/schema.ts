import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable("user", {
    id: serial("id"),
    username: text("username"),
    password: text("password"),
    created_at: timestamp("created_at"),
    updated_at: timestamp("updated_at")
})