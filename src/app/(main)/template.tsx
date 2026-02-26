import { PageTransition } from "@/components/ui/page-transition";

export default function MainTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
