export default function FaqSection() {
    return (
        <section id="faq" className="bg-gray-50 py-24 border-t border-gray-200">
            <div className="max-w-4xl mx-auto px-6">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
                    <p className="text-gray-500 text-lg">Everything you need to know about the product and billing.</p>
                </div>
                <div className="space-y-4">
                    {[
                        { q: "How do I claim a gift?", a: "Log in to your portal, navigate to the active event, select your preferred item, and proceed to checkout." },
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
    );
}
