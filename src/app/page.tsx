import dynamic from "next/dynamic";

const HomePageClient = dynamic(() => import("./page.client"), {
  ssr: false,
  loading: () => <HomePageSkeleton />,
});

function HomePageSkeleton() {
  return (
    <main className="grid gap-4">
      <div className="h-[572px] w-full animate-pulse rounded-lg bg-foreground/5" />
      <div className="h-[290px] w-full animate-pulse rounded-lg bg-foreground/5" />
    </main>
  );
}

export default function HomePage() {
  return <HomePageClient />;
}
