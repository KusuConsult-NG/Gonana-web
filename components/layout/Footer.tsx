import Link from "next/link";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="bg-card-light dark:bg-card-dark border-t border-border-light dark:border-border-dark mt-auto py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="relative h-8 w-8">
                                <Image
                                    src="/logo.png"
                                    alt="Gonana Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="font-display font-bold text-xl text-primary">Gonana</span>
                        </div>
                        <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark leading-relaxed">
                            Empowering farmers through decentralized technology. Connecting communities, cultivating growth.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-text-light dark:text-text-dark mb-4">Marketplace</h4>
                        <ul className="space-y-2 text-sm text-secondary-text-light dark:text-secondary-text-dark">
                            <li><Link href="/" className="hover:text-primary">Browse Produce</Link></li>
                            <li><Link href="/sell" className="hover:text-primary">Sell on Gonana</Link></li>
                            <li><Link href="/logistics" className="hover:text-primary">Shipping & Logistics</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-text-light dark:text-text-dark mb-4">Community</h4>
                        <ul className="space-y-2 text-sm text-secondary-text-light dark:text-secondary-text-dark">
                            <li><Link href="/feed" className="hover:text-primary">Community Feed</Link></li>
                            <li><Link href="#" className="hover:text-primary">Governance</Link></li>
                            <li><Link href="#" className="hover:text-primary">Events</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-text-light dark:text-text-dark mb-4">Stay Updated</h4>
                        <div className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                            <button className="bg-primary text-white text-sm font-medium py-2 rounded-md hover:bg-primary-dark transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
                <div className="border-t border-border-light dark:border-border-dark mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-secondary-text-light dark:text-secondary-text-dark">
                    <p>© 2024 Gonana Marketplace. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-primary">Privacy Policy</a>
                        <a href="#" className="hover:text-primary">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
