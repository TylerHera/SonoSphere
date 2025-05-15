import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to SonoSphere</h1>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/login">Login</Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/signup">Sign Up</Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/collection">Collection Search</Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/settings/profile">Profile</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
