import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

export default function Footer() {
    return (
        <footer className="bg-[#1b4332] text-[#f8f4ec] py-10">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <BrandLogo to="/home" size="md" className="mb-4" />
                    <p className="text-sm opacity-80">
                        Discover the finest collection of elegantly crafted products, tailored to match your unique aesthetic.
                    </p>
                    <a
                        href="https://www.instagram.com/pearl.oraaa?utm_source=ig_web_button_share_sheet&exln=ZDNlZDc0MzIxNw=="
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Visit Pearl.oraaa on Instagram"
                        className="mt-5 inline-flex items-center gap-2 text-sm transition hover:text-[#d8bd82]"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-[18px] w-[18px]"
                        >
                            <rect x="3" y="3" width="18" height="18" rx="5" />
                            <circle cx="12" cy="12" r="4" />
                            <circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" stroke="none" />
                        </svg>
                        <span>@pearl.oraaa</span>
                    </a>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-4 uppercase tracking-widest">Quick Links</h4>
                    <ul className="space-y-2 text-sm opacity-80">
                        <li><Link to="/home">Home</Link></li>
                        <li><Link to="/shop">Shop</Link></li>
                        <li><Link to="/collections">Collections</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-4 uppercase tracking-widest">Customer Care</h4>
                    <ul className="space-y-2 text-sm opacity-80">
                        <li><Link to="/orders">My Orders</Link></li>
                        <li><Link to="/wishlist">Wishlist</Link></li>
                        <li><Link to="/profile">Profile</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-4 uppercase tracking-widest">Newsletter</h4>
                    <p className="text-sm opacity-80 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
                    <div className="flex">
                        <input type="email" placeholder="Enter your email address" className="p-2 w-full text-[#1b4332] bg-[#f8f4ec] outline-none" />
                        <button className="bg-[#2d6a4f] px-4 text-white uppercase text-xs tracking-widest font-bold">Subscribe</button>
                    </div>
                </div>
            </div>
            <div className="text-center text-xs opacity-60 mt-10 border-t border-white/20 pt-6">
                &copy; {new Date().getFullYear()} Pearloraa. All rights reserved.
            </div>
        </footer>
    );
}
