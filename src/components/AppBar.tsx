import { Map, FileClock, IdCardLanyard } from "lucide-react"
import { Link, useLocation } from "react-router-dom"


export default function AppBar() {
    const { pathname } = useLocation()

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600">
            <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
                <Link
                    to="/"
                    className="inline-flex flex-col items-center justify-center px-5 group"
                >
                    <FileClock
                        className={`w-5 h-5 mb-2 ${pathname === "/"
                            ? "text-blue-400"
                            : "text-gray-500 dark:text-gray-400"
                            } group-hover:text-blue-600 dark:group-hover:text-blue-500`}
                    />
                    <span
                        className={`text-sm ${pathname === "/"
                            ? "text-blue-400 font-bold"
                            : "text-gray-500 dark:text-gray-400"
                            } group-hover:text-blue-600 dark:group-hover:text-blue-500`}
                    >
                        Schedule
                    </span>
                </Link>

                <Link
                    to="/map"
                    className="inline-flex flex-col items-center justify-center px-5 group"
                >
                    <Map
                        className={`w-5 h-5 mb-2 ${pathname === "/map"
                            ? "text-blue-400"
                            : "text-gray-500 dark:text-gray-400"
                            } group-hover:text-blue-600 dark:group-hover:text-blue-500`}
                    />
                    <span
                        className={`text-sm ${pathname === "/map"
                            ? "text-blue-400 font-bold"
                            : "text-gray-500 dark:text-gray-400"
                            } group-hover:text-blue-600 dark:group-hover:text-blue-500`}
                    >
                        Map
                    </span>
                </Link>

                <Link
                    to="/badge"
                    className="inline-flex flex-col items-center justify-center px-5 group"
                >
                    <IdCardLanyard
                        className={`w-5 h-5 mb-2 ${pathname === "/badge"
                            ? "text-blue-400"
                            : "text-gray-500 dark:text-gray-400"
                            } group-hover:text-blue-600 dark:group-hover:text-blue-500`}
                    />
                    <span
                        className={`text-sm ${pathname === "/badge"
                            ? "text-blue-400 font-bold"
                            : "text-gray-500 dark:text-gray-400"
                            } group-hover:text-blue-600 dark:group-hover:text-blue-500`}
                    >
                        Lanyard
                    </span>
                </Link>



            </div>
        </div>
    )
}

