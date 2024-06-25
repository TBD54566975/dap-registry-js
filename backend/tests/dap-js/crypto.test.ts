import { BearerDid, DidJwk } from '@web5/dids';
import { Convert } from '@web5/common';
import { describe, it, expect, beforeAll } from 'vitest';
import { canonicalize, Sha256 } from '@web5/crypto';

import { Crypto } from '../../server/utils/dap-js/crypto';

describe('Crypto', () => {
  describe('digest', () => {
    it('returns a string', async () => {
      const result = await Crypto.digest({ test: 'value' });
      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('returns a non-empty array', async () => {
      const result = await Crypto.digest({ test: 'value' });
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return the same digest for identical payloads', async () => {
      const payload = { a: 1, b: 'test' };
      const result1 = await Crypto.digest(payload);
      const result2 = await Crypto.digest(payload);
      expect(result1).toStrictEqual(result2);
    });

    it('should return different digests for different payloads', async () => {
      const result1 = await Crypto.digest({ a: 1 });
      const result2 = await Crypto.digest({ a: 2 });
      expect(result1).not.toStrictEqual(result2);
    });

    it('should handle nested objects', async () => {
      const payload = { a: 1, b: { c: 2, d: { e: 3 } } };
      const result = await Crypto.digest(payload);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle arrays', async () => {
      const payload = { a: [1, 2, 3], b: ['a', 'b', 'c'] };
      const result = await Crypto.digest(payload);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should be order-independent for object properties', async () => {
      const result1 = await Crypto.digest({ a: 1, b: 2 });
      const result2 = await Crypto.digest({ b: 2, a: 1 });
      expect(result1).toStrictEqual(result2);
    });

    it('should match a known good digest', async () => {
      const payload = { hello: 'world' };
      const expectedDigest = new Uint8Array([
        147, 162,  57, 113, 169,  20, 229, 234,
        203, 240, 168, 210,  81,  84, 205, 163,
          9, 195, 193, 199,  47, 187, 153,  20,
        212, 124,  96, 243, 203, 104,  21, 136,
      ])
      const result = await Crypto.digest(payload);
      expect(result).toStrictEqual(expectedDigest);
    });

    it('should correctly handle Unicode characters', async () => {
      const payload = { hello: '世界' };
      const result = await Crypto.digest(payload);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('sign', () => {
    let alice: BearerDid;

    beforeAll(async () => {
      alice = await DidJwk.create();
    });

    it('returns a Compact JWS string', async () => {
      const payload = { timestamp: new Date().toISOString() };
      const payloadBytes = Convert.object(payload).toUint8Array();

      const jws = await Crypto.sign({ did: alice, payload: payloadBytes, detached: false });

      expect(typeof jws).toBe('string');
      const { length } = jws.split('.');
      expect(length).toBe(3);
    });

    it('returns a Compact JWS string with detached payload', async () => {
      const payload = { timestamp: new Date().toISOString() };
      const payloadBytes = Convert.object(payload).toUint8Array();

      const jws = await Crypto.sign({ did: alice, payload: payloadBytes, detached: true });

      expect(typeof jws).toBe('string');
      const { length } = jws.split('.');
      expect(length).toBe(3);
    });
  });

  describe('verify', () => {
    let alice: BearerDid;

    beforeAll(async () => {
      alice = await DidJwk.create();
    });

    it('verifies Compact JWS', async () => {
      const payload = { timestamp: new Date().toISOString() };
      const payloadBytes = Convert.object(payload).toUint8Array();

      const jws = await Crypto.sign({ did: alice, payload: payloadBytes, detached: false });
      const signerDid = await Crypto.verify({ jws });

      expect(alice.uri).toEqual(signerDid);
    });

    it('verifies Compact JWS with detached payload', async () => {
      const payload = { timestamp: new Date().toISOString() };
      const payloadBytes = Convert.object(payload).toUint8Array();

      const jws = await Crypto.sign({ did: alice, payload: payloadBytes, detached: true });
      const signerDid = await Crypto.verify({ jws, detachedPayload: payloadBytes });

      expect(alice.uri).toEqual(signerDid);
    });
  });
});