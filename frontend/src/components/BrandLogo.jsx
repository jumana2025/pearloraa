import { Link } from "react-router-dom";
import greenLogo from "../assets/logo-pearloraa-lockup-green.png";
import whiteLogo from "../assets/logo-pearloraa-lockup-white.png";

const imageSizes = {
    sm: "h-10 w-40",
    md: "h-12 w-48",
    lg: "h-16 w-64",
};

export default function BrandLogo({
    to,
    size = "md",
    inverse = false,
    compact = false,
    className = "",
}) {
    const content = (
        <div className={`flex items-center ${className}`}>
            <img
                src={inverse ? whiteLogo : greenLogo}
                alt="PEARL ORAA Jewellery. Made"
                className={`${compact ? "h-5 w-20" : imageSizes[size] || imageSizes.md} shrink-0 object-contain`}
            />
        </div>
    );

    if (!to) return content;

    return (
        <Link to={to} aria-label="Pearloraa home" className="inline-flex">
            {content}
        </Link>
    );
}
