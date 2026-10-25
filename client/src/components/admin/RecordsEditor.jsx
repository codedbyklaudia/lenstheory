import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import Button from '../Button'
import FieldInput, { moveItem } from './FieldInput'

const smallButton =
  'rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink transition hover:border-ink disabled:opacity-30 disabled:hover:border-line'

// The dashboard's "Gallery" and "Services" tabs. Both are the same idea: a list of database rows
// you can add, edit, delete and reorder, so one component does both. What differs is passed in:
//   endpoint   '/api/photos' or '/api/services' (GET, POST, PUT /:id, DELETE /:id, PUT /order)
//   fields     which inputs to show for one row (from data/adminFields.js)
//   newRecord  the starting values for "Add"
//   itemLabel  'photo' or 'service', for button texts
//   getTitle / getImage   how to show a row while it is folded up
export default function RecordsEditor({ endpoint, fields, newRecord, itemLabel, getTitle, getImage, intro }) {
  const [records, setRecords] = useState(null)
  const [error, setError] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // EFFECT: load the rows when the tab opens.
  useEffect(() => {
    apiFetch(endpoint)
      .then(setRecords)
      .catch((err) => setError(err.message))
  }, [endpoint])

  if (!records) return <p className="text-ink-soft">{error || 'Loading…'}</p>

  // Move a row up or down: update the screen straight away, then save the new order.
  async function move(index, direction) {
    const reordered = moveItem(records, index, direction)
    setRecords(reordered)
    try {
      await apiFetch(`${endpoint}/order`, { method: 'PUT', body: JSON.stringify({ ids: reordered.map((r) => r.id) }) })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-ink-soft">{intro}</p>
        {!isAdding && <Button onClick={() => setIsAdding(true)}>+ Add {itemLabel}</Button>}
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-ember/10 px-4 py-3 text-sm text-ember">
          {error}
        </p>
      )}

      {isAdding && (
        <RecordCard
          record={newRecord}
          isNew
          startOpen
          {...{ endpoint, fields, itemLabel, getTitle, getImage }}
          onSaved={(created) => {
            setRecords((current) => [...current, created])
            setIsAdding(false)
          }}
          onCancel={() => setIsAdding(false)}
        />
      )}

      <ol className="flex flex-col gap-3">
        {records.map((record, index) => (
          <li key={record.id} className="flex gap-2">
            <div className="flex flex-col gap-1 pt-4">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className={smallButton} aria-label={`Move ${getTitle(record)} up`}>
                &uarr;
              </button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === records.length - 1} className={smallButton} aria-label={`Move ${getTitle(record)} down`}>
                &darr;
              </button>
            </div>
            <RecordCard
              record={record}
              {...{ endpoint, fields, itemLabel, getTitle, getImage }}
              onSaved={(updated) => setRecords((current) => current.map((r) => (r.id === updated.id ? updated : r)))}
              onDeleted={() => setRecords((current) => current.filter((r) => r.id !== record.id))}
            />
          </li>
        ))}
      </ol>
      {records.length === 0 && <p className="py-10 text-center text-ink-soft">Nothing here yet.</p>}
    </div>
  )
}

// One row: folded up it shows a thumbnail and title; opened it shows the form.
// It keeps its own `draft` (the form's values) until you press Save.
function RecordCard({ record, isNew = false, startOpen = false, endpoint, fields, itemLabel, getTitle, getImage, onSaved, onDeleted, onCancel }) {
  const [isOpen, setIsOpen] = useState(startOpen)
  const [draft, setDraft] = useState(record)
  const [error, setError] = useState('')
  const [isBusy, setIsBusy] = useState(false)

  // Runs a request, showing "busy" while it is on its way and the server's message if it fails.
  async function run(request) {
    setIsBusy(true)
    setError('')
    try {
      await request()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsBusy(false)
    }
  }

  // New rows are created with POST; existing rows are updated with PUT /:id.
  const save = () =>
    run(async () => {
      const result = await apiFetch(isNew ? endpoint : `${endpoint}/${record.id}`, {
        method: isNew ? 'POST' : 'PUT',
        body: JSON.stringify(draft),
      })
      setDraft(result)
      setIsOpen(false)
      onSaved(result)
    })

  const remove = () => {
    if (!window.confirm(`Delete "${getTitle(record)}"? This cannot be undone.`)) return
    run(async () => {
      await apiFetch(`${endpoint}/${record.id}`, { method: 'DELETE' })
      onDeleted()
    })
  }

  function cancel() {
    setDraft(record)
    setError('')
    setIsOpen(false)
    onCancel?.()
  }

  const image = getImage(isOpen ? draft : record)

  return (
    <div className="min-w-0 flex-1 rounded-2xl border border-line bg-cream">
      <div className="flex items-center gap-4 p-3 sm:p-4">
        <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-tint sm:size-16">
          {image && <img src={image} alt="" className="size-full object-cover" />}
        </div>
        <p className="min-w-0 flex-1 truncate font-medium">{isNew ? `New ${itemLabel}` : getTitle(record)}</p>
        {!isOpen && (
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
            Edit
          </Button>
        )}
      </div>

      {isOpen && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            save()
          }}
          className="flex flex-col gap-5 border-t border-line p-4 sm:p-6"
        >
          {fields.map((field) => (
            <FieldInput
              key={field.name}
              field={field}
              value={draft[field.name]}
              onChange={(value) => setDraft((current) => ({ ...current, [field.name]: value }))}
            />
          ))}

          {error && (
            <p role="alert" className="text-sm text-ember">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isBusy}>
              {isBusy ? 'Saving…' : isNew ? `Add ${itemLabel}` : 'Save'}
            </Button>
            <Button variant="ghost" size="sm" onClick={cancel} disabled={isBusy}>
              Cancel
            </Button>
            {!isNew && (
              <button
                type="button"
                onClick={remove}
                disabled={isBusy}
                className="ml-auto text-sm font-medium text-ember underline-offset-4 hover:underline"
              >
                Delete {itemLabel}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
