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
- `call.join`
- `call.leave`
- `call.offer`
- `call.answer`
- `call.candidate`
- `screen.start`
- `screen.stop`

Reserved next events:

- `file-transfer.signal`
- `notification.pushed`
