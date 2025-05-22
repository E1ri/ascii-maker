const { mapPixelsToAscii, ASCII_CHAR_RANGE } = require('./proc');

describe('mapPixelsToAscii', () => {
  test('Test Case 1: Simple mapping', () => {
    const data = new Uint8ClampedArray([0, 128, 255]);
    const info = { width: 3, height: 1 };
    // Using a simple character range for predictable mapping
    // ASCII_CHAR_RANGE has 11 chars.
    // 0   -> index 0 -> ASCII_CHAR_RANGE[0]
    // 128 -> index 5 -> ASCII_CHAR_RANGE[5] (Math.round(128/255 * 10))
    // 255 -> index 10 -> ASCII_CHAR_RANGE[10]
    const characterRange = ASCII_CHAR_RANGE; // Use the default one for this test as per instruction
    
    // Expected: ASCII_CHAR_RANGE[0] + ' ' + ASCII_CHAR_RANGE[5] + ' ' + ASCII_CHAR_RANGE[10] + ' ' + '\n'
    const expectedOutput = `${characterRange[0]} ${characterRange[Math.round(128/255 * (characterRange.length -1))]} ${characterRange[characterRange.length - 1]} \n`;
    expect(mapPixelsToAscii(data.buffer, info, characterRange)).toBe(expectedOutput);
  });

  test('Test Case 2: Newline character for 2x2 image', () => {
    // Intensities: 0, 64, 128, 255
    // Mapping to ASCII_CHAR_RANGE (11 chars):
    // 0   -> index 0  -> ASCII_CHAR_RANGE[0]
    // 64  -> index 2  -> ASCII_CHAR_RANGE[2] (Math.round(64/255 * 10))
    // 128 -> index 5  -> ASCII_CHAR_RANGE[5] (Math.round(128/255 * 10))
    // 255 -> index 10 -> ASCII_CHAR_RANGE[10] (Math.round(255/255 * 10))
    const data = new Uint8ClampedArray([0, 64, 128, 255]);
    const info = { width: 2, height: 2 };
    const characterRange = ASCII_CHAR_RANGE;

    const char0 = characterRange[0];
    const char64 = characterRange[Math.round(64/255 * (characterRange.length -1))];
    const char128 = characterRange[Math.round(128/255 * (characterRange.length -1))];
    const char255 = characterRange[characterRange.length - 1];

    // Expected:
    // char0 + ' ' + char64 + ' ' + '\n' +
    // char128 + ' ' + char255 + ' ' + '\n'
    const expectedOutput = `${char0} ${char64} \n${char128} ${char255} \n`;
    expect(mapPixelsToAscii(data.buffer, info, characterRange)).toBe(expectedOutput);
  });

  test('Test Case 3: Edge pixel values', () => {
    const data = new Uint8ClampedArray([0, 255]);
    const info = { width: 2, height: 1 };
    const characterRange = ASCII_CHAR_RANGE;
    
    // Expected: ASCII_CHAR_RANGE[0] + ' ' + ASCII_CHAR_RANGE[10] + ' ' + '\n'
    const expectedOutput = `${characterRange[0]} ${characterRange[characterRange.length - 1]} \n`;
    expect(mapPixelsToAscii(data.buffer, info, characterRange)).toBe(expectedOutput);
  });

  test('Test with a custom small character range', () => {
    const customRange = ['a', 'b', 'c'];
    // Intensities: 0, 128, 255
    // Mapping to customRange (3 chars):
    // 0   -> index 0 -> 'a' (Math.round(0/255 * 2))
    // 128 -> index 1 -> 'b' (Math.round(128/255 * 2))
    // 255 -> index 2 -> 'c' (Math.round(255/255 * 2))
    const data = new Uint8ClampedArray([0, 128, 255]);
    const info = { width: 3, height: 1 };

    const expectedOutput = `a b c \n`;
    expect(mapPixelsToAscii(data.buffer, info, customRange)).toBe(expectedOutput);
  });
});
