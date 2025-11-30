// src/hooks/useOptionalAuth.tsx - ФИНАЛНА ВЕРСИЯ!

import { useState, useEffect } from "react";
import { getCurrentUserOptional } from "../api/auth";

export function useOptionalAuth() {
    const [user, setUser] = useState<any | null>(null);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        check();
    }, []);

    const check = async () => {
        const userData = await getCurrentUserOptional();
        setUser(userData);
        setChecked(true);
    };

    return { user, checked };
}