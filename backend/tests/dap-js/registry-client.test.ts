import { DidJwk } from '@web5/dids';
import { describe, expect, it } from 'vitest';

import { DapRegistration } from '../../server/utils/dap-js/registration';
import { DapRegistryClient } from '../../server/utils/dap-js/registry-client';

describe('DapRegistryClient', () => {
  it('should register a DAP', async () => {
    const alice = await DidJwk.create();

    const registration = DapRegistration.create({
      handle: 'carol',
      did: alice.uri,
      domain: 'domain.com',
    });

    await registration.sign(alice);

    const client = new DapRegistryClient();
    client.register(registration);

    const dap = DapRegistration.create({
      handle: 'bob',
      did: alice.uri,
      domain: 'domain.com',
    });

    await dap.sign(alice);

    const result = await client.register(dap);
  });
});