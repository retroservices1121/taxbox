import { openBytes, sealBytes } from "./aes";
import { getKms } from "./kms";

const PREFIX = "v1.";

function context(firmId:string,userId:string){
  return { app:"taxbox", purpose:"staff-totp", firmId, userId };
}

export async function encryptTotpSecret(secret:string,firmId:string,userId:string){
  const ctx=context(firmId,userId);
  const dataKey=await getKms().generateDataKey(ctx);
  try{
    const ciphertext=sealBytes(dataKey.plaintext,Buffer.from(secret,"utf8"),`taxbox:staff-totp:${firmId}:${userId}`);
    const envelope={
      k:dataKey.keyId,
      w:dataKey.ciphertext.toString("base64"),
      c:ciphertext.toString("base64")
    };
    return PREFIX+Buffer.from(JSON.stringify(envelope),"utf8").toString("base64url");
  }finally{
    dataKey.plaintext.fill(0);
  }
}

export async function decryptTotpSecret(value:string,firmId:string,userId:string){
  // Temporary backward compatibility for any administrator created before
  // encrypted TOTP storage was introduced.
  if(!value.startsWith(PREFIX)) return value;
  const envelope=JSON.parse(Buffer.from(value.slice(PREFIX.length),"base64url").toString("utf8")) as {k:string;w:string;c:string};
  if(!envelope.w||!envelope.c)throw new Error("Malformed TOTP secret envelope");
  const key=await getKms().decryptDataKey(Buffer.from(envelope.w,"base64"),context(firmId,userId));
  try{
    return openBytes(key,Buffer.from(envelope.c,"base64"),`taxbox:staff-totp:${firmId}:${userId}`).toString("utf8");
  }finally{
    key.fill(0);
  }
}
