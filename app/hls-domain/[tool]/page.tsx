import ToolPage, { toolMetadata, toolParams, type ToolProps } from "../../hls/ToolPage";
import { onDomain } from "../../hls/place";

export const dynamicParams = false;
export const generateStaticParams = toolParams;
export const generateMetadata = toolMetadata;

export default function Page(props: ToolProps) {
  return <ToolPage place={onDomain} {...props} />;
}
