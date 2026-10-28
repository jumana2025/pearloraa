import { Link } from "react-router-dom";
import logo from "../assets/pearloraa-logo.jpeg";

const imageSizes = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-20 w-20",
};

export default function BrandLogo({
    to,
    size = "md",
    inverse = false,
    hideText = false,
    className = "",
}) {
    const content = (
        <div className={`flex items-center gap-3 ${className}`}>
            <img
                src={logo}
                alt="Pearl.oraaa | Jwellery.Made"
                className={`${imageSizes[size] || imageSizes.md} shrink-0 rounded-full border border-[#a48755]/60 object-cover`}
            />
            {!hideText && (
                <span className="flex flex-col leading-tight">
                    <span className={`font-serif text-base font-semibold tracking-wide ${inverse ? "text-[#f8f4ec]" : "text-[#1b4332]"}`}>
                        Pearl.oraaa
                    </span>
                    <span className="mt-1 text-[9px] font-medium tracking-[0.2em] text-[#a48755]">
                        Jwellery.Made
                    </span>
                </span>
            )}
        </div>
    );

    if (!to) return content;

    return (
        <Link to={to} aria-label="Pearl.oraaa | Jwellery.Made" className="inline-flex">
            {content}
        </Link>
    );
}
