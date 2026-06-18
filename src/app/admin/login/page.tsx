import { Container } from "@/components/ui/Container";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="py-16">
      <Container>
        <AdminLoginForm />
      </Container>
    </main>
  );
}
