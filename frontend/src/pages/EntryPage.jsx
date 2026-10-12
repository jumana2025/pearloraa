import { Link } from 'react-router-dom';

export default function EntryPage() {
    return (
        <div className="min-h-screen bg-[#f8f4ec] flex flex-col items-center justify-center p-6 text-[#1b4332]">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-widest uppercase text-center">
                Pearloraa
            </h1>
            <p className="text-lg md:text-xl mb-12 opacity-80 text-center max-w-lg">
                Welcome to Pearloraa. Please choose your destination below to continue.
            </p>
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
                <Link
                    to="/home"
                    className="flex-1 bg-[#1b4332] text-[#f8f4ec] py-12 px-6 rounded-lg shadow-lg hover:bg-[#2d6a4f] transition flex flex-col items-center justify-center border border-[#1b4332]"
                >
                    <span className="text-2xl font-bold uppercase tracking-widest mb-2">Shop Now</span>
                    <span className="text-sm opacity-80">Enter as a Customer</span>
                </Link>
                <Link
                    to="/admin/login"
                    className="flex-1 bg-transparent border-2 border-[#1b4332] text-[#1b4332] py-12 px-6 rounded-lg shadow-lg hover:bg-[#1b4332] hover:text-[#f8f4ec] transition flex flex-col items-center justify-center"
                >
                    <span className="text-2xl font-bold uppercase tracking-widest mb-2">Admin Portal</span>
                    <span className="text-sm opacity-80">Enter as an Administrator</span>
                </Link>
            </div>
        </div>
    );
}
