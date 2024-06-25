import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DapRegistration, InvalidRegistrationId, RegistrationId } from '../../server/utils/dap-js/registration'
import { DidJwk } from '@web5/dids';

describe('DapRegistration', () => {
  let registration: DapRegistration;

  beforeEach(() => {
    registration = DapRegistration.create({ handle: 'handle', did: 'did', domain: 'domain' });
  });

  describe('computeDigest', () => {
    it('computes a digest of the payload', async () => {
      const digest = await registration.computeDigest();
      expect(digest).toBeInstanceOf(Uint8Array);
    });
  });

  describe('create', () => {
    it('generates a unique ID each time', () => {
      const another = DapRegistration.create({ handle: 'handle', did: 'did', domain: 'domain' });
      expect(registration.id.toString()).not.toEqual(another.id.toString());
    });
  });

  describe('parse', () => {
    it('throws InvalidRegistrationId for invalid Registration IDs', () => {
    });

    it('returns an instance of DapRegistration if parsing is successful', async () => {
      const alice = await DidJwk.create();
      const registration = DapRegistration.create({
        handle: 'alice',
        did: alice.uri,
        domain: 'domain.com',
      });

      await registration.sign(alice);

      const jsonRegistration = JSON.stringify(registration);
      const parsedRegistration = await DapRegistration.parse(jsonRegistration);

      expect(jsonRegistration).toEqual(JSON.stringify(parsedRegistration));
    });
  });
});

describe('RegistrationId', () => {
  let registrationId: RegistrationId;

  beforeEach(async () => {
    registrationId = RegistrationId.create();
  });

  describe('constructor', () => {
    it('generates a unique ID each time', () => {
      const another = RegistrationId.create();
      expect(registrationId.toString()).not.toEqual(another.toString());
    });
  });

  describe('extractDate', () => {
    it('returns a Date object', () => {
      const date = registrationId.extractDate();
      expect(date).toBeInstanceOf(Date);
    });

    it('returns a date close to the current time', () => {
      const date = registrationId.extractDate();
      const now = new Date();
      const diffInMs = Math.abs(now.getTime() - date.getTime());
      expect(diffInMs).toBeLessThan(1000); // Within 1 second
    });
  });

  describe('extractTimestamp', () => {
    it('returns a number', () => {
      const timestamp = registrationId.extractTimestamp();
      expect(typeof timestamp).toBe('number');
    });

    it('is consistent with extractDate', () => {
      const timestamp = registrationId.extractTimestamp();
      const date = registrationId.extractDate();
      expect(timestamp).toBe(date.getTime());
    });
  });

  describe('toString', () => {
    it('returns a string with the expected prefix', () => {
      expect(registrationId.toString()).toMatch(/^reg_/);
    });
  });

  describe('parse', () => {
    it('throws InvalidRegistrationId for invalid Registration IDs', () => {
      let registrationId = 'reg_1234567890abcdef';
      expect(() => RegistrationId.parse(registrationId)).toThrow(InvalidRegistrationId);
      expect(() => RegistrationId.parse(registrationId)).toThrowError('Invalid length');

      registrationId = '1234567890abcdef1234567890';
      expect(() => RegistrationId.parse(registrationId)).toThrowError('prefix must be "reg"');
    });
  });

  describe('timestamp precision', () => {
    it('has millisecond precision', () => {
      vi.useFakeTimers()
      const timestamp1 =  RegistrationId.create().extractTimestamp();
      vi.advanceTimersByTime(1);
      const timestamp2 =  RegistrationId.create().extractTimestamp();
      vi.useRealTimers()

      // The difference should be exactly 1 millisecond.
      const diffInMs = Math.abs(timestamp2 - timestamp1);
      expect(diffInMs).toBe(1);
    });
  });

  describe('timestamp range', () => {
    it('handles dates far in the future', async () => {
      const futureDate = new Date('2100-01-01T00:00:00Z');

      vi.useFakeTimers()
      vi.setSystemTime(futureDate)
      const futureId = RegistrationId.create();
      vi.useRealTimers()

      expect(futureId.extractDate()).toEqual(futureDate);
    });
  });

  it('handles dates in the past', () => {
    const pastDate = new Date('1970-01-02T00:00:00Z');

    vi.useFakeTimers()
    vi.setSystemTime(pastDate)
    const pastId = RegistrationId.create();
    vi.useRealTimers()

    expect(pastId.extractDate()).toEqual(pastDate);
  });
});