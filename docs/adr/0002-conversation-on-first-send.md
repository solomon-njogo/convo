# Conversation is created on first send, not on Peer select

Selecting a Peer only sets Selected peer and focuses the chat pane. We create the Conversation document on the first successful message send so the Peer directory stays a directory of people, not an inbox of empty threads. Eager create-on-select was rejected because it would spam `conversations` with unused docs and blur directory vs conversation-list UX.
