import ToolPage, { toolMetadata, toolParams, type ToolProps } from "../ToolPage";
import { onMain } from "../place";

export const dynamicParams = false;
export const generateStaticParams = toolParams;
export const generateMetadata = toolMetadata;

export default function Page(props: ToolProps) {
  return <ToolPage place={onMain} {...props} />;
}
