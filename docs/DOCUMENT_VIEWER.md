# Secure document viewing

TaxBox stores ciphertext in Railway Buckets. Authorized users still see the original document.

## View path

1. Browser requests `GET /api/documents/:id`.
2. TaxBox derives identity and tenant scope from the authenticated server-side session.
3. The document row is joined to its workspace and firm.
4. Cross-firm access returns not-found.
5. Client sessions may only read the single TaxBox workspace attached to their invite/session.
6. TaxBox writes a `DOCUMENT_VIEWED` audit event.
7. TaxBox retrieves ciphertext from the Railway Bucket.
8. The firm's data encryption key is unwrapped through the configured KMS.
9. The object is decrypted in application memory.
10. The original PDF/image is streamed to the browser with `Content-Disposition: inline`.
11. The response is `private, no-store`; there is no public or presigned bucket URL.

## Download path

`GET /api/documents/:id?download=1` follows the same authorization and decryption path, writes `DOCUMENT_DOWNLOADED`, and returns `Content-Disposition: attachment`.

## Important

The route is deliberately fail-closed until the hardened TaxBox session implementation is connected. Do not replace it with request headers, query-string firm IDs, or other client-controlled identity.

The next security milestone is adapting the tested Empleados staff auth/TOTP + scoped PostgreSQL/RLS model to TaxBox.
