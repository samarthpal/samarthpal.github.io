import profile from 'data/profile.json'

export const OPEN_EVENT = 'terminal:open'

/** Lets any component open the global terminal without prop drilling. */
export const openTerminal = () => window.dispatchEvent(new CustomEvent(OPEN_EVENT))

// A line is either a string or { text, tone } where tone ∈ accent | muted | ok | error.
const L = (text, tone) => (tone ? { text, tone } : text)

const COMMANDS = {
  help: 'list commands',
  whoami: 'who is this guy',
  about: 'the longer version',
  'ls [work|skills|socials|archive]': 'list things',
  'open <slug|github|linkedin|resume>': 'open a case study or link',
  skills: 'the full inventory',
  contact: 'how to reach me',
  resume: 'download the resume (pdf)',
  neofetch: 'system info, but it is me',
  'sudo hire-me': 'you know you want to',
  play: 'start Bug Squash in the lab',
  clear: 'clear the screen',
  exit: 'close the terminal'
}

export const COMMAND_NAMES = [
  'help',
  'whoami',
  'about',
  'ls',
  'open',
  'skills',
  'contact',
  'resume',
  'neofetch',
  'sudo',
  'play',
  'clear',
  'exit',
  'echo',
  'date',
  'pwd',
  'cd'
]

const pad = (s, n) => (s + ' '.repeat(n)).slice(0, n)
const findWork = slug => profile.work.find(w => w.slug === slug)

const LOGO = ['    ______    ', '   /      \\   ', '  /  SP_   \\  ', '  \\        /  ', '   \\______/   ', '              ']

export const WELCOME = [
  L(`${profile.handle} — terminal v${profile.version}`, 'accent'),
  L("type 'help' to see what's possible. press esc or ` to close.", 'muted')
]

/**
 * Runs one command line.
 * @param {string} input
 * @returns {{ lines: Array<string|{text:string,tone:string}>, action?: object }}
 */
export function run(input) {
  const raw = input.trim()
  if (!raw) return { lines: [] }
  const [cmd, ...args] = raw.split(/\s+/)
  const arg = args.join(' ').toLowerCase()

  switch (cmd.toLowerCase()) {
    case 'help':
      return {
        lines: [
          L('available commands:', 'accent'),
          ...Object.entries(COMMANDS).map(([c, d]) => `  ${pad(c, 36)}${d}`),
          L('tip: tab completes, ↑/↓ walks history.', 'muted')
        ]
      }

    case 'whoami':
      return {
        lines: [
          L(profile.name, 'accent'),
          `${profile.title} @ ${profile.company}`,
          profile.location,
          L(profile.tagline, 'muted')
        ]
      }

    case 'about':
      return { lines: [...profile.bio, ''] }

    case 'ls': {
      const what = arg || 'work'
      if (what === 'work')
        return {
          lines: [
            L('case studies (open <slug>):', 'accent'),
            ...profile.work.map(w => `  ${pad(w.slug, 18)}${pad(w.name, 32)}${w.industry}`)
          ]
        }
      if (what === 'skills') return run('skills')
      if (what === 'socials')
        return { lines: profile.socials.map(s => `  ${pad(s.label.toLowerCase(), 12)}${s.url}`) }
      if (what === 'archive')
        return { lines: profile.archive.map(a => `  ${pad(a.name, 24)}${a.url || '(private)'}`) }
      return { lines: [L(`ls: cannot access '${what}': no such directory`, 'error')] }
    }

    case 'open': {
      if (!arg) return { lines: [L('usage: open <slug|github|linkedin|resume>', 'error')] }
      const social = profile.socials.find(s => s.label.toLowerCase() === arg)
      if (social) return { lines: [L(`opening ${social.url}`, 'ok')], action: { type: 'external', url: social.url } }
      if (arg === 'resume') return run('resume')
      if (arg === 'lab' || arg === 'playground')
        return { lines: [L('opening the lab…', 'ok')], action: { type: 'navigate', to: '/playground' } }
      const work = findWork(arg)
      if (work)
        return { lines: [L(`opening ${work.name}…`, 'ok')], action: { type: 'navigate', to: `/work/${work.slug}` } }
      return { lines: [L(`open: '${arg}' not found. try 'ls work'`, 'error')] }
    }

    case 'skills':
      return {
        lines: profile.skills.flatMap(g => [L(g.group.toLowerCase(), 'accent'), `  ${g.items.map(i => i.name).join(', ')}`])
      }

    case 'contact':
      return {
        lines: [
          `  ${pad('email', 10)}${profile.contact.email}`,
          `  ${pad('phone', 10)}${profile.contact.phone}`,
          ...profile.socials.slice(0, 2).map(s => `  ${pad(s.label.toLowerCase(), 10)}${s.url}`),
          L("or run 'sudo hire-me'", 'muted')
        ]
      }

    case 'resume':
      return { lines: [L('fetching resume.pdf…', 'ok')], action: { type: 'external', url: '/resume.pdf' } }

    case 'neofetch': {
      const info = [
        L(`samarth@${profile.company.split(' ')[0].toLowerCase()}`, 'accent'),
        '------------------',
        `role:     ${profile.role}, ${profile.company}`,
        `location: ${profile.location}`,
        'shell:    zsh + caffeine',
        'stack:    React · Node · MongoDB · AWS',
        `langs:    JS, C, C++, Java, C#, Python, PHP`,
        `uptime:   shipping since college`,
        `version:  portfolio v${profile.version}`
      ]
      return {
        lines: info.map((line, i) => {
          const art = LOGO[i] || ' '.repeat(14)
          return typeof line === 'string' ? `${art}  ${line}` : { ...line, text: `${art}  ${line.text}` }
        })
      }
    }

    case 'sudo':
      if (arg === 'hire-me' || arg === 'hire me')
        return {
          lines: [
            '[sudo] password for recruiter: ********',
            L('access granted. opening a secure channel…', 'ok')
          ],
          action: { type: 'section', id: 'contact' }
        }
      return { lines: [L(`${args.join(' ') || 'sudo'}: nice try. this incident will be reported.`, 'error')] }

    case 'play':
    case 'game':
      return {
        lines: [L('INSERT COIN… loading Bug Squash', 'ok')],
        action: { type: 'navigate', to: '/playground', state: { lab: 'bugs' } }
      }

    case 'echo':
      return { lines: [args.join(' ')] }

    case 'date':
      return { lines: [new Date().toString()] }

    case 'pwd':
      return { lines: ['/home/samarth/portfolio'] }

    case 'cd':
      return { lines: [L("there's no place like ~", 'muted')] }

    case 'rm':
      return { lines: [L('rm: permission denied. the portfolio stays.', 'error')] }

    case 'vim':
    case 'nano':
      return { lines: [L("you'd never get out. try 'exit' instead.", 'muted')] }

    case 'clear':
      return { lines: [], action: { type: 'clear' } }

    case 'exit':
      return { lines: [], action: { type: 'close' } }

    default:
      return { lines: [L(`command not found: ${cmd}. try 'help'`, 'error')] }
  }
}

/** Completes the first word against known commands. */
export function complete(input) {
  const value = input.trimStart()
  if (value.includes(' ')) {
    const [cmd, partial = ''] = value.split(/\s+/)
    if (cmd === 'open') {
      const pool = [...profile.work.map(w => w.slug), 'github', 'linkedin', 'resume', 'lab']
      const hit = pool.find(p => p.startsWith(partial.toLowerCase()))
      return hit ? `open ${hit}` : input
    }
    if (cmd === 'ls') {
      const hit = ['work', 'skills', 'socials', 'archive'].find(p => p.startsWith(partial.toLowerCase()))
      return hit ? `ls ${hit}` : input
    }
    return input
  }
  const hit = COMMAND_NAMES.find(c => c.startsWith(value.toLowerCase()))
  return hit || input
}
