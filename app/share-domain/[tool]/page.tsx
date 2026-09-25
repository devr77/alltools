import ToolPage, { toolMetadata, toolParams, type ToolProps } from "../../share/ToolPage";
import { onDomain } from "../../share/place";

export const dynamicParams = false;
export const generateStaticParams = toolParams;
export const generateMetadata = toolMetadata;

export default function Page(props: ToolProps) {
  return <ToolPage place={onDomain} {...props} />;
}
