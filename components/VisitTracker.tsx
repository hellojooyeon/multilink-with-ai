"use client";

import { useEffect, useRef } from "react";
import { recordVisit } from "@/app/actions/analytics";

export function VisitTracker() {
    const hasRecorded = useRef(false);

    useEffect(() => {
        if (!hasRecorded.current) {
            recordVisit();
            hasRecorded.current = true;
        }
    }, []);

    return null;
}
