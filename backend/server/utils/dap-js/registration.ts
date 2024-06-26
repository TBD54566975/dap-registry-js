import { Convert } from '@web5/common';
import { BearerDid, DidJwk } from '@web5/dids';
import { typeid, TypeID } from 'typeid-js';

import { Crypto } from './crypto';

/**
 * Information about the DAP Registry
 */
export interface RegistrationMetadata {
  /** Indicates whether registration is enabled. */
  enabled: boolean;
  
  /** Supported DID methods. */
  supportedDidMethods?: string[];
}

/**
 * Represents the full DAP registration: metadata and signature.
 */
export interface RegistrationModel {
  id: string;
  handle: string;
  did: string;
  domain: string;
  signature: string;
}

export interface RegistrationRequest extends RegistrationModel {}

export interface RegistrationResponse {
  proof: RegistrationModel;
}

export interface ErrorResponse {
  error: {
    message: string;
  };
}

/**
 * Represents a unique identifier for a DAP registration.
 */
export class RegistrationId {
  /** The internal TypeID value with the 'reg' prefix. */
  private value: TypeID<'reg'>;

  /**
   * Creates a new RegistrationId instance.
   */
  constructor(id: TypeID<'reg'>) {
    this.value = id;
  }

  /**
   * Creates a new RegistrationId instance with a random UUID.
   */
  static create() {
    const id = typeid('reg');
    return new RegistrationId(id);
  }

  /**
   * Extracts the date from the registration ID.
   * 
   * @returns A Date object representing the timestamp encoded in the ID.
   */
  extractDate(): Date {
    const timestamp = this.extractTimestamp();

    return new Date(timestamp);
  }

  /**
   * Extracts the millisecond timestamp from the UUID.
   * 
   * @remarks
   * The first 6 bytes of the UUID are a timestamp in milliseconds since the Unix epoch.
   * 
   * @returns The timestamp in milliseconds.
   */
  extractTimestamp(): number {
    // Extract the first 12 alphanumeric characters from the UUID.
    const timestampHex = this.value.toUUID().slice(0, 13).replace('-', '');

    // Convert the hex string to a number.
    const timestampMilliseconds = parseInt(timestampHex, 16);

    return timestampMilliseconds;
  }
  
  /**
   * Converts the RegistrationId to its string representation.
   * 
   * @returns A string representation of the RegistrationId, including the 'reg' prefix.
   * 
   * @example
   * const regId = new RegistrationId();
   * console.log(regId.toString()); // Outputs: reg_1234567890abcdef...
   */
  toString(): string {
    return this.value.toString();
  }

  /**
   * Parses a string representation of a RegistrationId and returns a TypeID.
   * 
   * @param id - The string representation of a RegistrationId to parse.
   * @returns A TypeID representing the parsed RegistrationId.
   * @throws {InvalidRegistrationId} If the provided string is not a valid RegistrationId.
   * 
   * @example
   * const parsed = RegistrationId.parse('reg_1234567890abcdef...');
   */
    static parse(id: string): RegistrationId {
      try {
        const parsed = TypeID.fromString(id);
        if (parsed.getType() !== 'reg') {
          throw new InvalidRegistrationId('Registration ID prefix must be "reg"');
        }
        return new RegistrationId(parsed as TypeID<'reg'>);
      } catch (error: any) {
        throw new InvalidRegistrationId(error?.message);
      }
    }
}

export class DapRegistration {
  id: RegistrationId;
  handle: string;
  did: string;
  domain: string;
  signature?: string;

  /**
   * Constructor is primarily for intended for internal use. For a better developer experience,
   * consumers should use {@link DapRegistration.create} and {@link DapRegistration.parse} to
   * programmatically create and parse messages.
   */
  constructor(id: RegistrationId, handle: string, did: string, domain: string, signature?: string) {
    this.did = did;
    this.domain = domain;
    this.handle = handle;
    this.id = id;
    this.signature = signature;
  }

  /**
   * Computes a digest of the payload by:
   * 1. Initializing `payload` to a JSON object containing the registration ID, handle, DID, and domain.
   * 2. JSON Serializing the payload as per [RFC 8785: JSON Canonicalization Scheme](https://datatracker.ietf.org/doc/html/rfc8785).
   * 3. Computing the SHA-256 hash of the canonicalized payload.
   *
   * @returns The SHA-256 hash of the canonicalized payload, represented as a byte array.
   */
  async computeDigest(): Promise<Uint8Array> {
    const payload = {
      id: this.id.toString(),
      handle: this.handle,
      did: this.did,
      domain: this.domain
    };

    const digest = await Crypto.digest(payload);

    return digest;
  }

  /**
   * Creates a new DAP registration with the specified parameters.
   * @param params - The parameters required for creating a DAP registration. 
   * @returns {@link DapRegistration}
   */
  static create({ handle, did, domain }: { handle: string, did: string, domain: string }): DapRegistration {
    const id = RegistrationId.create();
    const registration = new DapRegistration(id, handle, did, domain);
    registration.validate();

    return registration;
  }

  /**
   * Parses a JSON message into a DAP registration.
   * @returns A promise that resolves to a {@link DapRegistration} instance.
   */
  static async parse(rawRequest: RegistrationRequest | string): Promise<DapRegistration> {
    const jsonRegistration = DapRegistration.#rawToRegistrationRequest(rawRequest);

    const registration = new DapRegistration(
      RegistrationId.parse(jsonRegistration.id),
      jsonRegistration.handle,
      jsonRegistration.did,
      jsonRegistration.domain,
      jsonRegistration.signature
    );

    await registration.verify();

    return registration;
  }

  /**
   * Signs the provided payload and produces a Compact JSON Web Signature (JWS).
   *
   * @param opts - The options required for signing.
   * @returns A promise that resolves to the generated compact JWS.
   * @throws Will throw an error if the specified algorithm is not supported.
   */
  async sign(did: BearerDid): Promise<void> {
    const payload = await this.computeDigest();
    this.signature = await Crypto.sign({ did, payload, detached: true });
  }

  /**
   * Validates the data in the DAP Registration.
   * @throws if the registration is invalid
   */
  validate(): void {
    // To be implemented...
  }

  /**
   * Verifies the integrity of the cryptographic signature
   * @throws if the signature is invalid
   * @throws if the signer's DID does not match the specified did.
   * @returns Signer's DID
   */
  async verify(): Promise<string> {
    if (this.signature === undefined) {
      throw new InvalidDapRegistration('Invalid DAP Registration: Signature is missing')
    }

    const payload = await this.computeDigest();
    const signerDid = await Crypto.verify({ jws: this.signature, detachedPayload: payload });

    if (this.did !== signerDid) { // Ensure that the DID that signed the payload matches the DID in the registration.
      throw new InvalidDapRegistration('Invalid DAP Registration: Expected registration to be signed by the specified DID');
    }
    
    return signerDid;
  }

  toJSON(): object {
    return {
      id: this.id.toString(),
      handle: this.handle,
      did: this.did,
      domain: this.domain,
      signature: this.signature,
    };
  }

  static #rawToRegistrationRequest(rawRequest: RegistrationRequest | string): RegistrationRequest {
    try {
      return typeof rawRequest === 'string' ? JSON.parse(rawRequest) : rawRequest;
    } catch (error: any) {
      const errorMessage = error?.message ?? 'Unknown error';
      throw new InvalidDapRegistration(`Failed to parse DAP registration: ${errorMessage}`);
    }
  }
}

export class InvalidDapRegistration extends Error {
  constructor(message?: string) {
    super(message ?? "Invalid DAP Registration");
    this.name = "InvalidDapRegistration";
  }
}

export class InvalidRegistrationId extends Error {
  constructor(message?: string) {
    super(message ?? "Invalid Registration ID");
    this.name = "InvalidRegistrationId";
  }
}