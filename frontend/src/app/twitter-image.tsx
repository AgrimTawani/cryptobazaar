import { ImageResponse } from "next/og";
import Image from "./opengraph-image";
export { alt, size, contentType } from "./opengraph-image";

export const runtime = "edge";

export default Image;
