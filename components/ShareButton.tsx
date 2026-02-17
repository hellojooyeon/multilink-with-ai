"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

export function ShareButton() {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = window.location.href;

        if (navigator.share) {
            await navigator.share({ url });
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-all duration-200"
            aria-label="Share"
        >
            <Icon name={copied ? "Check" : "Share2"} size={16} />
            <span>{copied ? "복사됨!" : "공유"}</span>
        </button>
    );
}
