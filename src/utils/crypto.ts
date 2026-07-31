/**
 * 标准 MD5 实现（RFC 1321），与 Hutool DigestUtil.md5Hex 输出完全一致
 * - UTF-8 编码输入
 * - 小端序处理
 * - 小写十六进制输出
 */
export function md5(str: string): string {
  // UTF-8 编码
  const utf8 = unescape(encodeURIComponent(str));

  const rotateLeft = (value: number, amount: number): number => {
    return ((value << amount) | (value >>> (32 - amount))) >>> 0;
  };

  const addUnsigned = (x: number, y: number): number => {
    return (x + y) >>> 0;
  };

  const F = (x: number, y: number, z: number): number => (x & y) | (~x & z);
  const G = (x: number, y: number, z: number): number => (x & z) | (y & ~z);
  const H = (x: number, y: number, z: number): number => x ^ y ^ z;
  const I = (x: number, y: number, z: number): number => y ^ (x | ~z);

  const FF = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, F(b, c, d)), addUnsigned(x, ac)), s), b);
  const GG = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, G(b, c, d)), addUnsigned(x, ac)), s), b);
  const HH = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, H(b, c, d)), addUnsigned(x, ac)), s), b);
  const II = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, I(b, c, d)), addUnsigned(x, ac)), s), b);

  // 小端序：将字符串转换为字数组
  const convertToWordArray = (input: string): number[] => {
    const wordArray: number[] = [];
    const len = input.length;
    for (let i = 0; i < len * 8; i += 8) {
      wordArray[i >> 5] = (wordArray[i >> 5] || 0) | ((input.charCodeAt(i / 8) & 0xff) << (i % 32));
    }
    return wordArray;
  };

  const wordArray = convertToWordArray(utf8);
  const bitLen = utf8.length * 8;

  // 填充
  wordArray[bitLen >> 5] = (wordArray[bitLen >> 5] || 0) | (0x80 << (bitLen % 32));
  wordArray[(((bitLen + 64) >>> 9) << 4) + 14] = bitLen;

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let i = 0; i < wordArray.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = FF(a, b, c, d, wordArray[i] || 0, 7, 0xd76aa478);
    d = FF(d, a, b, c, wordArray[i + 1] || 0, 12, 0xe8c7b756);
    c = FF(c, d, a, b, wordArray[i + 2] || 0, 17, 0x242070db);
    b = FF(b, c, d, a, wordArray[i + 3] || 0, 22, 0xc1bdceee);
    a = FF(a, b, c, d, wordArray[i + 4] || 0, 7, 0xf57c0faf);
    d = FF(d, a, b, c, wordArray[i + 5] || 0, 12, 0x4787c62a);
    c = FF(c, d, a, b, wordArray[i + 6] || 0, 17, 0xa8304613);
    b = FF(b, c, d, a, wordArray[i + 7] || 0, 22, 0xfd469501);
    a = FF(a, b, c, d, wordArray[i + 8] || 0, 7, 0x698098d8);
    d = FF(d, a, b, c, wordArray[i + 9] || 0, 12, 0x8b44f7af);
    c = FF(c, d, a, b, wordArray[i + 10] || 0, 17, 0xffff5bb1);
    b = FF(b, c, d, a, wordArray[i + 11] || 0, 22, 0x895cd7be);
    a = FF(a, b, c, d, wordArray[i + 12] || 0, 7, 0x6b901122);
    d = FF(d, a, b, c, wordArray[i + 13] || 0, 12, 0xfd987193);
    c = FF(c, d, a, b, wordArray[i + 14] || 0, 17, 0xa679438e);
    b = FF(b, c, d, a, wordArray[i + 15] || 0, 22, 0x49b40821);

    a = GG(a, b, c, d, wordArray[i + 1] || 0, 5, 0xf61e2562);
    d = GG(d, a, b, c, wordArray[i + 6] || 0, 9, 0xc040b340);
    c = GG(c, d, a, b, wordArray[i + 11] || 0, 14, 0x265e5a51);
    b = GG(b, c, d, a, wordArray[i] || 0, 20, 0xe9b6c7aa);
    a = GG(a, b, c, d, wordArray[i + 5] || 0, 5, 0xd62f105d);
    d = GG(d, a, b, c, wordArray[i + 10] || 0, 9, 0x02441453);
    c = GG(c, d, a, b, wordArray[i + 15] || 0, 14, 0xd8a1e681);
    b = GG(b, c, d, a, wordArray[i + 4] || 0, 20, 0xe7d3fbc8);
    a = GG(a, b, c, d, wordArray[i + 9] || 0, 5, 0x21e1cde6);
    d = GG(d, a, b, c, wordArray[i + 14] || 0, 9, 0xc33707d6);
    c = GG(c, d, a, b, wordArray[i + 3] || 0, 14, 0xf4d50d87);
    b = GG(b, c, d, a, wordArray[i + 8] || 0, 20, 0x455a14ed);
    a = GG(a, b, c, d, wordArray[i + 13] || 0, 5, 0xa9e3e905);
    d = GG(d, a, b, c, wordArray[i + 2] || 0, 9, 0xfcefa3f8);
    c = GG(c, d, a, b, wordArray[i + 7] || 0, 14, 0x676f02d9);
    b = GG(b, c, d, a, wordArray[i + 12] || 0, 20, 0x8d2a4c8a);

    a = HH(a, b, c, d, wordArray[i + 5] || 0, 4, 0xfffa3942);
    d = HH(d, a, b, c, wordArray[i + 8] || 0, 11, 0x8771f681);
    c = HH(c, d, a, b, wordArray[i + 11] || 0, 16, 0x6d9d6122);
    b = HH(b, c, d, a, wordArray[i + 14] || 0, 23, 0xfde5380c);
    a = HH(a, b, c, d, wordArray[i + 1] || 0, 4, 0xa4beea44);
    d = HH(d, a, b, c, wordArray[i + 4] || 0, 11, 0x4bdecfa9);
    c = HH(c, d, a, b, wordArray[i + 7] || 0, 16, 0xf6bb4b60);
    b = HH(b, c, d, a, wordArray[i + 10] || 0, 23, 0xbebfbc70);
    a = HH(a, b, c, d, wordArray[i + 13] || 0, 4, 0x289b7ec6);
    d = HH(d, a, b, c, wordArray[i] || 0, 11, 0xeaa127fa);
    c = HH(c, d, a, b, wordArray[i + 3] || 0, 16, 0xd4ef3085);
    b = HH(b, c, d, a, wordArray[i + 6] || 0, 23, 0x04881d05);
    a = HH(a, b, c, d, wordArray[i + 9] || 0, 4, 0xd9d4d039);
    d = HH(d, a, b, c, wordArray[i + 12] || 0, 11, 0xe6db99e5);
    c = HH(c, d, a, b, wordArray[i + 15] || 0, 16, 0x1fa27cf8);
    b = HH(b, c, d, a, wordArray[i + 2] || 0, 23, 0xc4ac5665);

    a = II(a, b, c, d, wordArray[i] || 0, 6, 0xf4292244);
    d = II(d, a, b, c, wordArray[i + 7] || 0, 10, 0x432aff97);
    c = II(c, d, a, b, wordArray[i + 14] || 0, 15, 0xab9423a7);
    b = II(b, c, d, a, wordArray[i + 5] || 0, 21, 0xfc93a039);
    a = II(a, b, c, d, wordArray[i + 12] || 0, 6, 0x655b59c3);
    d = II(d, a, b, c, wordArray[i + 3] || 0, 10, 0x8f0ccc92);
    c = II(c, d, a, b, wordArray[i + 10] || 0, 15, 0xffeff47d);
    b = II(b, c, d, a, wordArray[i + 1] || 0, 21, 0x85845dd1);
    a = II(a, b, c, d, wordArray[i + 8] || 0, 6, 0x6fa87e4f);
    d = II(d, a, b, c, wordArray[i + 15] || 0, 10, 0xfe2ce6e0);
    c = II(c, d, a, b, wordArray[i + 6] || 0, 15, 0xa3014314);
    b = II(b, c, d, a, wordArray[i + 13] || 0, 21, 0x4e0811a1);
    a = II(a, b, c, d, wordArray[i + 4] || 0, 6, 0xf7537e82);
    d = II(d, a, b, c, wordArray[i + 11] || 0, 10, 0xbd3af235);
    c = II(c, d, a, b, wordArray[i + 2] || 0, 15, 0x2ad7d2bb);
    b = II(b, c, d, a, wordArray[i + 9] || 0, 21, 0xeb86d391);

    a = addUnsigned(a, olda);
    b = addUnsigned(b, oldb);
    c = addUnsigned(c, oldc);
    d = addUnsigned(d, oldd);
  }

  // 小端序输出
  const toHex = (val: number): string => {
    let hex = '';
    for (let i = 0; i < 4; i++) {
      hex += ((val >>> (i * 8)) & 0xff).toString(16).padStart(2, '0');
    }
    return hex;
  };

  return (toHex(a) + toHex(b) + toHex(c) + toHex(d)).toLowerCase();
}