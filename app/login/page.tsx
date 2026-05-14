import { LoginForm } from "./LoginForm";

function queryRole(role: string | string[] | undefined): string | null {
  if (role == null) return null;
  return typeof role === "string" ? role : role[0] ?? null;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return <LoginForm roleHint={queryRole(searchParams.role)} />;
}
