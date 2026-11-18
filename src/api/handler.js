/**
 * The one place that talks to the network.
 *
 * `opaque: true` is for endpoints that don't send CORS headers (Google Forms).
 * The browser lets the POST through in `no-cors` mode but hides the response,
 * so a resolved fetch counts as success and only a network failure counts as an error.
 *
 * @param {{ url: string, method?: string, args?: Record<string,string>, opaque?: boolean }} options
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export default async function handler({ url, method = 'get', args = {}, opaque = false }) {
  if (!url) return { success: false, error: 'missing-url' }

  try {
    if (opaque) {
      await fetch(url, { method: method.toUpperCase(), mode: 'no-cors', body: new URLSearchParams(args) })
      return { success: true }
    }

    const isGet = method.toLowerCase() === 'get'
    const target = isGet && Object.keys(args).length ? `${url}?${new URLSearchParams(args)}` : url
    const res = await fetch(target, {
      method: method.toUpperCase(),
      headers: isGet ? undefined : { 'Content-Type': 'application/json' },
      body: isGet ? undefined : JSON.stringify(args)
    })
    const data = await res.json().catch(() => null)
    return res.ok ? { success: true, data } : { success: false, data, error: `http-${res.status}` }
  } catch (error) {
    return { success: false, error: error?.message || 'network-error' }
  }
}
