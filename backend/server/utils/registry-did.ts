import type { PortableDid } from '@web5/dids';
import type { H3Event, EventHandlerRequest } from 'h3';
import { BearerDid } from '@web5/dids';

export function isPortableDid(obj: unknown): obj is PortableDid {
  // Validate that the given value is an object that has the necessary properties of PortableDid.
  return !(!obj || typeof obj !== 'object' || obj === null)
    && 'uri' in obj
    && 'document' in obj
    && 'metadata' in obj
    && (!('keyManager' in obj) || obj.keyManager === undefined);
}

export async function useRegistryDid(event: H3Event<EventHandlerRequest>): Promise<BearerDid> {
  // Access the portable DID from the runtime configuration.
  let { portableDid } = useRuntimeConfig(event);

  // Note: On some platforms, when reading the portable DID from runtime environment variables,
  // it may be returned as a string or a string wrapped with extra single quotes.
  portableDid = typeof portableDid === 'string'
    ? JSON.parse(portableDid.replaceAll("'", ""))
    : portableDid;
  
  if (!isPortableDid(portableDid)) {
    throw new Error('Failed to access portable DID from runtime configuration')
  }

  let bearerDid: BearerDid;
  try {
    bearerDid = await BearerDid.import({ portableDid });
  } catch (error: any) {
    const errorMessage = error?.message ?? 'Unknown error';
    throw new Error(`Failed to import Bearer DID: ${errorMessage}`);
  }

  return bearerDid;
}