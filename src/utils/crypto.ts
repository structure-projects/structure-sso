export function md5(str: string): string {
  let md5String = '';
  const rotateLeft = (value: number, amount: number): number => {
    const tmp = value << amount;
    const tmp2 = (value >>> (32 - amount)) & 0xFFFFFFFF;
    return (tmp | tmp2) & 0xFFFFFFFF;
  };

  const addUnsigned = (x: number, y: number): number => {
    const lsw = (x & 0xFFFF) + (y & 0xFFFF);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
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

  const convertToWordArray = (str: string): number[] => {
    const wordArray: number[] = [];
    for (let i = 0; i < str.length * 8; i += 8) {
      wordArray[i >> 5] |= (str.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
    }
    return wordArray;
  };

  const strLen = str.length;
  const wordArray = convertToWordArray(str);
  const bitLen = strLen * 8;

  wordArray[bitLen >> 5] |= 0x80 << (24 - (bitLen % 32));
  wordArray[((bitLen + 64) >>> 9 << 4) + 14] = bitLen;

  let a = 0x67452301;
  let b = 0xEFCDAB89;
  let c = 0x98BADCFE;
  let d = 0x10325476;

  for (let i = 0; i < wordArray.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = FF(a, b, c, d, wordArray[i], 7, 0xD76AA478);
    d = FF(d, a, b, c, wordArray[i + 1], 12, 0xE8C7B756);
    c = FF(c, d, a, b, wordArray[i + 2], 17, 0x242070DB);
    b = FF(b, c, d, a, wordArray[i + 3], 22, 0xC1BDCEEE);
    a = FF(a, b, c, d, wordArray[i + 4], 7, 0xF57C0FAF);
    d = FF(d, a, b, c, wordArray[i + 5], 12, 0x4787C62A);
    c = FF(c, d, a, b, wordArray[i + 6], 17, 0xA8304613);
    b = FF(b, c, d, a, wordArray[i + 7], 22, 0xFD469501);
    a = FF(a, b, c, d, wordArray[i + 8], 7, 0x698098D8);
    d = FF(d, a, b, c, wordArray[i + 9], 12, 0x8B44F7AF);
    c = FF(c, d, a, b, wordArray[i + 10], 17, 0xFFFF5BB1);
    b = FF(b, c, d, a, wordArray[i + 11], 22, 0x895CD7BE);
    a = FF(a, b, c, d, wordArray[i + 12], 7, 0x6B901122);
    d = FF(d, a, b, c, wordArray[i + 13], 12, 0xFD987193);
    c = FF(c, d, a, b, wordArray[i + 14], 17, 0xA679438E);
    b = FF(b, c, d, a, wordArray[i + 15], 22, 0x49B40821);

    a = GG(a, b, c, d, wordArray[i + 1], 5, 0xF61E2562);
    d = GG(d, a, b, c, wordArray[i + 6], 9, 0xC040B340);
    c = GG(c, d, a, b, wordArray[i + 11], 14, 0x265E5A51);
    b = GG(b, c, d, a, wordArray[i], 20, 0xE9B6C7AA);
    a = GG(a, b, c, d, wordArray[i + 5], 5, 0xD62F105D);
    d = GG(d, a, b, c, wordArray[i + 10], 9, 0x02441453);
    c = GG(c, d, a, b, wordArray[i + 15], 14, 0xD8A1E681);
    b = GG(b, c, d, a, wordArray[i + 4], 20, 0xE7D3FBC8);
    a = GG(a, b, c, d, wordArray[i + 9], 5, 0x21E1CDE6);
    d = GG(d, a, b, c, wordArray[i + 14], 9, 0xC33707D6);
    c = GG(c, d, a, b, wordArray[i + 3], 14, 0xF4D50D87);
    b = GG(b, c, d, a, wordArray[i + 8], 20, 0x455A14ED);
    a = GG(a, b, c, d, wordArray[i + 13], 5, 0xA9E3E905);
    d = GG(d, a, b, c, wordArray[i + 2], 9, 0xFCEFA3F8);
    c = GG(c, d, a, b, wordArray[i + 7], 14, 0x676F02D9);
    b = GG(b, c, d, a, wordArray[i + 12], 20, 0x8D2A4C8A);

    a = HH(a, b, c, d, wordArray[i + 5], 4, 0xFFFA3942);
    d = HH(d, a, b, c, wordArray[i + 8], 11, 0x8771F681);
    c = HH(c, d, a, b, wordArray[i + 11], 16, 0x6D9D6122);
    b = HH(b, c, d, a, wordArray[i + 14], 23, 0xFDE5380C);
    a = HH(a, b, c, d, wordArray[i + 1], 4, 0xA4BEEA44);
    d = HH(d, a, b, c, wordArray[i + 4], 11, 0x4BDECFA9);
    c = HH(c, d, a, b, wordArray[i + 7], 16, 0xF6BB4B60);
    b = HH(b, c, d, a, wordArray[i + 10], 23, 0xBEBFBC70);
    a = HH(a, b, c, d, wordArray[i + 13], 4, 0x289B7EC6);
    d = HH(d, a, b, c, wordArray[i], 11, 0xEAA127FA);
    c = HH(c, d, a, b, wordArray[i + 3], 16, 0xD4EF3085);
    b = HH(b, c, d, a, wordArray[i + 6], 23, 0x04881D05);
    a = HH(a, b, c, d, wordArray[i + 9], 4, 0xD9D4D039);
    d = HH(d, a, b, c, wordArray[i + 12], 11, 0xE6DB99E5);
    c = HH(c, d, a, b, wordArray[i + 15], 16, 0x1FA27CF8);
    b = HH(b, c, d, a, wordArray[i + 2], 23, 0xC4AC5665);

    a = II(a, b, c, d, wordArray[i], 6, 0xF4292244);
    d = II(d, a, b, c, wordArray[i + 7], 10, 0x432AFF97);
    c = II(c, d, a, b, wordArray[i + 14], 15, 0xAB9423A7);
    b = II(b, c, d, a, wordArray[i + 5], 21, 0xFC93A039);
    a = II(a, b, c, d, wordArray[i + 12], 6, 0x655B59C3);
    d = II(d, a, b, c, wordArray[i + 3], 10, 0x8F0CCC92);
    c = II(c, d, a, b, wordArray[i + 10], 15, 0xFFEFF47D);
    b = II(b, c, d, a, wordArray[i + 1], 21, 0x85845DD1);
    a = II(a, b, c, d, wordArray[i + 8], 6, 0x6FA87E4F);
    d = II(d, a, b, c, wordArray[i + 15], 10, 0xFE2CE6E0);
    c = II(c, d, a, b, wordArray[i + 6], 15, 0xA3014314);
    b = II(b, c, d, a, wordArray[i + 13], 21, 0x4E0811A1);
    a = II(a, b, c, d, wordArray[i + 4], 6, 0xF7537E82);
    d = II(d, a, b, c, wordArray[i + 11], 10, 0xBD3AF235);
    c = II(c, d, a, b, wordArray[i + 2], 15, 0x2AD7D2BB);
    b = II(b, c, d, a, wordArray[i + 9], 21, 0xEB86D391);

    a = addUnsigned(a, olda);
    b = addUnsigned(b, oldb);
    c = addUnsigned(c, oldc);
    d = addUnsigned(d, oldd);
  }

  const toHex = (val: number): string => {
    let hex = '';
    for (let i = 0; i < 4; i++) {
      hex += ((val >> (8 * (3 - i))) & 0xFF).toString(16).padStart(2, '0');
    }
    return hex;
  };

  md5String = toHex(a) + toHex(b) + toHex(c) + toHex(d);
  return md5String.toLowerCase();
}
