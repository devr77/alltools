import HubPage, { hubMetadata } from "../hls/HubPage";
import { onDomain } from "../hls/place";

export const metadata = hubMetadata;

export default function Page() {
  return <HubPage place={onDomain} />;
}
