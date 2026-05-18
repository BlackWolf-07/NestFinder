import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-9xl font-bold text-gray-200">404</h1>
      <p className="text-2xl font-semibold mt-4">Oops! Page not found.</p>
      <Link to="/" className="mt-6 text-primary hover:underline font-medium">
        Go back to Home
      </Link>
    </div>
  );
}
