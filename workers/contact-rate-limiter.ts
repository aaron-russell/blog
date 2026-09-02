const RATE_LIMIT_TTL_SECONDS = 300

export class ContactRateLimiter {
  constructor(private readonly state: DurableObjectState) {}

  async fetch(): Promise<Response> {
    const existing = await this.state.storage.get('reservation')
    if (existing) return new Response(null, { status: 409 })

    await this.state.storage.put('reservation', Date.now(), {
      expirationTtl: RATE_LIMIT_TTL_SECONDS,
    })
    return new Response(null, { status: 204 })
  }
}

export default { ContactRateLimiter }
