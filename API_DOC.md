# Client Negotiation Agent — API Docs

Base URL (local dev): `http://127.0.0.1:8000`

Interactive Swagger UI is also available at `/docs` whenever the server is running.

## POST /chat

Send a message to the negotiation agent and get its reply.

### Request

```
POST /chat
Content-Type: application/json
```

| Field       | Type   | Required | Default     | Description                                                                 |
|-------------|--------|----------|-------------|-------------------------------------------------------------------------------|
| `message`   | string | yes      | —           | The user's message to the agent.                                             |
| `thread_id` | string | no       | `"default"` | Conversation/session id. Same `thread_id` = agent remembers prior messages in that conversation. Use a new/unique id per user session or per negotiation chat. |

```json
{
  "message": "Can we get a 20% discount on the annual plan?",
  "thread_id": "client-42-session-1"
}
```

### Response — 200 OK

```json
{
  "response": "I can offer a 10% discount if we lock in an annual commitment..."
}
```

| Field      | Type   | Description                  |
|------------|--------|-------------------------------|
| `response` | string | The agent's reply message.   |

### Notes for frontend integration

- **Conversation memory is server-side**, keyed by `thread_id`. The frontend doesn't need to send message history — just keep reusing the same `thread_id` for a given chat/negotiation thread, and start a new one (e.g. a UUID) for a new conversation.
- There is currently no auth/session validation on `thread_id` — treat it as a client-generated conversation key, not a security boundary.
- No streaming yet; the endpoint returns the full response once the agent finishes.
- Errors currently return FastAPI's default error shape (`{"detail": "..."}`) with a non-2xx status code.

## GET /

Simple health-check / root route.

```json
{ "message": "Hello from backend!" }
```
