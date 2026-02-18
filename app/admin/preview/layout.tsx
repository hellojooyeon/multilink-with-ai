import "@/app/globals.css";

// Reuse global styles but ensure we don't inherit admin layout if it exists (it doesn't seems to based on file list, but good practice to have isolation)
export default function PreviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            {children}
        </div>
    );
}
