import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";

interface IconProps extends LucideProps {
    name: string;
}

export const Icon = ({ name, ...props }: IconProps) => {
    const LucideIcon = Icons[name as keyof typeof Icons] as React.ElementType;

    if (!LucideIcon) {
        return <Icons.Link {...props} />; // Default fallback
    }

    return <LucideIcon {...props} />;
};
