import { NextResponse } from 'next/server'

export async function GET() {
    // dummy counts (you can replace with DB calls later)
    const payload = {
        students: 15710,
        faculties: 8,
        research_grants: 1200000000,
        alumni: 45000,
    }
    return NextResponse.json(payload)
}