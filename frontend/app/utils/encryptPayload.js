import nacl from "tweetnacl";
import bs58 from "bs58";
import { Buffer } from "buffer";

export const encryptPayload = (payload, sharedSecret) => {
  const nonce = nacl.randomBytes(24);
  const encodedPayload = Buffer.from(JSON.stringify(payload));
  const encryptedPayload = nacl.box.after(encodedPayload, nonce, sharedSecret);
  return [nonce, encryptedPayload];
};