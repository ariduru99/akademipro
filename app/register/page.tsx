import { RegisterForm } from "./RegisterForm";

function queryRole(role: string | string[] | undefined): string | null {
  if (role == null) return null;
  return typeof role === "string" ? role : role[0] ?? null;
}

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return <RegisterForm initialRoleQuery={queryRole(searchParams.role)} />;
}
