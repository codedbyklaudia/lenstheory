import { useId, useState } from 'react'
import { uploadImage } from '../../lib/uploadImage'

// One input for one field of the admin forms. `field` comes from data/adminFields.js and its
// `type` decides what is drawn. Like every input in the site it is CONTROLLED: the parent owns
// `value`, and we report every change with onChange(newValue).

export const inputClasses =
  'w-full rounded-lg border border-line bg-tint px-3 py-2 text-sm text-ink transition focus:border-ember focus:bg-cream focus:outline-none focus:ring-4 focus:ring-ember/15'

const smallButton =
  'rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-soft transition hover:border-ink hover:text-ink disabled:opacity-30 disabled:hover:border-line'

// Returns a NEW array with item `index` moved one place up (-1) or down (+1).
// (State is never changed directly, so we copy the array first.)
export function moveItem(items, index, direction) {
  const target = index + direction
  if (target < 0 || target >= items.length) return items
  const copy = [...items]
  ;[copy[index], copy[target]] = [copy[target], copy[index]]
  return copy
}

export default function FieldInput({ field, value, onChange }) {
  const id = useId()
  const labelClasses = 'text-sm font-medium text-ink'
  const isList = field.type === 'strings' || field.type === 'list'

  return (
    <div className="flex flex-col gap-1.5">
      {/* A list holds many inputs, so it gets a plain heading instead of a <label> for one input.
          A checkbox has its label written next to the box instead. */}
      {isList ? (
        <p className={labelClasses}>{field.label}</p>
      ) : (
        field.type !== 'checkbox' && (
          <label htmlFor={id} className={labelClasses}>
            {field.label}
          </label>
        )
      )}
      <Input id={id} field={field} value={value} onChange={onChange} />
      {field.hint && <p className="text-xs text-ink-soft">{field.hint}</p>}
    </div>
  )
}

function Input({ id, field, value, onChange }) {
  switch (field.type) {
    case 'textarea':
      return (
        <textarea id={id} rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={`${inputClasses} resize-y`} />
      )

    case 'number':
      return (
        <input
          id={id}
          type="number"
          min={0}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className={`${inputClasses} max-w-40`}
        />
      )

    case 'checkbox':
      return (
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
          <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-ember" />
          {field.label}
        </label>
      )

    case 'select':
      return (
        <select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={`${inputClasses} max-w-xs`}>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )

    case 'image':
      return <ImageInput id={id} value={value} onChange={onChange} />

    case 'strings':
      return <StringList field={field} items={value ?? []} onChange={onChange} />

    case 'list':
      return <ItemList field={field} items={value ?? []} onChange={onChange} />

    default:
      return <input id={id} type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputClasses} />
  }
}

// A photo: a preview, the address of the image, and an Upload button.
// Uploading sends the file to /api/uploads and puts the URL it returns into the field.
export function ImageInput({ id, value, onChange }) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(event) {
    const file = event.target.files[0]
    event.target.value = '' // so choosing the same file again still triggers onChange
    if (!file) return

    setIsUploading(true)
    setError('')
    try {
      onChange(await uploadImage(file))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-line bg-tint">
          {value && <img src={value} alt="" className="size-full object-cover" />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
          <input
            id={id}
            type="text"
            placeholder="/images/photo.jpg or https://..."
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClasses} min-w-0`}
          />
          {/* A <label> around a hidden file input: clicking the "button" opens the file picker */}
          <label
            className={`shrink-0 cursor-pointer rounded-full bg-ink px-4 py-2 text-center text-sm font-medium text-cream transition hover:bg-ember ${
              isUploading ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            {isUploading ? 'Uploading…' : 'Upload'}
            <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
          </label>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-xs text-ember">
          {error}
        </p>
      )}
    </div>
  )
}

// Small "↑ ↓ Remove" controls for one item of a list.
function ItemControls({ index, count, itemLabel, onMove, onRemove }) {
  return (
    <div className="flex shrink-0 gap-1">
      <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} className={smallButton} aria-label={`Move ${itemLabel} up`}>
        &uarr;
      </button>
      <button type="button" onClick={() => onMove(index, 1)} disabled={index === count - 1} className={smallButton} aria-label={`Move ${itemLabel} down`}>
        &darr;
      </button>
      <button type="button" onClick={() => onRemove(index)} className={`${smallButton} hover:border-ember hover:text-ember`}>
        Remove
      </button>
    </div>
  )
}

// A list of short texts (or of images, when field.itemType is 'image').
function StringList({ field, items, onChange }) {
  const itemLabel = field.itemLabel ?? 'item'
  const change = (index, newValue) => onChange(items.map((item, i) => (i === index ? newValue : item)))

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            {field.itemType === 'image' ? (
              <ImageInput value={item} onChange={(newValue) => change(index, newValue)} />
            ) : (
              <input
                type="text"
                aria-label={`${itemLabel} ${index + 1}`}
                value={item}
                onChange={(e) => change(index, e.target.value)}
                className={inputClasses}
              />
            )}
          </div>
          <ItemControls
            index={index}
            count={items.length}
            itemLabel={itemLabel}
            onMove={(i, direction) => onChange(moveItem(items, i, direction))}
            onRemove={(i) => onChange(items.filter((_, other) => other !== i))}
          />
        </div>
      ))}
      <AddButton label={itemLabel} onClick={() => onChange([...items, ''])} />
    </div>
  )
}

// A list of items that each have several fields (e.g. FAQ: question + answer).
// Each item's fields are drawn with FieldInput again, so a list can hold any field type.
function ItemList({ field, items, onChange }) {
  const itemLabel = field.itemLabel ?? 'item'
  const emptyItem = Object.fromEntries(field.fields.map((sub) => [sub.name, '']))

  function changeField(index, name, newValue) {
    onChange(items.map((item, i) => (i === index ? { ...item, [name]: newValue } : item)))
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-xl border border-line bg-cream p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-soft">
              {itemLabel} {index + 1}
            </p>
            <ItemControls
              index={index}
              count={items.length}
              itemLabel={itemLabel}
              onMove={(i, direction) => onChange(moveItem(items, i, direction))}
              onRemove={(i) => onChange(items.filter((_, other) => other !== i))}
            />
          </div>
          {field.fields.map((sub) => (
            <FieldInput key={sub.name} field={sub} value={item[sub.name]} onChange={(newValue) => changeField(index, sub.name, newValue)} />
          ))}
        </div>
      ))}
      <AddButton label={itemLabel} onClick={() => onChange([...items, emptyItem])} />
    </div>
  )
}

function AddButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start rounded-full border border-dashed border-ink/40 px-4 py-1.5 text-sm font-medium text-ink transition hover:border-ember hover:text-ember"
    >
      + Add {label}
    </button>
  )
}
