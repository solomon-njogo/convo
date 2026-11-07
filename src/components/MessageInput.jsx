import { useId, useState } from 'react'
import { Send } from 'lucide-react'
import { canSendMessage, getComposerHint } from '../utils/messages'

export default function MessageInput({
  onSend,
  disabled = false,
  peerDisplayName = '',
}) {
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState(null)
  const fieldId = useId()
  const hintId = useId()
  const errorId = useId()

  const hint = getComposerHint(text)
  const canSend = canSendMessage(text) && !isSending && !disabled
  const name = peerDisplayName.trim()
  const placeholder = name ? `Message ${name}` : 'Write a message'

  async function submit() {
    if (!canSendMessage(text) || isSending || disabled) return

    setIsSending(true)
    setSendError(null)
    const draft = text

    try {
      await onSend(draft)
      setText('')
    } catch (err) {
      const detail =
        err instanceof Error && err.message.trim()
          ? err.message
          : 'We couldn’t send that message. Check your connection and try again.'
      setSendError(detail)
      setText(draft)
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(event) {
    if (event.key !== 'Enter') return
    if (event.shiftKey) return
    event.preventDefault()
    void submit()
  }

  const describedBy = [hint ? hintId : null, sendError ? errorId : null]
    .filter(Boolean)
    .join(' ') || undefined

  return (
    <div className="chat-composer">
      {sendError && (
        <p id={errorId} className="chat-composer__error" role="alert">
          {sendError}
        </p>
      )}
      <div className="chat-composer__row">
        <label className="visually-hidden" htmlFor={fieldId}>
          Message
        </label>
        <textarea
          id={fieldId}
          className="chat-composer__field"
          rows={1}
          value={text}
          disabled={disabled || isSending}
          placeholder={placeholder}
          aria-invalid={Boolean(hint)}
          aria-describedby={describedBy}
          onChange={(event) => {
            setText(event.target.value)
            if (sendError) setSendError(null)
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className="btn btn--primary btn--icon chat-composer__send"
          disabled={!canSend}
          aria-busy={isSending || undefined}
          aria-label={isSending ? 'Sending message' : 'Send message'}
          onClick={() => void submit()}
        >
          {isSending ? (
            <span className="btn__spinner" aria-hidden="true" />
          ) : (
            <Send size={18} aria-hidden="true" />
          )}
        </button>
      </div>
      {hint && (
        <p id={hintId} className="chat-composer__hint">
          {hint}
        </p>
      )}
    </div>
  )
}
