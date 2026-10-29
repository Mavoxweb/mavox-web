import { QuoteDetail } from "./QuoteDetail";

export default async function QuoteEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuoteDetail quoteId={id} />;
}