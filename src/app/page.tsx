import { DayView } from "@/components/features/days/day-view";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const params = await searchParams;
  const dayId = params.day || null;

  return <DayView dayId={dayId} />;
}
