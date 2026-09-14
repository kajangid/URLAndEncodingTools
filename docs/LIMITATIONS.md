# Limitations & Boundaries

Understanding the operational boundaries, performance constraints, and security limits of `@kjangid/url-encode-tools`.

---

## 1. Input & Memory Limits

1. **Maximum URL Length**:
   - `url-validator` defaults to a `maxLength` of 2048 characters (matching standard legacy browser and HTTP client constraints).
   - This can be adjusted via the `maxLength` configuration option.

2. **Query String Nesting Depth**:
   - `query-string` enforces a default recursion depth limit of `5` levels for nested bracketed objects (e.g. `a[b][c][d][e]`).
   - Any deeper nesting will flatten values into arrays or primitives rather than continuing recursion to protect against stack overflow attacks.
   - The depth limit can be customized using `depth` in `ParseOptions`.

3. **Hexadecimal String Length**:
   - Hex decoding strictly requires an even number of characters (excluding optional `0x` prefixes and whitespace). Odd-length strings will throw an `Error`.

---

## 2. Security Boundaries

1. **HTML Sanitization vs. Escaping**:
   - `stripHtml` extracts raw text from HTML tags using simple regex matching.
   - It is **not** an HTML sanitizer. If you need rich-text markup sanitization (e.g., retaining safe tags like `<b>` while stripping `<script>`), use a dedicated sanitizer like DOMPurify.
   - `escapeHtml` and `escapeAttribute` provide full escaping against XSS when injecting untrusted strings into HTML contexts.

2. **Prototype Pollution**:
   - Keys matching `__proto__`, `constructor`, or `prototype` are discarded on parse.
   - Query string dictionaries are instantiated as null-prototype objects (`Object.create(null)`).
   - Standard object methods (like `hasOwnProperty`, `toString`) are not directly available on parsed dictionaries unless accessed via `Object.prototype` or `safeHasOwn`.

---

## 3. Platform & Runtime Support

1. **Node.js**:
   - Minimum supported Node.js version is **18.0.0**. Older versions (Node 14, 16) are not supported.

2. **Browser Support**:
   - Requires modern environments providing `URL`, `URLSearchParams`, `TextEncoder`, and `TextDecoder`. Legacy Internet Explorer is not supported.
