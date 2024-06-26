import type { BearerDid } from '@web5/dids';
import { PostgresError } from 'pg-error-enum';
import { DapRegistration } from '~/utils/dap-js/registration';

export default defineEventHandler(async event => {
  // Attempt to parse the request body as a DAP registration.
  let registration: DapRegistration;
  try {
    const body = await readBody(event, { strict: true });
    registration = await DapRegistration.parse(body);
  } catch (error: any) {
    const message = error?.message ?? 'Failed to parse DAP registration request';
    return Response.json({ error: { message } }, { status: 400 });
  }
  
  // Verify the registration request has a valid signature and is signed by the specified DID.
  try {
    await registration.verify();
  } catch (error: any) {
    const message = error?.message ?? 'Invalid DAP registration request';
    return Response.json({ error: { message } }, { status: 401 });
  }

  // Before inserting the DAP into the database, ensure the Registry's DID is available.
  let registryDid: BearerDid;
  try {
    registryDid = await useRegistryDid(event);
  } catch (error: any) {
    const message = error?.message ?? 'Failed to retrieve registry DID';
    return Response.json({ error: { message } }, { status: 500 });
  }

  // Attempt to insert the DAP registration into the database.
  const db = useDatabase();
  try {
    await db.insert(daps).values({
      id: registration.id.toString(),
      handle: registration.handle,
      did: registration.did,
      proof: registration,
    });
  } catch (error: any) {
    if (error.code === PostgresError.UNIQUE_VIOLATION) {
      let message: string;
      switch (error.constraint) {
        case 'daps_did_unique':
          message = 'DAP with the same DID already exists';
          break;
        case 'daps_id_unique':
          message = 'DAP with the same ID already exists';
          break;
        case 'daps_handle_unique':
          message = 'DAP with the same handle already exists';
          break;
        default:
          message = 'Failed to insert DAP';
          break;
      }
      return Response.json({ error: { message } }, { status: 409 });
    }
      
    // If the error is not a unique violation, return a generic error response.
    return Response.json({ error: { message: 'Registration Request Failed' } }, { status: 500 });
  }

  // Registration was successful, so sign the request with the registry's DID.
  await registration.sign(registryDid);

  // And return the signed proof of registration.
  return Response.json(
    { proof: registration },
    { status: 201 },
  );
});