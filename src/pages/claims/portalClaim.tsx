import DefaultLayout from "@/config/layout";

export default function PortalClaimPage() {

    return (
        <DefaultLayout>
        <div className="flex flex-col gap-4 p-4">
            <h1 className="text-2xl font-bold">Portal Claim</h1>
            <p className="text-gray-600">Esta es la página del portal de reclamaciones.</p>
        </div>
        </DefaultLayout>
    );
    }