"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaGoogle, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function NavbarHome() {
    const { data: session, status } = useSession();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;
    return (
        <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-black shadow-md p-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo and User Name (Right Side) */}
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold text-white">Buy Me A Coffee</h1>
                </div>

                {/* Profile Dropdown and Sign-In Button (Left Side) */}
                <div className="flex items-center space-x-4">
                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-gray-700 dark:text-white focus:outline-none"
                        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>

                    {status === "loading" ? (
                        <p>Loading...</p>
                    ) : session ? (
                        <div className="relative">
                            <button
                                className="flex items-center space-x-2 focus:outline-none"
                                onMouseEnter={() => setDropdownOpen(true)}
                                onMouseLeave={() => setDropdownOpen(false)}
                            >
                                <img
                                    src={session.user?.image ?? ""}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full"
                                />
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-700 border rounded-lg shadow-lg p-4 z-10"
                                        onMouseEnter={() => setDropdownOpen(true)}
                                        onMouseLeave={() => setDropdownOpen(false)}
                                    >
                                        <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                                            <strong>Email:</strong> {session.user?.email}
                                        </p>
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="mt-2 w-full bg-red-500 hover:bg-red-700 text-white py-2 rounded flex items-center justify-center space-x-2"
                                        >
                                            <FaSignOutAlt />
                                            <span>Logout</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center space-x-2"
                            onClick={() => signIn("google", { prompt: "select_account", callbackUrl: "/dashboard" })}
                        >
                            <FaGoogle />
                            <span>Sign in with Google</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden mt-4 space-y-4"
                    >
                        {session && (
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="w-full bg-red-500 hover:bg-red-700 text-white py-2 rounded flex items-center justify-center space-x-2"
                            >
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}