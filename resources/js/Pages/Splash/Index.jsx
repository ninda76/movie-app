import { Head, router } from "@inertiajs/react";
import { useEffect } from "react";
import LoadingScreen from "@/Components/LoadingScreen";

export default function Index() {

    useEffect(() => {

        const timer = setTimeout(() => {
            router.visit("/login");
        }, 3000);

        return () => clearTimeout(timer);

    }, []);

    return (
        <>
            <Head title="Loading" />

            <LoadingScreen />
        </>
    );
}