import type { BearerDid } from "@web5/dids";

export default defineEventHandler(async event => {
  // Before inserting the DAP into the database, ensure the Registry's DID is available.
  let registryDid: BearerDid;
  try {
    registryDid = await useRegistryDid(event);
  } catch (error: any) {
    const message = error?.message ?? 'Failed to retrieve registry DID';
    return Response.json({ error: { message } }, { status: 500 });
  }
  return registryDid.document;
});