import ProfileDetailClient from "./ProfileDetailClient";
import { PROFILE_ARTICLES } from "@/src/domain/academyContent";

export function generateStaticParams() {
  return Object.keys(PROFILE_ARTICLES).map((id) => ({ id }));
}

export default function ProfileDetailPage({ params }: { params: { id: string } }) {
  return <ProfileDetailClient profileId={params.id} />;
}
