export default defineEventHandler(async event => {
  const handle = getRouterParam(event, 'handle');

  // Attempt to get the DAP from the database.

  let registeredDid: string;
  let originalRequest: object;

  try {
    const db = useDatabase('dap_registry');
    const dap = await db.query.daps.findFirst({
      where: (users, { eq }) => eq(daps.handle, handle),
    });
    registeredDid = dap.did;
    originalRequest = dap.proof as any;
  } catch (error: any) {
    const message = 'Failed to process request';
    return Response.json({ error: message }, { status: 500 });
  }

  if (!registeredDid) {
    const message = 'Handle not found';
    return Response.json({ error: { message } }, { status: 404 });
  }
  return {
    did: registeredDid,
    proof: originalRequest,
  }
});