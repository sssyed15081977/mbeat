// Shares a link through the phone's share sheet. Browsers without one (most
// desktops) open WhatsApp with the text and link instead.
export async function shareLink({ title, text, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
    } catch {
      // Cancelled by the user; nothing to do.
    }
    return
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank', 'noopener')
}
