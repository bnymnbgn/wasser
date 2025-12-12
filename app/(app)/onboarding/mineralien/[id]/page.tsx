import MineralDetailClient from "./MineralDetailClient";
import { MINERAL_ARTICLES } from "@/src/domain/academyContent";

export function generateStaticParams() {
  return Object.keys(MINERAL_ARTICLES).map((id) => ({ id }));
}

export default function MineralDetailPage({ params }: { params: { id: string } }) {
  return <MineralDetailClient mineralId={params.id} />;
}
