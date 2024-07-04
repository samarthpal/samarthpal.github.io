import axios from 'axios'

const GOOGLE_FORM_URL = import.meta.env.VITE_APP_GOOGLE_FORM_URL
const NAME_ID = import.meta.env.VITE_APP_GOOGLE_FORM_NAME_ID
const EMAIL_ID = import.meta.env.VITE_APP_GOOGLE_FORM_EMAIL_ID
const MESSAGE_ID = import.meta.env.VITE_APP_GOOGLE_FORM_MESSAGE_ID

export default async function Main(formData) {
  const form = new FormData()
  form.append(`entry.${NAME_ID}`, formData.name)
  form.append(`entry.${EMAIL_ID}`, formData.email)
  form.append(`entry.${MESSAGE_ID}`, formData.message)

  return axios({
    method: 'post',
    url: GOOGLE_FORM_URL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: form
  })
    .then(() => {
      alert('Message sent successfully!')
    })
    .catch(() => {
      alert('Failed to send the message. Please try again later.')
    })
}
