export default function UserSearch({ value, onChange, id = 'peer-search' }) {
  return (
    <div className="field peer-search">
      <label className="field__label" htmlFor={id}>
        Search students
      </label>
      <input
        id={id}
        className="field__control"
        type="search"
        role="searchbox"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by name or email"
        autoComplete="off"
      />
    </div>
  )
}
