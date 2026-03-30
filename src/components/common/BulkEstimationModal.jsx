'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Plus, Minus, Calculator, INFO, Info, ArrowRightLeft } from 'lucide-react';

export default function BulkEstimationModal({ isOpen, onClose, products }) {
    const [quantities, setQuantities] = useState({});
    const [baseQuantity, setBaseQuantity] = useState('');
    const [calculatedResults, setCalculatedResults] = useState(null);
    const modalContentRef = useRef(null);

    // Initialize quantities when modal opens or products change
    useEffect(() => {
        if (isOpen && products) {
            const initialQuantities = {};
            products.forEach(p => {
                initialQuantities[p._id] = 0;
            });
            setQuantities(initialQuantities);
            setBaseQuantity('');
            setCalculatedResults(null);
        }
    }, [isOpen, products]);

    const handleBaseQuantityChange = (val) => {
        const q = parseInt(val) || 0;
        setBaseQuantity(val);
        const newQuantities = {};
        products.forEach(p => {
            newQuantities[p._id] = q;
        });
        setQuantities(newQuantities);
    };

    const updateIndividualQuantity = (productId, val) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: Math.max(0, parseInt(val) || 0)
        }));
    };

    const calculateDiscount = (totalUnits) => {
        if (totalUnits === 0) return 0;
        if (totalUnits >= 500) return 35;
        if (totalUnits > 200) return 30; // 201 - 499
        return 25; // 0 - 200 (though 0 is handled above)
    };

    const handleCalculate = () => {
        const totalUnits = Object.values(quantities).reduce((sum, q) => sum + q, 0);
        const discountPercent = calculateDiscount(totalUnits);

        const items = products.map(p => {
            const qty = quantities[p._id] || 0;
            const mrp = p.actualPrice || 0;
            const discountAmount = (mrp * discountPercent) / 100;
            const pricePerUnit = mrp - discountAmount;
            const totalForProduct = pricePerUnit * qty;

            return {
                ...p,
                quantity: qty,
                mrp,
                pricePerUnit,
                totalForProduct
            };
        });

        const totalAmount = items.reduce((sum, item) => sum + item.totalForProduct, 0);

        setCalculatedResults({
            totalUnits,
            discountPercent,
            totalAmount,
            items
        });

        // Scroll down to show results
        setTimeout(() => {
            if (modalContentRef.current) {
                modalContentRef.current.scrollTo({
                    top: modalContentRef.current.scrollTop + 400,
                    behavior: 'smooth'
                });
            }
        }, 100);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-gray-100 animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="pr-8">
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                            <Calculator className="text-blue-600 shrink-0" size={20} />
                            Bulk Order Estimation
                        </h2>
                        <p className="text-[10px] sm:text-sm text-gray-500 font-medium mt-0.5 sm:mt-1">Check tiered discounts based on your total quantity</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div 
                    ref={modalContentRef}
                    className="flex-grow overflow-y-auto p-4 sm:p-8 bg-gray-50/50"
                >

                    {/* Bulk Input */}
                    <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-black text-gray-700 mb-2">Apply Quantity to All Products</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    value={baseQuantity}
                                    onChange={(e) => handleBaseQuantityChange(e.target.value)}
                                    placeholder="e.g. 100"
                                    className="w-40 sm:w-50 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold transition-all text-sm sm:text-base"
                                />
                                <span className="text-xs sm:text-sm font-bold text-gray-700">units each</span>
                            </div>
                        </div>
                        {/* <div className="flex flex-col gap-2">
                             <div className="flex items-center gap-2 text-[10px] sm:text-xs font-black">
                                <span className="px-2 py-1 bg-green-50 text-green-600 rounded-lg">1-200 units: 25% OFF</span>
                                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">201-500 units: 30% OFF</span>
                                <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-lg">500+ units: 35% OFF</span>
                             </div>
                        </div> */}
                    </div>

                    {/* Product List */}
                    <div className="space-y-3 sm:space-y-4">
                        <h3 className="text-xs sm:text-sm font-black text-gray-900 px-2 uppercase tracking-wider">Individual Product Quantities</h3>
                        {products.map((product) => (
                            <div key={product._id} className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4 hover:border-blue-100 transition-colors">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0">
                                    <img
                                        src={product.images?.[0] || product.image || '/placeholder.png'}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate text-sm sm:text-base">{product.name}</h4>
                                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">{product.category}</p>
                                    <p className="text-xs sm:text-sm font-black text-blue-600 mt-0.5">₹{product.actualPrice} <span className="text-[8px] sm:text-[10px] text-gray-400 font-medium uppercase">(MRP)</span></p>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <button
                                        onClick={() => updateIndividualQuantity(product._id, (quantities[product._id] || 0) - 1)}
                                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg sm:rounded-xl text-gray-400 hover:text-blue-600 transition-colors border border-gray-100"
                                    >
                                        <Minus size={14} className="sm:w-4 sm:h-4" />
                                    </button>
                                    <input
                                        type="number"
                                        value={quantities[product._id] || 0}
                                        onChange={(e) => updateIndividualQuantity(product._id, e.target.value)}
                                        className="w-10 sm:w-16 text-center font-black text-gray-900 outline-none text-xs sm:text-sm"
                                    />
                                    <button
                                        onClick={() => updateIndividualQuantity(product._id, (quantities[product._id] || 0) + 1)}
                                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg sm:rounded-xl text-gray-400 hover:text-blue-600 transition-colors border border-gray-100"
                                    >
                                        <Plus size={14} className="sm:w-4 sm:h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Results Display */}
                    {calculatedResults && (
                        <div className="mt-6 sm:mt-8 p-5 sm:p-8 bg-blue-600 rounded-[1.5rem] sm:rounded-[2rem] text-white shadow-xl shadow-blue-200 animate-in slide-in-from-bottom-4 duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center sm:text-left">
                                <div className="border-b sm:border-b-0 sm:border-r border-blue-400/30 pb-4 sm:pb-0 sm:pr-4">
                                    <p className="text-blue-100 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1">Total Units</p>
                                    <p className="text-3xl sm:text-4xl font-black">{calculatedResults.totalUnits}</p>
                                </div>
                                <div className="border-b sm:border-b-0 sm:border-r border-blue-400/30 pb-4 sm:pb-0 sm:pr-4">
                                    <p className="text-blue-100 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1">Applied Discount</p>
                                    <p className="text-3xl sm:text-4xl font-black">{calculatedResults.discountPercent}% OFF</p>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1 leading-tight">Estimated Total<br className="sm:hidden" /> (With GST*)</p>
                                    <p className="text-3xl sm:text-4xl font-black">₹{calculatedResults.totalAmount.toLocaleString('en-IN')}</p>
                                </div>
                            </div>

                            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-blue-500/30 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-center sm:text-left">
                                <div className="flex items-center gap-2 bg-blue-700/40 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold">
                                    <Info size={12} className="shrink-0" />
                                    Prices include GST.
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-[10px] sm:text-xs text-blue-100 font-bold">Estimation based on current pricing</p>
                                </div>
                            </div>

                            {/* Individual Detail Breakdown */}
                            <div className="mt-6 bg-white/10 rounded-xl overflow-hidden relative">
                                <div className="flex items-center justify-between mb-2 sm:hidden px-3 pt-3">
                                    <p className="text-[10px] text-blue-200 font-bold flex items-center gap-1 uppercase tracking-tighter">
                                        <ArrowRightLeft size={10} /> Swipe horizontal for more details
                                    </p>
                                </div>
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-[10px] sm:text-xs text-left min-w-[500px] sm:min-w-0">
                                        <thead>
                                            <tr className="border-b border-white/20 bg-white/5">
                                                <th className="p-3 font-black">Product</th>
                                                <th className="p-3 font-black text-center">Qty</th>
                                                <th className="p-3 font-black text-right">MRP</th>
                                                <th className="p-3 font-black text-right">Offer Price</th>
                                                <th className="p-3 font-black text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {calculatedResults.items.filter(i => i.quantity > 0).map(item => (
                                                <tr key={item._id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                                    <td className="p-3 truncate max-w-[120px] sm:max-w-[150px]">{item.name}</td>
                                                    <td className="p-3 text-center">{item.quantity}</td>
                                                    <td className="p-3 text-right">₹{item.mrp}</td>
                                                    <td className="p-3 text-right font-black">₹{item.pricePerUnit.toFixed(2)}</td>
                                                    <td className="p-3 text-right font-black">₹{item.totalForProduct.toLocaleString('en-IN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-8 py-4 sm:py-6 border-t border-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 bg-white sticky bottom-0 z-10">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-8 py-3 sm:py-4 text-gray-500 font-black hover:text-gray-900 transition-colors text-sm sm:text-base"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleCalculate}
                        className="w-full sm:w-auto px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                        <Calculator size={18} className="sm:w-5 sm:h-5" />
                        Calculate Estimation
                    </button>
                </div>
            </div>
        </div>
    );
}
