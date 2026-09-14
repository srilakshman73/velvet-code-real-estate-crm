import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
    redirectTo: '/login',
  });

  response.cookies.delete('velvet_auth_role');
  response.cookies.delete('velvet_auth_email');
  response.cookies.delete('velvet_auth_org');

  return response;
}
