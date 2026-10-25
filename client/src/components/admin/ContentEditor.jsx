import { useEffect, useState } from 'react'
import { contentSections } from '../../data/adminFields'
import { apiFetch } from '../../lib/api'
import Button from '../Button'
import FieldInput from './FieldInput'

// The dashboard's "Page content" tab: pick a section of the page on the left, edit its text and
// photos on the right, then Save. Saving sends the section to PUT /api/content/:key, and the
// public site shows the new text on its next page load.
export default function ContentEditor() {
  const [saved, setSaved] = useState(null) // what the server has: { hero: {...}, about: {...}, ... }
  const [drafts, setDrafts] = useState(null) // the same, plus the admin's unsaved changes
  const [activeKey, setActiveKey] = useState(contentSections[0].key)
  const [status, setStatus] = useState('') // a short message after saving, e.g. 'Saved'
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // EFFECT: load the current content once, when the tab opens.
  useEffect(() => {
    apiFetch('/api/content')
      .then((content) => {
        setSaved(content)
        setDrafts(content)
      })
      .catch((err) => setError(err.message))
  }, [])

  if (!drafts) return <p className="text-ink-soft">{error || 'Loading the page content…'}</p>

  const section = contentSections.find((s) => s.key === activeKey)
  const draft = drafts[activeKey]
  // Comparing as text is the simplest way to compare two nested objects.
  const hasChanges = (key) => JSON.stringify(drafts[key]) !== JSON.stringify(saved[key])

  function changeField(name, value) {
    setStatus('')
    setDrafts((current) => ({ ...current, [activeKey]: { ...current[activeKey], [name]: value } }))
  }

  // Both Save and Reset answer with the section as it now is, which becomes the new "saved" copy.
  async function send(method, body) {
    setIsSaving(true)
    setError('')
    try {
      const result = await apiFetch(`/api/content/${activeKey}`, { method, body: body && JSON.stringify(body) })
      setSaved((current) => ({ ...current, [activeKey]: result }))
      setDrafts((current) => ({ ...current, [activeKey]: result }))
      setStatus(method === 'PUT' ? 'Saved. The site now shows your changes.' : 'Back to the original text.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  function handleReset() {
    if (window.confirm(`Undo every change ever saved to "${section.label}" and go back to the original text?`)) {
      send('DELETE')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr] lg:items-start">
      {/* Section picker. A dot marks sections with unsaved changes. */}
      <nav aria-label="Page sections" className="flex gap-2 overflow-x-auto lg:sticky lg:top-6 lg:flex-col">
        {contentSections.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-current={s.key === activeKey}
            onClick={() => {
              setActiveKey(s.key)
              setStatus('')
              setError('')
            }}
            className={`flex shrink-0 items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition ${
              s.key === activeKey ? 'bg-ink text-cream' : 'bg-cream text-ink hover:bg-line/60'
            }`}
          >
            {s.label}
            {hasChanges(s.key) && <span aria-label="unsaved changes" className="size-2 rounded-full bg-ember" />}
          </button>
        ))}
      </nav>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          send('PUT', draft)
        }}
        className="flex flex-col gap-5 rounded-2xl border border-line bg-cream p-5 sm:p-8"
      >
        <div>
          <h2 className="font-display text-3xl">{section.label}</h2>
          {section.description && <p className="mt-1 text-sm text-ink-soft">{section.description}</p>}
        </div>

        {section.fields.map((field) => (
          <FieldInput key={field.name} field={field} value={draft[field.name]} onChange={(value) => changeField(field.name, value)} />
        ))}

        {/* Save bar: stays at the bottom of the screen while scrolling through a long form */}
        <div className="sticky bottom-0 -mx-5 -mb-5 flex flex-wrap items-center gap-3 rounded-b-2xl border-t border-line bg-cream/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:-mb-8 sm:px-8">
          <Button type="submit" disabled={isSaving || !hasChanges(activeKey)}>
            {isSaving ? 'Saving…' : 'Save changes'}
          </Button>
          {hasChanges(activeKey) && (
            <Button variant="ghost" size="sm" onClick={() => setDrafts((current) => ({ ...current, [activeKey]: saved[activeKey] }))}>
              Discard
            </Button>
          )}
          <button type="button" onClick={handleReset} className="text-sm text-ink-soft underline underline-offset-4 hover:text-ember">
            Reset to original
          </button>
          <a href="/" target="_blank" rel="noreferrer" className="ml-auto text-sm font-medium text-ember underline-offset-4 hover:underline">
            View the site &#8599;
          </a>
          <p aria-live="polite" className="w-full text-sm">
            {error ? <span className="text-ember">{error}</span> : <span className="text-ink-soft">{status}</span>}
          </p>
        </div>
      </form>
    </div>
  )
}
