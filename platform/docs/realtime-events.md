# Realtime Events

The websocket gateway is now implemented for authenticated room presence, typing, and message fanout.

Implemented events:

- `room.join`
- `room.leave`
- `message.created`
- `message.updated`
- `message.deleted`
- `reaction.added`
- `typing.started`
- `typing.stopped`
- `presence.changed`

Reserved next events:

- `call.offer`
- `call.answer`
- `call.candidate`
- `call.join`
- `call.leave`
- `file-transfer.signal`
- `notification.pushed`
