export class PalError extends Error {
  code: 'loi_mang' | 'invalid_json' | 'bridge_loi';
  constructor(code: 'loi_mang' | 'invalid_json' | 'bridge_loi', message: string) {
    super(message);
    this.code = code;
  }
}
