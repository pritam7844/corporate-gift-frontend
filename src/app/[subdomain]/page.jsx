'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import api from '../../lib/api';
import { Building2, Gift, ChevronRight, Star, Heart, Calendar, ArrowRight, MessageSquare, Briefcase, ShoppingCart } from 'lucide-react';

export default function CompanyLandingPage() {
    const { subdomain } = useParams();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const addToCart = useCartStore((state) => state.addToCart);

    const [company, setCompany] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        if (useAuthStore.persist.hasHydrated()) {
            setIsHydrated(true);
        } else {
            const unsub = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
            return () => unsub();
        }
    }, []);

    useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            router.replace(`/${subdomain}/login`);
        }
    }, [isHydrated, isAuthenticated, subdomain, router]);

    useEffect(() => {
        const fetchPortalData = async () => {
            if (!isAuthenticated) return;
            try {
                // 1. Fetch Company Info
                const companyRes = await api.get(`/companies/portal/${subdomain}`);
                setCompany(companyRes.data.data);

                // 2. Fetch Active Events for this Company
                const eventsRes = await api.get('/events/my-events');
                setEvents(eventsRes.data.data || []);
            } catch (error) {
                console.error("Failed to load portal data", error);
            } finally {
                setLoading(false);
            }
        };

        if (isHydrated && isAuthenticated) {
            fetchPortalData();
        }
    }, [subdomain, isAuthenticated, isHydrated]);

    const handleAddToCart = (product, eventId) => {
        addToCart(
            {
                _id: product._id,
                name: product.name,
                image: product.image,
                price: product.price || 0, // Fallback if price doesn't exist
            },
            1,
            company?._id,
            eventId
        );
        // Optional: Show toast notification
        alert(`Added ${product.name} to cart!`);
    };

    if (!isHydrated || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Safety check: if not authenticated, component will return null while redirecting
    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200">
            {/* Minimalistic Navbar - Only show if NOT authenticated (guest). If authenticated, EmployeeNavbar takes over! */}
            {!isAuthenticated && (
                <nav className="border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                    <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {company?.logo ? (
                                <img src={company.logo} alt="Company Logo" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                            ) : (
                                <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center font-bold">
                                    {subdomain?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="text-lg font-semibold tracking-tight capitalize">{company?.name || subdomain}</span>
                        </div>
                        <div className="flex space-x-6">
                            <button onClick={() => document.getElementById('events').scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-gray-600 hover:text-black transition">Events</button>
                            <button onClick={() => document.getElementById('faq').scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-gray-600 hover:text-black transition">FAQ</button>
                            <button onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-gray-600 hover:text-black transition">Contact</button>

                            <button onClick={() => router.push(`/${subdomain}/login`)} className="text-sm font-medium bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800 transition">
                                Login to Portal
                            </button>
                        </div>
                    </div>
                </nav>
            )}

            <main>
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col md:flex-row items-center justify-between">
                    <div className="md:w-1/2 pr-0 md:pr-8 text-center md:text-left mb-16 md:mb-0 relative z-10">
                        <div className="inline-flex items-center space-x-2 bg-gray-50 text-gray-600 border border-gray-200 px-4 py-2 rounded-full text-sm font-semibold mb-8">
                            <Star size={16} className="text-yellow-500" />
                            <span>Exclusive for {company?.name || subdomain} Employees</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tighter mb-6 leading-[1.05] text-gray-900">
                            Reward your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                milestones.
                            </span>
                        </h1>
                        <p className="text-xl text-gray-500 mb-10 max-w-xl leading-relaxed font-medium mx-auto md:mx-0">
                            We are thrilled to celebrate your achievements. Log in to claim your exclusive corporate gifts and participate in upcoming events.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                            {!isAuthenticated ? (
                                <button onClick={() => router.push(`/${subdomain}/login`)} className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center shadow-lg shadow-gray-200">
                                    Claim Your Gift <ArrowRight size={20} className="ml-2" />
                                </button>
                            ) : (
                                <button onClick={() => router.push('/dashboard')} className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center shadow-lg shadow-gray-200">
                                    Go to Dashboard <ArrowRight size={20} className="ml-2" />
                                </button>
                            )}
                            <button onClick={() => document.getElementById('events').scrollIntoView({ behavior: 'smooth' })} className="bg-white border text-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center">
                                View Events
                            </button>
                        </div>
                    </div>

                    <div className="md:w-1/2 relative w-full flex justify-center md:justify-end">
                        {/* Decorative background blobs */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-50 to-purple-50 rounded-full blur-3xl opacity-70 -z-10"></div>

                        {/* Realistic Image Card */}
                        <div className="relative w-full max-w-lg rounded-[2.5rem] bg-gray-50 border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden aspect-square flex flex-col items-center justify-center transform hover:scale-[1.02] transition-transform duration-500">
                            <img
                                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1200&auto=format&fit=crop"
                                alt="Premium Corporate Gift Box"
                                className="w-full h-full object-cover"
                            />
                            {/* Optional subtle gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </section>

                {/* Events & Products Section */}
                <section id="events" className="max-w-6xl mx-auto px-6 py-24 border-t border-gray-100">
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Current Events</h2>
                        <p className="text-gray-500 text-lg max-w-2xl">Discover active programs and the curated selection of items available for you to choose from.</p>
                    </div>

                    {!isAuthenticated ? (
                        <div className="p-12 border border-gray-200 rounded-2xl text-center bg-gray-50">
                            <Calendar size={40} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Events are Private</h3>
                            <p className="text-gray-500 mb-6">Please log in to your employee account to view active events and available rewards.</p>
                            <button onClick={() => router.push(`/${subdomain}/login`)} className="border border-gray-300 bg-white px-6 py-2 rounded-md font-medium hover:bg-gray-50 transition">
                                Login to View
                            </button>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="p-12 border border-gray-200 rounded-2xl text-center text-gray-500 font-medium">
                            No active events currently available.
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {events.map((event) => (
                                <div key={event._id} className="border border-gray-200 rounded-2xl p-8">
                                    <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                                        <div>
                                            <h3 className="text-2xl font-semibold mb-2">{event.name}</h3>
                                            <p className="text-gray-500 flex items-center">
                                                <Calendar size={16} className="mr-2" />
                                                Closes on {new Date(event.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium capitalize">
                                            {event.status}
                                        </span>
                                    </div>

                                    <h4 className="text-lg font-medium mb-6">Available Items</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {event.products?.map((product) => (
                                            <div key={product._id} className="group flex flex-col h-full border border-transparent hover:border-gray-200 hover:shadow-xl rounded-2xl p-4 transition-all bg-white relative">
                                                <div className="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden border border-gray-200">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Gift size={32} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">{product.category}</p>
                                                        <h5 className="font-medium text-gray-900 leading-tight mb-2">{product.name}</h5>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddToCart(product, event._id)}
                                                        className="mt-4 w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-2 rounded-xl transition-colors flex items-center justify-center space-x-2"
                                                    >
                                                        <ShoppingCart size={16} />
                                                        <span>Add to Cart</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* FAQ Section */}
                <section id="faq" className="bg-gray-50 py-24 border-t border-gray-200">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
                            <p className="text-gray-500 text-lg">Everything you need to know about the product and billing.</p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { q: "How do I claim a gift?", a: "Log in to your portal, navigate to the active event, select your preferred item, and proceed to checkout. It's completely free!" },
                                { q: "Where does the gift get shipped?", a: "During the checkout process, you will be prompted to enter your preferred shipping address. It can be sent to the office or directly to your home." },
                                { q: "Can I exchange an item?", a: "Exchanges are strictly handled on a case-by-case basis before the event closes. Please contact support immediately if you made an error." },
                            ].map((faq, i) => (
                                <div key={i} className="border border-gray-200 bg-white p-6 rounded-xl">
                                    <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                                    <p className="text-gray-500 leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="max-w-6xl mx-auto px-6 py-24 border-t border-gray-200">
                    <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">Loved by Employees</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Sarah J.", role: "Engineering", quote: "The process was incredibly smooth. I received my welcome kit within 3 days of joining!" },
                            { name: "Michael T.", role: "Marketing", quote: "Such a great initiative by the company. The quality of the products offered is truly premium." },
                            { name: "Priya R.", role: "Operations", quote: "Loved how easy it was to pick my Diwali gift this year. Great UI and flawless delivery." }
                        ].map((t, i) => (
                            <div key={i} className="border border-gray-200 p-8 rounded-2xl flex flex-col justify-between">
                                <div className="mb-6">
                                    <Star className="text-yellow-400 mb-4" size={24} fill="currentColor" />
                                    <p className="text-gray-700 leading-relaxed text-lg">"{t.quote}"</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{t.name}</p>
                                    <p className="text-gray-500 text-sm">{t.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="bg-gray-50 py-24 border-t border-gray-200">
                    <div className="max-w-md mx-auto px-6">
                        <div className="text-center mb-10">
                            <MessageSquare className="mx-auto mb-4 text-gray-400" size={32} />
                            <h2 className="text-3xl font-bold tracking-tight mb-2">Need Help?</h2>
                            <p className="text-gray-500">Reach out to our support team.</p>
                        </div>
                        <form className="space-y-4 bg-white p-8 rounded-2xl border border-gray-200" onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.target;
                            const submitBtn = form.querySelector('button[type="submit"]');

                            const name = form.name.value;
                            const email = form.email.value;
                            const message = form.message.value;

                            if (!name || !email || !message) {
                                alert('Please fill in all fields.');
                                return;
                            }

                            submitBtn.disabled = true;
                            submitBtn.innerHTML = 'Sending...';

                            try {
                                await api.post('/support', {
                                    name, email, message, companyId: company?._id
                                });
                                alert('Support ticket submitted successfully!');
                                form.reset();
                            } catch (error) {
                                console.error('Failed to submit support ticket', error);
                                alert('Failed to submit ticket. Please try again later.');
                            } finally {
                                submitBtn.disabled = false;
                                submitBtn.innerHTML = 'Send Message';
                            }
                        }}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" name="name" required className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" name="email" required className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition" placeholder="john@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea name="message" required rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition" placeholder="How can we help?"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-black text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition mt-2 disabled:opacity-70">
                                Send Message
                            </button>
                        </form>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 py-10 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} Corporate Gift Platform. All rights reserved.</p>
            </footer>
        </div>
    );
}
