import handler from '../handler'

const FORM_URL = import.meta.env.VITE_APP_GOOGLE_FORM_URL
const IDS = {
  name: import.meta.env.VITE_APP_GOOGLE_FORM_NAME_ID,
  email: import.meta.env.VITE_APP_GOOGLE_FORM_EMAIL_ID,
  message: import.meta.env.VITE_APP_GOOGLE_FORM_MESSAGE_ID
}

/** True when every env value the form needs is present. */
export const isConfigured = () => Boolean(FORM_URL && IDS.name && IDS.email && IDS.message)

// Accept either "entry.123" or "123" in env.
const entry = id => (String(id).startsWith('entry.') ? id : `entry.${id}`)

export default {
  /**
   * Sends a contact message to the Google Form.
   * @param {{ name: string, email: string, message: string }} args
   */
  send: ({ name, email, message }) => {
    if (!isConfigured()) return Promise.resolve({ success: false, error: 'not-configured' })
    return handler({
      url: FORM_URL,
      method: 'post',
      opaque: true,
      args: { [entry(IDS.name)]: name, [entry(IDS.email)]: email, [entry(IDS.message)]: message }
    })
  }
}
