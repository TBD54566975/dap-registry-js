export default defineEventHandler(() => {
  const registrationMetadata: RegistrationMetadata = {
    enabled: true,
    supportedDidMethods: ["dht", "web"],
  }

  return registrationMetadata;
});