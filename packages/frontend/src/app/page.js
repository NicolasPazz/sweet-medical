import Link from 'next/link';
import { getApiBaseUrl } from '@/lib/api-utils';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-24 dark:bg-black">
      <main className="flex w-full max-w-lg flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Sweet Medical
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Plataforma para la gestión de turnos, profesionales y servicios de salud.
        </p>
        <p className="text-sm text-zinc-500">
          API en{' '}
          <code className="rounded bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-800">
            {getApiBaseUrl()}
          </code>
        </p>
        <Link
          href="/health"
          className="text-sm font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
        >
          Ver estado del backend (/health)
        </Link>
      </main>
    </div>
  );
}
