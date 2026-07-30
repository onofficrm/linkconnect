import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <Header />
      <main className="main">{children}</main>
      <Footer />
    </Providers>
  );
}
