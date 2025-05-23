const sharp = require('sharp');
const fs = require('fs').promises; // For asynchronous file operations
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Default input image path
const DEFAULT_IMAGE_PATH = 'image.png';
// Default resize factor (1/5th of original width)
const DEFAULT_RESIZE_FACTOR = 5;
// ASCII characters used to represent pixel intensity
const ASCII_CHAR_RANGE = ['.', ',', ':', ';', '+', '*', '?', '%', 'S', '#', '@'];

/**
 * Processes an image file using Sharp.
 *
 * @param {string} imagePath Path to the image file.
 * @param {number} resizeFactor Factor by which to divide the image width for resizing.
 * @returns {Promise<{data: Buffer, info: sharp.OutputInfo}>} A promise that resolves with the raw pixel data and image info.
 */
async function processImage(imagePath, resizeFactor) {
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  return image
    .resize(Math.round(metadata.width / resizeFactor))
    .gamma()
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
}

/**
 * Maps raw pixel data to an ASCII art string.
 *
 * @param {Buffer} data The raw pixel data buffer.
 * @param {sharp.OutputInfo} info Image information (width, height, channels).
 * @param {string[]} characterRange Array of ASCII characters to use for mapping.
 * @returns {string} The generated ASCII art string.
 */
function mapPixelsToAscii(data, info, characterRange) {
  // If 'data' is a Node.js Buffer, use its underlying ArrayBuffer.
  // If 'data' is already an ArrayBuffer (e.g., from tests), use it directly.
  const sourceArrayBuffer = (data.buffer instanceof ArrayBuffer && data.byteLength !== undefined) ? data.buffer : data;
  const rawPixelData = new Uint8ClampedArray(sourceArrayBuffer);
  let asciiArtString = ""; // Initialize an empty string
  const { width } = info;

  for (let i = 0; i < rawPixelData.length; i++) {
    const pixelIntensity = rawPixelData[i];
    const charIndex = Math.round(pixelIntensity / 255 * (characterRange.length - 1));
    asciiArtString += characterRange[charIndex] + ' '; // Append character and space
    if ((i + 1) % width === 0) { // Check (i+1) because loop is 0-indexed
      asciiArtString += '\n'; // Append newline
    }
  }
  return asciiArtString; // Return the concatenated string
}

/**
 * Parses and validates command-line arguments using yargs.
 * @returns {object} The parsed arguments object.
 */
function parseAndValidateArguments() {
  // DEFAULT_IMAGE_PATH, DEFAULT_RESIZE_FACTOR are accessible here as they are in the module scope.
  return yargs(hideBin(process.argv))
    .usage('Usage: $0 [imagePath] [options]')
    .positional('imagePath', {
      describe: 'Path to the input image file.',
      type: 'string',
      default: DEFAULT_IMAGE_PATH,
    })
    .option('resizeFactor', {
      alias: 'r',
      describe: 'Factor by which to divide the image width for resizing. Must be a positive number.',
      type: 'number',
      default: DEFAULT_RESIZE_FACTOR,
    })
    .option('customCharRangeString', {
      alias: 'c',
      describe: 'A string of characters to use for the ASCII art. e.g., ".:-=+*#%@".',
      type: 'string',
      default: undefined, // So we can default to ASCII_CHAR_RANGE
    })
    .option('outputFilePath', {
      alias: 'o',
      describe: 'Path to save the ASCII art. If not provided, prints to console.',
      type: 'string',
      default: undefined, // So script can print to console by default
    })
    .check((argv) => {
      if (argv.resizeFactor <= 0) {
        throw new Error('Error: Resize factor must be a positive number.');
      }
      return true;
    })
    .help()
    .alias('help', 'h')
    .version('1.0.0') // Placeholder version
    .argv;
}

/**
 * Main function to convert an image to ASCII art.
 */
async function main() {
  const argv = parseAndValidateArguments(); // Get the arguments

  const { imagePath, resizeFactor, customCharRangeString, outputFilePath } = argv;

  let currentCharRange = ASCII_CHAR_RANGE; // Default
  if (customCharRangeString && customCharRangeString.length > 0) {
    currentCharRange = customCharRangeString.split('');
    if (currentCharRange.length === 0) {
      console.warn("Warning: Custom character range string resulted in an empty array. Using default range.");
      currentCharRange = ASCII_CHAR_RANGE;
    }
  }

  try {
    const { data, info } = await processImage(imagePath, resizeFactor);
    const asciiArt = mapPixelsToAscii(data, info, currentCharRange);
    
    try {
      if (outputFilePath && outputFilePath.length > 0) {
        await fs.writeFile(outputFilePath, asciiArt);
        console.log(`ASCII art saved to ${outputFilePath}`);
      } else {
        console.log(asciiArt); // Default to console output
      }
    } catch (outputError) {
      // Be specific about where the error occurred
      const target = outputFilePath ? `file "${outputFilePath}"` : "console";
      console.error(`Error writing ASCII art to ${target}:`, outputError.message);
      process.exit(1);
    }

  } catch (processingError) {
    console.error(`Error processing image "${imagePath}":`, processingError.message);
    process.exit(1); 
  }
}

// Only run main if the script is executed directly
if (require.main === module) {
  main();
}

module.exports = { mapPixelsToAscii, processImage, DEFAULT_IMAGE_PATH, DEFAULT_RESIZE_FACTOR, ASCII_CHAR_RANGE, parseAndValidateArguments };
