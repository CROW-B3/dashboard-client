import type { ImageLoaderProps } from "next/image";
import process from "node:process";

const normalizeSrc = (src: string) => {
        return src.startsWith("/") ? src.slice(1) : src;
};

export default function cloudflareLoader({
        src,
        width,
        quality,
}: ImageLoaderProps) {
        if (src.startsWith("http://") || src.startsWith("https://")) {
                return src;
        }

        if (process.env.NODE_ENV === "development") {
                return src;
        }

        const params = [
                `width=${width}`,
                `quality=${quality || 85}`,
                "format=auto",
                "fit=scale-down",
                "metadata=none",
                "sharpen=1",
        ];

        if (width <= 640) {
                params.push("compression=fast");
        }

        const paramsString = params.join(",");

        return `/cdn-cgi/image/${paramsString}/${normalizeSrc(src)}`;
}
