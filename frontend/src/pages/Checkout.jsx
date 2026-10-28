
import { useState } from "react";
import { API_ORIGIN } from "../api/axios";

export default function Checkout() {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: "",

        // Customization
        customizationName: "",
        customizationNote: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError("");

        const whatsappNumber = "919995391397";
        const token =
            localStorage.getItem("access_token") ||
            sessionStorage.getItem("access_token");

        try {
            const response = await fetch(
                `${API_ORIGIN}/api/orders/create/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        full_name: formData.name,
                        phone: formData.phone,
                        address_line_1: formData.address,
                        city: formData.city,
                        state: formData.state,
                        pincode: formData.pincode,
                        notes: [
                            formData.customizationName
                                ? `Name to customize: ${formData.customizationName}`
                                : "",
                            formData.customizationNote
                                ? `Customization note: ${formData.customizationNote}`
                                : "",
                        ]
                            .filter(Boolean)
                            .join("\n"),
                    }),
                }
            );
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        (response.status === 401
                            ? "Your session has expired. Please sign in again."
                            : "Unable to create your order. Please try again.")
                );
            }

            const order = data.order;
            const orderItems = (order.items || [])
                .map(
                    (item) =>
                        `• ${item.product_name} × ${item.quantity} — ₹${Number(
                            item.subtotal
                        ).toLocaleString("en-IN")}`
                )
                .join("\n");
            const message = `Hello! I would like to confirm my order.

*ORDER DETAILS*
Order number: ${order.order_number}
${orderItems}
Total: ₹${Number(order.total_amount).toLocaleString("en-IN")}

*CUSTOMER DETAILS*
Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email || "Not provided"}
Address: ${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}

*CUSTOMIZATION*
Name to customize: ${formData.customizationName || "Not applicable"}
Instructions: ${formData.customizationNote || "None"}

Please confirm availability, payment, and delivery details.`;

            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                message
            )}`;
            window.location.assign(whatsappURL);
        } catch (error) {
            setSubmitError(error.message || "Unable to place your order.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">

                {/* HEADER */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Checkout
                    </h1>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                        Please enter your details and customization requirements.
                        Your order will be confirmed through WhatsApp.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {submitError && (
                        <div
                            role="alert"
                            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            {submitError}
                        </div>
                    )}

                    {/* MAIN CARD */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">

                        {/* CUSTOMER DETAILS */}
                        <div>
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Customer Details
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Enter your delivery and contact information.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                {/* NAME */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Full Name{" "}
                                        <span className="text-red-500">*</span>
                                    </label>

                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        required
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />
                                </div>

                                {/* PHONE */}
                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Phone Number{" "}
                                        <span className="text-red-500">*</span>
                                    </label>

                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter your phone number"
                                        required
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />
                                </div>

                                {/* EMAIL */}
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Email Address{" "}
                                        <span className="text-xs font-normal text-gray-400">
                                            (Optional)
                                        </span>
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email address"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />
                                </div>

                                {/* ADDRESS */}
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="address"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Address{" "}
                                        <span className="text-red-500">*</span>
                                    </label>

                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="House name, street, area..."
                                        rows={4}
                                        required
                                        className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />
                                </div>

                                {/* CITY */}
                                <div>
                                    <label
                                        htmlFor="city"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        City{" "}
                                        <span className="text-red-500">*</span>
                                    </label>

                                    <input
                                        id="city"
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Enter your city"
                                        required
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />
                                </div>

                                {/* STATE */}
                                <div>
                                    <label
                                        htmlFor="state"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        State{" "}
                                        <span className="text-red-500">*</span>
                                    </label>

                                    <input
                                        id="state"
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="Enter your state"
                                        required
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />
                                </div>

                                {/* PIN CODE */}
                                <div>
                                    <label
                                        htmlFor="pincode"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        PIN Code{" "}
                                        <span className="text-red-500">*</span>
                                    </label>

                                    <input
                                        id="pincode"
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        placeholder="Enter PIN code"
                                        maxLength={6}
                                        required
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />
                                </div>

                            </div>
                        </div>

                        {/* DIVIDER */}
                        <div className="my-8 border-t border-gray-200" />

                        {/* CUSTOMIZATION */}
                        <div>
                            <div className="mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">✨</span>

                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Customization
                                    </h2>
                                </div>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    If your product requires customization, enter the
                                    name and any special instructions below.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5">

                                {/* CUSTOMIZATION NAME */}
                                <div>
                                    <label
                                        htmlFor="customizationName"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Name to Customize
                                    </label>

                                    <input
                                        id="customizationName"
                                        type="text"
                                        name="customizationName"
                                        value={formData.customizationName}
                                        onChange={handleChange}
                                        placeholder="Example: Fathima"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />

                                    <p className="mt-2 text-xs text-gray-400">
                                        Enter the exact name you want on the necklace
                                        or customized product.
                                    </p>
                                </div>

                                {/* CUSTOMIZATION NOTE */}
                                <div>
                                    <label
                                        htmlFor="customizationNote"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Customization Note{" "}
                                        <span className="text-xs font-normal text-gray-400">
                                            (Optional)
                                        </span>
                                    </label>

                                    <textarea
                                        id="customizationNote"
                                        name="customizationNote"
                                        value={formData.customizationNote}
                                        onChange={handleChange}
                                        placeholder="Any special request? Example: Gold finish, specific font, etc."
                                        rows={4}
                                        className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />
                                </div>

                            </div>
                        </div>

                        {/* WHATSAPP INFO */}
                        <div className="mt-8 rounded-xl border border-green-100 bg-green-50 p-4 sm:p-5">
                            <div className="flex items-start gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-lg text-white">
                                    💬
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        Order via WhatsApp
                                    </h3>

                                    <p className="mt-1 text-sm leading-5 text-gray-600">
                                        When you click the button below, WhatsApp will
                                        open with your customer details and customization
                                        information already filled in.
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-green-500 px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-green-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            <span className="text-xl">💬</span>

                            {isSubmitting
                                ? "Opening WhatsApp..."
                                : "Proceed to WhatsApp"}
                        </button>

                        <p className="mt-3 text-center text-xs leading-5 text-gray-400">
                            No online payment is required. Your order will be
                            confirmed through WhatsApp.
                        </p>

                    </div>
                </form>

            </div>
        </div>
    );
}
