import HubPage, { hubMetadata } from "../share/HubPage";
import { onDomain } from "../share/place";

export const metadata = hubMetadata;

export default function Page() {
  return <HubPage place={onDomain} />;
}
