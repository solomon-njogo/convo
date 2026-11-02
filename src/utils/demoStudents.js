import { DEMO_USERS_KEY, notifyDemoUsersChanged } from '../hooks/usePeers'

/** Shared password for all seeded demo students (Login for two-browser tests). */
export const DEMO_STUDENT_PASSWORD = 'demo1234'

/**
 * Seed Peer directory classmates. Merges missing emails only — never overwrites
 * a profile you already Registered.
 */
export const DEMO_STUDENTS = [
  {
    uid: 'demo-student-alex',
    displayName: 'Alex Kim',
    email: 'alex@studynt.demo',
    password: DEMO_STUDENT_PASSWORD,
    photoURL: null,
  },
  {
    uid: 'demo-student-jordan',
    displayName: 'Jordan Lee',
    email: 'jordan@studynt.demo',
    password: DEMO_STUDENT_PASSWORD,
    photoURL: null,
  },
  {
    uid: 'demo-student-sam',
    displayName: 'Sam Okello',
    email: 'sam@studynt.demo',
    password: DEMO_STUDENT_PASSWORD,
    photoURL: null,
  },
  {
    uid: 'demo-student-maya',
    displayName: 'Maya Wanjiku',
    email: 'maya@studynt.demo',
    password: DEMO_STUDENT_PASSWORD,
    photoURL: null,
  },
]

export function ensureDemoStudents() {
  if (typeof localStorage === 'undefined') return { added: 0 }

  let users
  try {
    users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) ?? '{}')
  } catch {
    users = {}
  }
  if (!users || typeof users !== 'object') users = {}

  let added = 0
  for (const student of DEMO_STUDENTS) {
    const key = student.email.toLowerCase()
    if (users[key]) continue
    users[key] = { ...student }
    added += 1
  }

  if (added > 0) {
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users))
    notifyDemoUsersChanged()
  }

  return { added }
}
