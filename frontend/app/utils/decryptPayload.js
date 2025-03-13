import bs58 from "bs58";
import nacl from "tweetnacl";
import { Buffer } from "buffer";

export const decryptPayload = (data, nonce, sharedSecret) => {
  const decryptedData = nacl.box.open.after(
    bs58.decode(data),
    bs58.decode(nonce),
    sharedSecret
  );
  if (!decryptedData) {
    throw new Error("Unable to decrypt data");
  }
  return JSON.parse(Buffer.from(decryptedData).toString("utf8"));
};