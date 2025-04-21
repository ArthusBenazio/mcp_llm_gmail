import { GoogleWorkspaceServer } from "server/googleServer";

const server = new GoogleWorkspaceServer();
server.run().catch(console.error);