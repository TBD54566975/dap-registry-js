import { DapRegistration } from "./registration";

export class DapRegistryClient {
  async register(registration: DapRegistration): Promise<void> {
    const response = await fetch('http://localhost:3000/daps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registration),
    })
  }
}