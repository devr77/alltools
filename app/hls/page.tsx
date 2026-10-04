import HubPage, { hubMetadata } from "./HubPage";
import { onMain } from "./place";

export const metadata = hubMetadata;

export default function Page() {
  return <HubPage place={onMain} />;
}
