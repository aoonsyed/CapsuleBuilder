import React from "react";

export default function Step5ExportOptions({ email, onNext }) {
    const handleDownload = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/download-pdf?email=${email}`);

            if (!response.ok) {
                throw new Error("Download failed");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${email}_techpack.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            if (onNext) onNext(); // Move to next step
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download tech pack.");
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-12 p-8 font-sans text-white bg-black/40 border border-white backdrop-blur-md rounded-lg shadow-lg space-y-6">
            <h2 className="text-3xl font-normal">Export Your Capsule</h2>
            <p className="text-sm text-white/70">
                You’ve finished your capsule. Download your personalized tech pack to take the next step.
            </p>

            <button
                onClick={handleDownload}
                className="bg-white text-black px-6 py-2 text-sm font-medium hover:bg-gray-200 transition rounded"
            >
                Download PDF →
            </button>
        </div>
    );
}
