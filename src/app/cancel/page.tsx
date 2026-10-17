export default function CancelPage() {
  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-4xl brand-accent mb-4">Checkout canceled</h1>
      <p className="mb-4">No checkout was completed. You can return home and try again.</p>
      <a className="underline" href="/">Return home</a>
    </main>
  );
}
