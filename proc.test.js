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

const { parseAndValidateArguments, DEFAULT_IMAGE_PATH, DEFAULT_RESIZE_FACTOR } = require('./proc');

describe('parseAndValidateArguments', () => {
  let originalArgv;

  beforeEach(() => {
    // Save original process.argv
    originalArgv = [...process.argv];
  });

  afterEach(() => {
    // Restore original process.argv after each test
    process.argv = originalArgv;
  });

  test('should return default values when no arguments are provided', () => {
    process.argv = ['node', 'proc.js']; // Simulates no user arguments
    const args = parseAndValidateArguments();
    expect(args.imagePath).toBe(DEFAULT_IMAGE_PATH);
    expect(args.resizeFactor).toBe(DEFAULT_RESIZE_FACTOR);
    expect(args.customCharRangeString).toBeUndefined();
    expect(args.outputFilePath).toBeUndefined();
  });

  test('should correctly parse provided imagePath', () => {
    process.argv = ['node', 'proc.js', 'myImage.png'];
    const args = parseAndValidateArguments();
    expect(args.imagePath).toBe('myImage.png');
    expect(args.resizeFactor).toBe(DEFAULT_RESIZE_FACTOR); // Default
  });

  test('should correctly parse provided resizeFactor using -r alias', () => {
    process.argv = ['node', 'proc.js', '-r', '10'];
    const args = parseAndValidateArguments();
    expect(args.imagePath).toBe(DEFAULT_IMAGE_PATH); // Default
    expect(args.resizeFactor).toBe(10);
  });
  
  test('should correctly parse provided resizeFactor using --resizeFactor', () => {
    process.argv = ['node', 'proc.js', '--resizeFactor', '7'];
    const args = parseAndValidateArguments();
    expect(args.imagePath).toBe(DEFAULT_IMAGE_PATH); // Default
    expect(args.resizeFactor).toBe(7);
  });

  test('should correctly parse provided customCharRangeString using -c alias', () => {
    process.argv = ['node', 'proc.js', '-c', '123'];
    const args = parseAndValidateArguments();
    expect(args.customCharRangeString).toBe('123');
  });

  test('should correctly parse provided customCharRangeString using --customCharRangeString', () => {
    process.argv = ['node', 'proc.js', '--customCharRangeString', 'xyz'];
    const args = parseAndValidateArguments();
    expect(args.customCharRangeString).toBe('xyz');
  });

  test('should correctly parse provided outputFilePath using -o alias', () => {
    process.argv = ['node', 'proc.js', '-o', 'output.txt'];
    const args = parseAndValidateArguments();
    expect(args.outputFilePath).toBe('output.txt');
  });

  test('should correctly parse provided outputFilePath using --outputFilePath', () => {
    process.argv = ['node', 'proc.js', '--outputFilePath', 'another.txt'];
    const args = parseAndValidateArguments();
    expect(args.outputFilePath).toBe('another.txt');
  });

  test('should correctly parse a combination of arguments', () => {
    process.argv = ['node', 'proc.js', 'combo.png', '-r', '3', '-c', 'abc', '-o', 'combo_out.txt'];
    const args = parseAndValidateArguments();
    expect(args.imagePath).toBe('combo.png');
    expect(args.resizeFactor).toBe(3);
    expect(args.customCharRangeString).toBe('abc');
    expect(args.outputFilePath).toBe('combo_out.txt');
  });

  test('should use default imagePath if only options are provided', () => {
    process.argv = ['node', 'proc.js', '-r', '7', '-c', 'test'];
    const args = parseAndValidateArguments();
    expect(args.imagePath).toBe(DEFAULT_IMAGE_PATH);
    expect(args.resizeFactor).toBe(7);
    expect(args.customCharRangeString).toBe('test');
  });
  
  test('should correctly parse imagePath when it is after options (less common but yargs supports it)', () => {
    process.argv = ['node', 'proc.js', '-r', '8', 'afterOptions.jpg'];
    const args = parseAndValidateArguments();
    expect(args.imagePath).toBe('afterOptions.jpg');
    expect(args.resizeFactor).toBe(8);
  });

  test('should throw error for resizeFactor = 0', () => {
    process.argv = ['node', 'proc.js', '-r', '0'];
    expect(() => {
      parseAndValidateArguments();
    }).toThrow('Error: Resize factor must be a positive number.');
  });

  test('should throw error for negative resizeFactor', () => {
    process.argv = ['node', 'proc.js', '--resizeFactor', '-5'];
    expect(() => {
      parseAndValidateArguments();
    }).toThrow('Error: Resize factor must be a positive number.');
  });
  
  test('should correctly parse --help argument (yargs handles this by exiting, difficult to test directly without yargs internals)', () => {
    // This test is more conceptual. Yargs typically handles --help by printing and exiting.
    // We are testing that it *can* be parsed. Yargs .parse() will populate 'h' and 'help'.
    // If we were to run this in a real environment, the process would exit.
    // Here, we just check if yargs recognizes it internally.
    process.argv = ['node', 'proc.js', '--help'];
    const args = parseAndValidateArguments(); // yargs will process it.
    expect(args.help || args.h).toBeDefined(); // Check if yargs set the help flag
  });

  test('should correctly parse --version argument (yargs handles this by exiting, difficult to test directly)', () => {
    // Similar to --help, yargs handles --version by printing and exiting.
    process.argv = ['node', 'proc.js', '--version'];
    // In a test environment, we might not see the exit, but yargs will parse it.
    const args = parseAndValidateArguments();
    // Yargs sets the 'version' flag internally when --version is parsed.
    // This doesn't check the output, just that yargs has processed it.
    expect(args.version).toBeDefined(); 
  });
});
