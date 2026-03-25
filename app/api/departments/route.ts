import { NextResponse } from 'next/server'

const departments = [
    { slug: 'engineering', name: 'Engineering', desc: 'Civil, Mechanical, Electrical & Computer' },
    { slug: 'sciences', name: 'Sciences', desc: 'Math, Physics, Chemistry, Biology' },
    { slug: 'social-sciences', name: 'Social Sciences', desc: 'Economics, Sociology, Mass Comm.' },
    { slug: 'business', name: 'Business', desc: 'Accounting, Management, Finance' },
    { slug: 'humanities', name: 'Humanities', desc: 'Languages, History, Philosophy' },
    { slug: 'law', name: 'Law', desc: 'Undergrad and postgraduate law programs' },
]

export async function GET() {
    return NextResponse.json(departments)
}