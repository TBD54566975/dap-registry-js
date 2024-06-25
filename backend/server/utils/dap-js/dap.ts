export class Dap {
  static readonly PREFIX = '@';
  static readonly SEPARATOR = '/';

  private static readonly DAP_REGEX = new RegExp(`^${Dap.PREFIX}([^${Dap.PREFIX}${Dap.SEPARATOR}]+)${Dap.SEPARATOR}([^${Dap.PREFIX}${Dap.SEPARATOR}]+)$`);

  constructor(
    public handle: string,
    public domain: string
  ) {}

  toString(): string {
    return `${Dap.PREFIX}${this.handle}${Dap.SEPARATOR}${this.domain}`;
  }

  static parse(dap: string): Dap {
    const match = dap.match(Dap.DAP_REGEX);
    if (!match) {
      throw new InvalidDap();
    }
    
    const [, handle, domain] = match;
    
    return new Dap(handle, domain);
  }
}

export class InvalidDap extends Error {
  constructor(message?: string) {
    super(message ?? 'Invalid DAP');
    this.name = 'InvalidDap';
  }
}