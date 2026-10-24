// Who counts as an admin: the email addresses listed in ADMIN_EMAILS (comma-separated) in .env.
//   ADMIN_EMAILS=klaudia@example.com,assistant@example.com
export function isAdmin(user) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  return Boolean(user) && adminEmails.includes(user.email.toLowerCase())
}

// Put this AFTER requireAuth (which sets req.user) on any route only admins may use.
// Signed in but not an admin -> 403 Forbidden.
export function requireAdmin(req, res, next) {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ error: 'Admins only' })
  }
  next()
}
