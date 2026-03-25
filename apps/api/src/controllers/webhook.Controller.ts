import type { Context } from 'hono'
import { Webhook } from 'svix'
import type { AppEnv } from '../types'
import { getDb } from '../db/client'
import { users } from '../db/schema'

export const clerkWebhook = async (c: Context<AppEnv>) => {
    const webhookSecret = c.env.CLERK_WEBHOOK_SECRET

    const svixId = c.req.header('svix-id')
    const svixTimestamp = c.req.header('svix-timestamp')
    const svixSignature = c.req.header('svix-signature')

    if (!svixId || !svixTimestamp || !svixSignature) {
        return c.json({ error: 'Missing svix headers' }, 400)
    }

    const body = await c.req.text()

    let event: any
    try {
        const wh = new Webhook(webhookSecret)
        event = wh.verify(body, {
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature,
        })
    } catch {
        return c.json({ error: 'Invalid webhook signature' }, 401)
    }

    if (event.type === 'user.created') {
        const { id, email_addresses, first_name, last_name } = event.data

        const email = email_addresses?.[0]?.email_address ?? null
        const name = `${first_name ?? ''} ${last_name ?? ''}`.trim() || null

        const db = getDb(c.env.DB)
        await db.insert(users).values({ id, email, name }).onConflictDoNothing()
    }

    return c.json({ success: true })
}
