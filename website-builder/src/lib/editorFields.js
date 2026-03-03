const GROUP_ORDER = [
  'Hero',
  'Offer',
  'Social Proof',
  'Brand',
  'About',
  'Contact',
  'Content',
  'Other',
]

function normalize(text = '') {
  return String(text).toLowerCase().trim()
}

export function getFieldGroup(field) {
  const key = normalize(field?.key)
  const label = normalize(field?.label)
  const haystack = `${key} ${label}`

  if (/hero|headline|subheadline|subtitle|intro|opening|above the fold/.test(haystack)) return 'Hero'
  if (/price|pricing|plan|feature|benefit|cta|button|offer|service|product/.test(haystack)) return 'Offer'
  if (/testimonial|review|client|customer|case study|trust|social proof|logo/.test(haystack)) return 'Social Proof'
  if (/brand|color|palette|theme|accent|font|logo/.test(haystack)) return 'Brand'
  if (/about|story|mission|vision|team|founder/.test(haystack)) return 'About'
  if (/contact|email|phone|address|location|form|map/.test(haystack)) return 'Contact'
  if (haystack) return 'Content'
  return 'Other'
}

export function filterAndGroupFields(fields = [], query = '') {
  const queryValue = normalize(query)
  const filtered = queryValue
    ? fields.filter((field) => {
      const searchable = `${normalize(field?.key)} ${normalize(field?.label)} ${normalize(field?.type)}`
      return searchable.includes(queryValue)
    })
    : fields

  const groupedMap = new Map()
  filtered.forEach((field) => {
    const group = getFieldGroup(field)
    if (!groupedMap.has(group)) groupedMap.set(group, [])
    groupedMap.get(group).push(field)
  })

  const grouped = Array.from(groupedMap.entries()).map(([group, groupFields]) => ({
    group,
    fields: groupFields,
  }))

  grouped.sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group))
  return grouped
}
